import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

import { initInvoice } from "@telegram-apps/sdk"

// @ts-expect-error Not-in-telegram-environment
let invoice

if (import.meta.env.VITE_IS_DEV_LOCAL === undefined) {
  try {
    invoice = initInvoice()
  } catch {
    /* empty */
  }
}

import StarIcon from "@/assets/games/puzzles/icons/star.svg?react"
import TonIcon from "@/assets/icons/ton.svg?react"
import Loader from "@/assets/icons/loader.svg?react"
import BadgePercent from "@/assets/icons/badge-percent.svg?react"

import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalTitle,
} from "../shared/Modal"

import GameButton from "@/modules/Games/components/GameButton"

import { Skeleton } from "@/shared/ui/Skeleton"

import { useAppSelector } from "@/redux/hooks"
import { useGetGameEnergyQuery } from "@/redux/api/games"
import {
  useCommitPaymentMutation,
  useCommitTonPaymentMutation,
  useGetPaymentItemsQuery,
} from "@/redux/api/payment"

import { sendMetrika } from "@/utils/sendMetrika"
import { openLinkWithTelegram } from "@/utils/openLink"

const MAX_ENERGY = 5

const NotEnoughEnergy = ({
  open,
  setOpen,
  setOpenPaymentStatus,
}: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  setOpenPaymentStatus: Dispatch<SetStateAction<boolean>>
}) => {
  const { t } = useTranslation()

  const [paymentStatus, setPaymentStatus] = useState<
    "cancelled" | "paid" | null
  >(null)
  const [isCommitPaymentLocked, setIsCommitPaymentLocked] = useState(false)

  const lang = useAppSelector((state) => state.language.value)

  const { data: gameEnergy } = useGetGameEnergyQuery()
  const { data: paymentItems } = useGetPaymentItemsQuery(undefined, {
    skip: !open,
  })
  const [commitPayment] = useCommitPaymentMutation({
    fixedCacheKey: "top-up-energy",
  })
  const [commitTonPayment] = useCommitTonPaymentMutation()

  const energyItem = useMemo(() => {
    if (!paymentItems) return null

    const neededItem = paymentItems.find((item) => item.type === "GAME_ENERGY")

    if (!neededItem) return null

    return neededItem
  }, [paymentItems])

  const energyToBuy = useMemo(() => {
    if (energyItem === null) return null
    if (gameEnergy === undefined) return null

    const amount = MAX_ENERGY - gameEnergy.gameEnergy

    if (Telegram.WebApp.initData) {
      return {
        amount,
        price: energyItem.starsPrice * amount,
        fullPrice: energyItem.starsPrice * amount,
      }
    } else {
      return {
        amount,
        price: energyItem.tonPrice * amount,
        fullPrice: energyItem.tonPriceFull * amount,
      }
    }
  }, [energyItem, gameEnergy])

  useEffect(() => {
    if (paymentStatus === null) return

    if (paymentStatus === "cancelled") {
      setPaymentStatus(null)
      return
    }

    if (paymentStatus === "paid") {
      setPaymentStatus(null)
      setOpen(false)
      setOpenPaymentStatus(true)
      return
    }
  }, [paymentStatus])

  const buyEnergy = async () => {
    if (isCommitPaymentLocked) return
    if (energyItem === null) return
    if (energyToBuy === null) return

    makeHapticFeedback({ notificationOccured: "success" })
    sendMetrika("restore_energy_donate")

    setIsCommitPaymentLocked(true)

    try {
      if (Telegram.WebApp.initData) {
        const response = await commitPayment({
          id: energyItem.id,
          lang,
          quantity: energyToBuy.amount,
        }).unwrap()

        // @ts-expect-error Not-in-telegram-environment
        const status = await invoice.open(response.paymentFormUrl, "url")
        setPaymentStatus(status)
      } else {
        const response = await commitTonPayment({
          id: energyItem.id,
          lang,
          quantity: energyToBuy.amount,
        }).unwrap()

        window.open(response.paymentFormUrl, "_top")
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "WebAppMethodUnsupported")
          toast.error("Ошибка, openInvoice не поддерживается")
        if (err.message === "WebAppInvoiceOpened")
          toast.error("Ошибка, openInvoice с такой ссылкой уже был открыт")

        return
      }
      toast.error(t("Ошибка"), {
        description: t("Упс, что-то пошло не так"),
      })
    } finally {
      setTimeout(() => {
        setIsCommitPaymentLocked(false)
      }, 20)
    }
  }

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalContent className="w-80" innerClassName="px-4 py-5">
        <ModalTitle className="sr-only">Not enough energy modal</ModalTitle>
        <ModalDescription className="sr-only">
          You can replenish energy by pressing the button
        </ModalDescription>

        <h2 className="mb-3 bg-gradient-to-b from-[#FCF4ED] to-[#F6DFCB] bg-clip-text text-center font-nunito text-[32px]/[150%] font-bold text-transparent">
          {t("Нет энергии")}
        </h2>
        <p className="mb-6 text-balance text-center text-sm/4 font-semibold text-[#FFF7EF]">
          {t("Упс! У тебя закончилась энергия на сегодня")}
        </p>

        {Telegram.WebApp.initData && (
          <button
            className="mb-2 flex h-fit w-[280px] items-center justify-center gap-2.5 rounded-lg bg-[#6A2F02]/60 px-1.5 py-1 text-base font-bold text-[#FCF4ED] drop-shadow-[0px_0px_1px_rgba(0,0,0,0.75)]"
            onClick={() => {
              const correctDomain =
                import.meta.env.VITE_ENVIRONMENT === "PROD"
                  ? "https://nutsfarm.crypton.xyz/"
                  : "https://frontend.nutsfarm-dev.crypton.team/"
              openLinkWithTelegram(
                `${correctDomain}games/puzzles/?initData=${encodeURIComponent(Telegram.WebApp.initData)}`,
              )
            }}
          >
            Open Web
            <BadgePercent className="h-5 w-5" />
          </button>
        )}

        {energyItem === null || energyToBuy === null ? (
          <Skeleton className="h-10 w-[280px] rounded-lg bg-[#6D3D0D]/60" />
        ) : (
          <GameButton
            appearance="puzzles"
            className="h-10 w-[280px] items-center"
            onClick={buyEnergy}
          >
            {isCommitPaymentLocked ? (
              <Loader className="animate-spin" />
            ) : (
              <>
                <span className="-tracking-[0.01em]">
                  {t("Восстановить энергию")}
                </span>
                {Telegram.WebApp.initData ? (
                  <>
                    <StarIcon className="ml-2 mr-[3px] -translate-y-[0.5px]" />
                    <span className="text-sm/[150%]">{energyToBuy.price}</span>
                  </>
                ) : (
                  <>
                    <TonIcon className="ml-2 mr-[3px] h-3.5 w-3.5 -translate-y-[0.5px]" />
                    <span className="text-sm/[150%]">
                      {energyToBuy.price.toFixed(2)}
                    </span>
                    <span className="ml-1 text-xs line-through opacity-80">
                      {energyToBuy.fullPrice.toFixed(2)}
                    </span>
                  </>
                )}
              </>
            )}
          </GameButton>
        )}
      </ModalContent>
    </Modal>
  )
}

export default NotEnoughEnergy
