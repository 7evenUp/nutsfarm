import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { Description, DialogClose } from "@radix-ui/react-dialog"
import { toast } from "sonner"

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

import EnergyFullIcon from "@/assets/games/shared-icons/energy-full.svg?react"
import EnergyGreenIcon from "@/assets/games/flip-cards/icons/energy-icon-green.svg?react"
import EnergyEmptyIcon from "@/assets/games/shared-icons/energy-empty.svg?react"

import ArrowLeftIcon from "@/assets/icons/arrow-left.svg?react"
import StarIcon from "@/assets/lesson-icons/star-icon.svg?react"
import TonIcon from "@/assets/icons/ton.svg?react"
import Loader from "@/assets/icons/loader.svg?react"

import { Sheet, SheetContent, SheetHeader } from "@/shared/ui/SideSheet"
import { LargeButton } from "@/shared/ui/LargeButton"

import { useAppSelector } from "@/redux/hooks"
import {
  useCommitPaymentMutation,
  useCommitTonPaymentMutation,
  useGetPaymentItemsQuery,
} from "@/redux/api/payment"
import { useGetGameEnergyQuery } from "@/redux/api/games"

import { getHours, getMinutes } from "@/utils/date"

import { cn } from "@/lib/cn"

const TopUpEnergyDialog = ({
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        className={cn(
          "items-center gap-0 overflow-hidden p-0 px-3.5 pt-3.5",
          Telegram.WebApp.platform === "weba"
            ? "pb-4"
            : "pb-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
        )}
      >
        <SheetHeader className="sr-only">Top up energy</SheetHeader>
        <Description className="sr-only">Top up energy</Description>

        <div className="flex h-9 w-full items-center justify-between">
          <button
            className="flex items-center gap-2 text-sm font-semibold opacity-70 transition-opacity focus:outline-none active:opacity-100"
            onClick={() => {
              setOpen(false)
            }}
          >
            <ArrowLeftIcon />
            {t("Назад")}
          </button>

        </div>

        <div className="mt-1 flex flex-col items-center gap-2.5 font-tt-hoves-expanded text-2xl font-semibold text-white">
          <EnergyFullIcon className="h-14 w-auto" />
          {t("Энергия")}
        </div>

        <p className="mt-6 text-balance text-center text-sm text-white/75">
          {energy >= maxEnergy
            ? t("Ты полностью заряжен и готов к игре")
            : t(
                "Восстанови полный запас энергии и продолжай играть и фармить еще больше NUTS!",
              )}
        </p>

        <div className="mb-10 mt-9 flex flex-col items-center gap-4">
          <div className="flex shrink-0 items-center gap-2">
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
                      className="h-[22px] w-auto text-[#32435B]"
                    />
                  )
                }
                return (
                  <EnergyFullIcon
                    key={`fill${index}`}
                    className="h-[22px] w-auto"
                  />
                )
              })}
          </div>
          {energy < maxEnergy && (
            <p className="max-w-52 text-balance text-center text-[13px] text-white/75">
              {t("Следующая энергия восстановится через")}{" "}
              <span className="font-bold text-white">
                {timeUntilNextEnergyRecover}
              </span>
            </p>
          )}
        </div>

        {energy >= maxEnergy ? (
          <DialogClose asChild>
            <LargeButton appearance="yellow-linear" className="w-full">
              {t("Окей, погнали!")}
            </LargeButton>
          </DialogClose>
        ) : (
          <LargeButton
            appearance="yellow-linear"
            onClick={buyEnergy}
            disabled={isCommitPaymentLocked || energyItem === null}
            contentClassName="gap-1"
          >
            {energyItem === null ||
            energyToBuy === null ||
            isCommitPaymentLocked ? (
              <Loader className="animate-spin" />
            ) : (
              <>
                <span className="-tracking-[0.01em]">
                  {t("Восстановить энергию")}
                </span>
                {Telegram.WebApp.initData ? (
                  <>
                    <StarIcon className="ml-2 h-auto w-4 -translate-y-[0.5px]" />
                    <span className="text-sm/[150%]">{energyToBuy.price}</span>
                  </>
                ) : (
                  <>
                    <TonIcon className="ml-2 h-auto w-4" />
                    <span className="text-sm/[150%]">
                      {energyToBuy.price.toFixed(2)}
                    </span>
                    <span className="text-xs line-through opacity-80">
                      {energyToBuy.fullPrice.toFixed(2)}
                    </span>
                  </>
                )}
              </>
            )}
          </LargeButton>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default TopUpEnergyDialog
