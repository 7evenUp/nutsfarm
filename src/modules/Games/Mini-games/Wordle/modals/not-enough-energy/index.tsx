import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

import StarIcon from "@/assets/lesson-icons/star-icon.svg?react"
import TonIcon from "@/assets/icons/ton.svg?react"
import BadgePercent from "@/assets/icons/badge-percent.svg?react"

import { Skeleton } from "@/shared/ui/Skeleton"

import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalTitle,
} from "../../shared/Modal"

import GameButton from "@/modules/Games/components/GameButton"

import {
  useCommitPaymentMutation,
  useCommitTonPaymentMutation,
  useGetPaymentItemsQuery,
} from "@/redux/api/payment"
import { useAppSelector } from "@/redux/hooks"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

import { initInvoice } from "@/demo/telegram-sdk"
import { openLinkWithTelegram } from "@/utils/openLink"

// @ts-expect-error Not-in-telegram-environment
let invoice

if (true) {
  try {
    invoice = initInvoice()
  } catch {
    /* empty */
  }
}

interface BuyEnergyModalProps {
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
  energy: number
  maxEnergy: number
  setOpenPaymentStatus: Dispatch<SetStateAction<boolean>>
}

const NotEnoughEnergyModal = ({
  open,
  onOpenChange,
  energy,
  maxEnergy,
  setOpenPaymentStatus,
}: BuyEnergyModalProps) => {
  const { t } = useTranslation()

  const lang = useAppSelector((state) => state.language.value)

  const [paymentStatus, setPaymentStatus] = useState<
    "cancelled" | "paid" | null
  >(null)
  const [isCommitPaymentLocked, setIsCommitPaymentLocked] = useState(false)

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

    const amount = maxEnergy - energy

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
  }, [energyItem, energy, maxEnergy])

  useEffect(() => {
    if (paymentStatus === null) return

    if (paymentStatus === "cancelled") {
      setPaymentStatus(null)
      return
    }

    if (paymentStatus === "paid") {
      setPaymentStatus(null)
      onOpenChange(false)
      setOpenPaymentStatus(true)
      return
    }
  }, [paymentStatus])

  const buyEnergy = async () => {
    if (isCommitPaymentLocked) return
    if (energyItem === null) return
    if (energyToBuy === null) return

    makeHapticFeedback({ notificationOccured: "success" })

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
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="w-[310px] shadow-[#0B0C48]/25 outline-none">
        <ModalTitle className="sr-only">Top up energy</ModalTitle>
        <ModalDescription className="sr-only">Buy energy</ModalDescription>

        <div className="pt h-full pb-4 pt-6">
          <h1 className="mb-3 bg-gradient-to-b from-[#9BA5F2] to-[#AAC3EB] bg-clip-text text-center font-days-one text-3xl text-transparent">
            {t("Нет энергии")}
          </h1>
          <span className="mb-4 flex max-w-[270px] justify-center text-center font-nunito text-sm/4 font-semibold text-[#463190]/75">
            {t("Упс! У тебя закончилась энергия на сегодня")}
          </span>

          {Telegram.WebApp.initData && (
            <button
              className="mb-2 flex h-fit w-[280px] items-center justify-center gap-2.5 rounded-lg bg-[#ECF2FF] px-1.5 py-1 text-base font-bold text-[#5239A7] drop-shadow-[0px_0px_1px_rgba(0,0,0,0.5)]"
              onClick={() => {
                const correctDomain =
                  import.meta.env.VITE_ENVIRONMENT === "PROD"
                    ? `${window.location.origin}/`
                    : `${window.location.origin}/`
                openLinkWithTelegram(
                  `${correctDomain}games/cryptle/?initData=${encodeURIComponent(Telegram.WebApp.initData)}`,
                )
              }}
            >
              Open Web
              <BadgePercent className="h-5 w-5" />
            </button>
          )}

          {energyItem === null || energyToBuy === null ? (
            <Skeleton className="h-10 w-[280px] rounded-lg bg-[#FDDD24]/90" />
          ) : (
            <GameButton
              appearance="cryptle"
              className="h-10 w-[280px]"
              onClick={() => buyEnergy()}
            >
              <span className="flex min-w-[250px] items-center justify-center">
                {t("Восстановить энергию")}{" "}
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
              </span>
            </GameButton>
          )}
        </div>
      </ModalContent>
    </Modal>
  )
}

export default NotEnoughEnergyModal
