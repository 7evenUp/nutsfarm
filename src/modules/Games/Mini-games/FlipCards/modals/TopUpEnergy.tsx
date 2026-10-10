import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

import { initInvoice } from "@/demo/telegram-sdk"

// @ts-expect-error Not-in-telegram-environment
let invoice

if (true) {
  try {
    invoice = initInvoice()
  } catch {
    /* empty */
  }
}

import StarIcon from "@/assets/games/flip-cards/icons/star.svg?react"
import EnergyWithoutBorderIcon from "@/assets/games/flip-cards/icons/energy-icon-without-border.svg?react"
import EnergyFullIcon from "@/assets/games/flip-cards/icons/energy-icon.svg?react"
import EnergyGreenIcon from "@/assets/games/flip-cards/icons/energy-icon-green.svg?react"
import EnergyEmptyIcon from "@/assets/games/shared-icons/energy-empty.svg?react"
import Loader from "@/assets/icons/loader.svg?react"
import TonIcon from "@/assets/icons/ton.svg?react"
import BadgePercent from "@/assets/icons/badge-percent.svg?react"

import {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalTitle,
} from "../shared/Modal"

import GameButton from "@/modules/Games/components/GameButton"

import { Skeleton } from "@/shared/ui/Skeleton"

import {
  useCommitPaymentMutation,
  useCommitTonPaymentMutation,
  useGetPaymentItemsQuery,
} from "@/redux/api/payment"
import { useGetGameEnergyQuery } from "@/redux/api/games"
import { useAppSelector } from "@/redux/hooks"

import { getHours, getMinutes } from "@/utils/date"
import { sendMetrika } from "@/utils/sendMetrika"
import { openLinkWithTelegram } from "@/utils/openLink"

const TopUpEnergy = ({
  open,
  setOpen,
  energy,
  maxEnergy,
  setOpenPaymentStatus,
}: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  energy: number
  maxEnergy: number
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
      <ModalContent className="px-4 pb-4 pt-8">
        <ModalTitle className="sr-only">Top up energy</ModalTitle>
        <ModalDescription className="sr-only">Top up energy</ModalDescription>

        <div className="absolute left-1/2 top-0 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border border-[#191563] bg-[#533480]">
          <EnergyWithoutBorderIcon className="h-8 w-auto drop-shadow-[0px_2px_4px_rgba(0,0,0,0.25)]" />
        </div>

        <h2 className="mb-1 bg-gradient-to-b from-[#0F0C5A] to-[#564C9F] bg-clip-text font-days-one text-[30px]/[150%] text-transparent">
          {t("Энергия")}
        </h2>

        <p className="text-balance text-center text-sm/4 font-semibold text-[#382E6D]">
          {energy >= maxEnergy
            ? t("Ты полностью заряжен и готов к игре")
            : t(
                "Восстанови полный запас энергии и продолжай играть и фармить еще больше NUTS!",
              )}
        </p>

        <div className="my-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            {Array(maxEnergy)
              .fill(null)
              .map((_, index) => {
                if (index === energy) {
                  return (
                    <EnergyGreenIcon
                      key={`active${index}`}
                      className="-mx-1.5 animate-pulse"
                    />
                  )
                }
                if (index > energy) {
                  return (
                    <EnergyEmptyIcon
                      key={`empty${index}`}
                      className="text-[#51327D]"
                    />
                  )
                }
                return <EnergyFullIcon key={`fill${index}`} />
              })}
          </div>
          {energy < maxEnergy && (
            <p className="max-w-52 text-balance text-center text-sm/4 font-medium text-[#382E6D]">
              {t("Следующая энергия восстановится через")}{" "}
              <span className="font-bold">{timeUntilNextEnergyRecover}</span>
            </p>
          )}
        </div>

        {energyItem === null || energyToBuy === null ? (
          <Skeleton className="h-10 w-[280px] rounded-lg bg-[#DB8AE5]/90" />
        ) : energy >= maxEnergy ? (
          <ModalClose>
            <GameButton appearance="flip-cards" className="h-10 w-[280px]">
              {t("Окей, погнали!")}
            </GameButton>
          </ModalClose>
        ) : (
          <>
            {Telegram.WebApp.initData && (
              <button
                className="mb-2 flex h-fit w-[280px] items-center justify-center gap-2.5 rounded-lg bg-[#F0F2FF] px-1.5 py-1 text-base font-bold text-[#0F0C5A] drop-shadow-[0px_0px_1px_rgba(0,0,0,0.5)]"
                onClick={() => {
                  const correctDomain =
                    import.meta.env.VITE_ENVIRONMENT === "PROD"
                      ? `${window.location.origin}/`
                      : `${window.location.origin}/`
                  openLinkWithTelegram(
                    `${correctDomain}games/flip-cards/?initData=${encodeURIComponent(Telegram.WebApp.initData)}`,
                  )
                }}
              >
                Open Web
                <BadgePercent className="h-5 w-5" />
              </button>
            )}
            <GameButton
              appearance="flip-cards"
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
                      <span className="text-sm/[150%]">
                        {energyToBuy.price}
                      </span>
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
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default TopUpEnergy
