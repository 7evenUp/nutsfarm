import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

import StarIcon from "@/assets/lesson-icons/star-icon.svg?react"
import EnergyIcon from "@/assets/games/cryptle/icons/energy.svg?react"
import TonIcon from "@/assets/icons/ton.svg?react"
import BadgePercent from "@/assets/icons/badge-percent.svg?react"

import CustomEnergyIcon from "./CustomEnergyIcon"

import {
  Modal,
  ModalContent,
  ModalTitle,
  ModalDescription,
} from "../../shared/Modal"

import GameButton from "@/modules/Games/components/GameButton"

import { Skeleton } from "@/shared/ui/Skeleton"

import {
  useCommitPaymentMutation,
  useCommitTonPaymentMutation,
  useGetPaymentItemsQuery,
} from "@/redux/api/payment"
import { useGetGameEnergyQuery } from "@/redux/api/games"
import { useAppSelector } from "@/redux/hooks"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"
import { getHours, getMinutes } from "@/utils/date"
import { sendMetrika } from "@/utils/sendMetrika"

import { cn } from "@/lib/cn"

import { initInvoice } from "@telegram-apps/sdk"
import { openLinkWithTelegram } from "@/utils/openLink"

// @ts-expect-error Not-in-telegram-environment
let invoice

if (import.meta.env.VITE_IS_DEV_LOCAL === undefined) {
  try {
    invoice = initInvoice()
  } catch {
    /* empty */
  }
}

interface BuyEnergyModalProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  energy: number
  maxEnergy: number
  setOpenPaymentStatus: Dispatch<SetStateAction<boolean>>
}

const BuyEnergyModal = ({
  open,
  setOpen,
  energy,
  maxEnergy,
  setOpenPaymentStatus,
}: BuyEnergyModalProps) => {
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

  const { gameEnergy: energyAmount, energyFullRecoverTime } = gameEnergy!

  const timeUntilNextEnergyRecover = useMemo(() => {
    if (energy >= maxEnergy) return 0

    const minutesForOneEnergy = (24 * 60) / maxEnergy

    const minutesUntilFullRecovery =
      (new Date(energyFullRecoverTime).getTime() - Date.now()) / 1000 / 60

    const energyNeeded = maxEnergy - energyAmount

    const minutesRemains =
      Math.floor(minutesUntilFullRecovery) -
      minutesForOneEnergy * (energyNeeded - 1)

    const hours = getHours(minutesRemains * 60)
    const minutes = getMinutes(minutesRemains * 60)

    return `${hours}${t("h")} ${minutes}${t("m")}`
  }, [energyFullRecoverTime, open])

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
      setOpen(false)
      setOpenPaymentStatus(true)
      return
    }
  }, [paymentStatus])

  const buyEnergy = async () => {
    if (import.meta.env.VITE_IS_DEV_LOCAL !== undefined) {
      return
    }

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
      <ModalContent className="w-[310px] shadow-[#0B0C48]/25 outline-none">
        <ModalTitle className="sr-only">Top up energy</ModalTitle>
        <ModalDescription className="sr-only">Top up energy</ModalDescription>

        <div className="h-full pb-[18px] pt-[44px]">
          <div
            className={cn(
              "absolute -top-5 left-1/2 z-10 flex h-[50px] w-[50px] -translate-x-1/2 items-center justify-center rounded-xl border border-[#3A2485]/80 bg-gradient-to-b from-[#6240CE] to-[#8897F9]",
            )}
          >
            <EnergyIcon className="h-[30px] w-[23px]" />
          </div>
          <h1 className="mb-2 bg-gradient-to-b from-[#7C5CE0] to-[#5239A7] bg-clip-text text-center font-days-one text-3xl text-transparent">
            {t("Энергия")}
          </h1>
          <p className="mb-6 h-12 text-balance px-6 text-center font-nunito text-sm/4 font-semibold text-[#463190]/75">
            {energy >= maxEnergy
              ? t("Ты полностью заряжен и готов к игре")
              : t(
                  "Восстанови полный запас энергии и продолжай играть и фармить еще больше NUTS!",
                )}
          </p>

          <div className="mb-6 flex flex-col items-center gap-4">
            <div className="flex h-10 items-center justify-center">
              {Array(maxEnergy)
                .fill(null)
                .map((_, index) => {
                  if (index === energy) {
                    return (
                      <CustomEnergyIcon
                        key={`active${index}`}
                        className="h-10 w-8 animate-pulse"
                        status="active"
                      />
                    )
                  }
                  if (index > energy) {
                    return (
                      <CustomEnergyIcon
                        key={`empty${index}`}
                        className="h-8 w-6"
                        status="empty"
                      />
                    )
                  }
                  return (
                    <CustomEnergyIcon
                      key={`fill${index}`}
                      className="h-8 w-6"
                      status="fill"
                    />
                  )
                })}
            </div>
            {energy < maxEnergy && (
              <p className="max-w-52 text-balance text-center text-sm/4 font-medium text-[#463190]/75">
                {t("Следующая энергия восстановится через")}{" "}
                <span className="font-bold">{timeUntilNextEnergyRecover}</span>
              </p>
            )}
          </div>

          {energyItem === null || energyToBuy === null ? (
            <Skeleton className="mx-auto h-10 w-[280px] rounded-lg bg-[#FDDD24]/90" />
          ) : energy >= maxEnergy ? (
            <GameButton
              appearance="cryptle"
              className="mx-auto h-10 w-[280px]"
              onClick={() => setOpen(false)}
            >
              {t("Окей, погнали!")}
            </GameButton>
          ) : (
            <>
              {Telegram.WebApp.initData && (
                <button
                  className="mx-auto mb-2 flex h-fit w-[280px] items-center justify-center gap-2.5 rounded-lg bg-[#ECF2FF] px-1.5 py-1 text-base font-bold text-[#5239A7] drop-shadow-[0px_0px_1px_rgba(0,0,0,0.5)]"
                  onClick={() => {
                    const correctDomain =
                      import.meta.env.VITE_ENVIRONMENT === "PROD"
                        ? "https://nutsfarm.crypton.xyz/"
                        : "https://frontend.nutsfarm-dev.crypton.team/"
                    openLinkWithTelegram(
                      `${correctDomain}games/cryptle/?initData=${encodeURIComponent(Telegram.WebApp.initData)}`,
                    )
                  }}
                >
                  Open Web
                  <BadgePercent className="h-5 w-5" />
                </button>
              )}
              <GameButton
                appearance="cryptle"
                className="mx-auto h-10 w-[280px] items-center"
                onClick={() => buyEnergy()}
              >
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
              </GameButton>
            </>
          )}
        </div>
      </ModalContent>
    </Modal>
  )
}

export default BuyEnergyModal
