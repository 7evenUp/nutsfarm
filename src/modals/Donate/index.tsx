import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react"
import { Description } from "@radix-ui/react-dialog"
import { toast } from "sonner"
import { initInvoice } from "@telegram-apps/sdk"
import { useTranslation } from "react-i18next"
import { useMotionValue, useTransform, motion } from "framer-motion"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

// @ts-expect-error Not-in-telegram-environment
let invoice

if (import.meta.env.VITE_IS_DEV_LOCAL === undefined) {
  try {
    invoice = initInvoice()
  } catch {
    /* empty */
  }
}

import SupportUsIcon from "@/assets/lesson-icons/support-us.svg?react"
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg?react"
import StarIcon from "@/assets/lesson-icons/star-icon.svg?react"
import TonIcon from "@/assets/icons/ton.svg?react"
import StarSliderIcon from "@/assets/lesson-icons/star-slider.svg?react"
import Loader from "@/assets/icons/loader.svg?react"
import DonationPodium from "@/assets/icons/donation-podium.svg?react"

import DonateLeaderboard from "./DonateLeaderboard"

import { Sheet, SheetContent, SheetHeader } from "@/shared/ui/SideSheet"
import { Slider } from "@/shared/ui/Slider"

import {
  useCommitPaymentMutation,
  useCommitTonPaymentMutation,
  useGetPaymentItemsQuery,
} from "@/redux/api/payment"
import { useGetCurrentUserQuery } from "@/redux/api/user"
import { useAppSelector } from "@/redux/hooks"

import { numberWithSpaces } from "@/utils/numberWithSpaces"
import { sendMetrika } from "@/utils/sendMetrika"

import { cn } from "@/lib/cn"

const SLIDER_ACTUAL_BREAKPOINTS = [50, 250, 500, 1000, 2500]
const SLIDER_BREAKPOINTS = [5, 25, 50, 70, 90]
const SLIDER_BREAKPOINT_STEPS = [10, 10, 25, 75]
const SLIDER_MIN_VALUE = SLIDER_BREAKPOINTS[0]
const SLIDER_MAX_VALUE = SLIDER_BREAKPOINTS[SLIDER_BREAKPOINTS.length - 1]
const SLIDER_DEFAULT_VALUE = 35

const DonateSheet = ({
  open,
  setOpen,
  openSuccessfullPayment,
  isDonateLeaderboardHidden,
}: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  openSuccessfullPayment: () => void
  isDonateLeaderboardHidden?: boolean
}) => {
  const { t } = useTranslation()

  const [paymentStatus, setPaymentStatus] = useState<
    "cancelled" | "paid" | null
  >(null)
  const [sliderValue, setSliderValue] = useState([SLIDER_DEFAULT_VALUE])
  const [isCommitPaymentLocked, setIsCommitPaymentLocked] = useState(false)
  const [metrikWasSent, setMetrikWasSent] = useState(false)

  const sliderMotion = useMotionValue(SLIDER_DEFAULT_VALUE)

  const mainMotionBg = useTransform(
    sliderMotion,
    [5, 25, 50, 70, 90],
    ["#85E2FC", "#56A2FE", "#CE52C9", "#F28D70", "#FEDD8B"],
  )
  const shadowMotionBg = useTransform(
    sliderMotion,
    [5, 25, 50, 70, 90],
    ["#4D98D9", "#5686bd", "#ad4e8d", "#c9674e", "#D8A85B"],
  )

  const lang = useAppSelector((state) => state.language.value)

  const { data: currentUser } = useGetCurrentUserQuery()
  const { data: paymentItems } = useGetPaymentItemsQuery(undefined, {
    skip: !open,
  })
  const [commitPayment] = useCommitPaymentMutation({ fixedCacheKey: "donate" })
  const [commitTonPayment] = useCommitTonPaymentMutation()

  const metrikaObject = {
    userBalance: currentUser?.balance,
  }

  useEffect(() => {
    sliderMotion.set(sliderValue[0])

    if (!metrikWasSent) {
      sendMetrika("donate_slider_moved", metrikaObject)
      setMetrikWasSent(true)
    }
  }, [sliderValue])

  const donateItem = useMemo(() => {
    if (!paymentItems) return null

    const neededItem = paymentItems.find((item) => item.type === "DONATION")

    if (!neededItem) return null

    return neededItem
  }, [paymentItems])

  useEffect(() => {
    if (paymentStatus === null) return

    if (paymentStatus === "cancelled") {
      setPaymentStatus(null)
      return
    }

    if (paymentStatus === "paid") {
      setPaymentStatus(null)
      openSuccessfullPayment()
      return
    }
  }, [paymentStatus])

  const calculateSliderValue = () => {
    const currentStep = sliderValue[0]

    // Min value (50)
    let sum = SLIDER_BREAKPOINTS[0] * SLIDER_BREAKPOINT_STEPS[0]

    const difference = currentStep - SLIDER_BREAKPOINTS[0]

    sum += difference * SLIDER_BREAKPOINT_STEPS[0]

    if (currentStep > SLIDER_BREAKPOINTS[2]) {
      sum = SLIDER_ACTUAL_BREAKPOINTS[2]

      const difference = currentStep - SLIDER_BREAKPOINTS[2]
      sum += difference * SLIDER_BREAKPOINT_STEPS[2]
    }

    if (currentStep > SLIDER_BREAKPOINTS[3]) {
      sum = SLIDER_ACTUAL_BREAKPOINTS[3]

      const difference = currentStep - SLIDER_BREAKPOINTS[3]
      sum += difference * SLIDER_BREAKPOINT_STEPS[3]
    }

    if (Telegram.WebApp.initData) return sum
    else return sum / 100
  }

  const donate = async () => {
    if (isCommitPaymentLocked) return
    if (donateItem === null) return

    sendMetrika("finish_donate_button", metrikaObject)

    makeHapticFeedback({ notificationOccured: "success" })

    setIsCommitPaymentLocked(true)

    try {
      if (Telegram.WebApp.initData) {
        const response = await commitPayment({
          id: donateItem.id,
          lang,
          quantity: calculateSliderValue(),
        }).unwrap()

        // @ts-expect-error Not-in-telegram-environment
        const status = await invoice.open(response.paymentFormUrl, "url")
        setPaymentStatus(status)
      } else {
        const response = await commitTonPayment({
          id: donateItem.id,
          lang,
          quantityDouble: calculateSliderValue(),
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
        <SheetHeader className="sr-only">Donate modal</SheetHeader>
        <Description className="sr-only">
          Our course is free, and we are glad that you are with us! If you like
          the project, please support us via Telegram Stars. This will help us
          develop the course and make it even better!
        </Description>

        <div className="flex h-9 w-full justify-between">
          <button
            className="flex items-center gap-2 text-sm font-semibold opacity-70 transition-opacity focus:outline-none active:opacity-100"
            onClick={() => {
              setOpen(false)
            }}
          >
            <ArrowLeftIcon />
            {t("Назад")}
          </button>

          {!isDonateLeaderboardHidden && (
            <DonateLeaderboard>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#17202D]">
                <DonationPodium className="h-6 w-6" />
              </div>
            </DonateLeaderboard>
          )}
        </div>

        <div className="mt-1 flex flex-col items-center gap-2.5 font-tt-hoves-expanded text-xl font-semibold text-white">
          <SupportUsIcon />
          {t("Каждый вклад важен")}
        </div>

        <p className="mt-4 text-center text-xs text-white/75 phone-sm-fix:text-sm">
          {t(
            "Чтобы каждый мог учиться и развиваться, поддержи проект с помощью Telegram Stars.",
          )}
        </p>
        <p className="mb-16 mt-4 text-center text-xs text-white/75 phone-sm-fix:text-sm">
          {t("Это поможет нам создавать ещё больше образовательного контента!")}
        </p>

        <div className="mt-auto flex w-full flex-col items-center">
          <div className="relative flex h-7 w-full items-center">
            <p
              onClick={() => {
                makeHapticFeedback({ impactOccured: "soft" })

                setSliderValue([SLIDER_BREAKPOINTS[0]])
              }}
              className={cn(
                "absolute -top-6 text-sm font-bold text-[#C8C8C8]/50 transition-colors",
                sliderValue[0] < SLIDER_BREAKPOINTS[1] && "text-[#65F5FF]",
              )}
            >
              {Telegram.WebApp.initData
                ? numberWithSpaces(SLIDER_ACTUAL_BREAKPOINTS[0])
                : SLIDER_ACTUAL_BREAKPOINTS[0] / 100}
            </p>
            <p
              onClick={() => {
                makeHapticFeedback({ impactOccured: "soft" })

                setSliderValue([SLIDER_BREAKPOINTS[1]])
              }}
              className={cn(
                "absolute -top-6 left-1/4 -translate-x-1/2 text-sm font-bold text-[#C8C8C8]/50 transition-colors",
                sliderValue[0] >= SLIDER_BREAKPOINTS[1] &&
                  sliderValue[0] < SLIDER_BREAKPOINTS[2] &&
                  "text-[#57AEFF]",
              )}
            >
              {Telegram.WebApp.initData
                ? numberWithSpaces(SLIDER_ACTUAL_BREAKPOINTS[1])
                : SLIDER_ACTUAL_BREAKPOINTS[1] / 100}
            </p>
            <p
              onClick={() => {
                makeHapticFeedback({ impactOccured: "soft" })

                setSliderValue([SLIDER_BREAKPOINTS[2]])
              }}
              className={cn(
                "absolute -top-6 left-1/2 -translate-x-0.5 text-sm font-bold text-[#C8C8C8]/50 transition-colors",
                sliderValue[0] >= SLIDER_BREAKPOINTS[2] &&
                  sliderValue[0] < SLIDER_BREAKPOINTS[3] &&
                  "text-[#D054C9]",
                !Telegram.WebApp.initData && "translate-x-1.5",
              )}
            >
              {Telegram.WebApp.initData
                ? numberWithSpaces(SLIDER_ACTUAL_BREAKPOINTS[2])
                : SLIDER_ACTUAL_BREAKPOINTS[2] / 100}
            </p>
            <p
              onClick={() => {
                makeHapticFeedback({ impactOccured: "soft" })

                setSliderValue([SLIDER_BREAKPOINTS[3]])
              }}
              className={cn(
                "absolute -top-6 left-3/4 -translate-x-1/2 text-sm font-bold text-[#C8C8C8]/50 transition-colors",
                sliderValue[0] >= SLIDER_BREAKPOINTS[3] &&
                  sliderValue[0] < SLIDER_BREAKPOINTS[4] &&
                  "text-[#F28D70]",
                !Telegram.WebApp.initData && "-translate-x-1.5",
              )}
            >
              {Telegram.WebApp.initData
                ? numberWithSpaces(SLIDER_ACTUAL_BREAKPOINTS[3])
                : SLIDER_ACTUAL_BREAKPOINTS[3] / 100}
            </p>
            <p
              onClick={() => {
                makeHapticFeedback({ impactOccured: "soft" })

                setSliderValue([SLIDER_BREAKPOINTS[4]])
              }}
              className={cn(
                "absolute -top-6 right-0 translate-x-1 text-sm font-bold text-[#C8C8C8]/50 transition-colors",
                sliderValue[0] >= SLIDER_BREAKPOINTS[4] && "text-[#FDD775]",
              )}
            >
              {Telegram.WebApp.initData
                ? numberWithSpaces(SLIDER_ACTUAL_BREAKPOINTS[4])
                : SLIDER_ACTUAL_BREAKPOINTS[4] / 100}
            </p>

            <Slider
              rangeClassName={cn(
                sliderValue[0] >= SLIDER_BREAKPOINTS[4]
                  ? "full-range-gradient"
                  : sliderValue[0] >= SLIDER_BREAKPOINTS[1]
                    ? "from-[#F16E63] to-[#FCA72C]"
                    : sliderValue[0] >= SLIDER_BREAKPOINTS[0]
                      ? "from-[#C041CB] to-[#EB73C6]"
                      : "from-[#66FAFF] to-[#55A3FF]",
              )}
              value={sliderValue}
              onValueChange={setSliderValue}
              step={1}
              min={SLIDER_MIN_VALUE}
              max={SLIDER_MAX_VALUE}
              trackStyle={{
                clipPath: `rect(0px ${((sliderValue[0] - SLIDER_MIN_VALUE) * 100) / (SLIDER_MAX_VALUE - SLIDER_MIN_VALUE)}% 6px auto)`,
              }}
            />

            <button
              className="absolute left-0 h-4 w-4 rounded-full bg-[#66FAFF]"
              onClick={() => {
                makeHapticFeedback({ impactOccured: "soft" })

                setSliderValue([SLIDER_BREAKPOINTS[0]])
              }}
            />

            <StarSliderIcon
              onClick={() => {
                makeHapticFeedback({ impactOccured: "soft" })

                setSliderValue([SLIDER_BREAKPOINTS[1]])
              }}
              style={{ left: "25%" }}
              className={cn(
                "absolute top-1/2 -translate-x-3.5 -translate-y-[calc(50%+3px)] cursor-pointer text-[#17202D] transition-all active:scale-105",
                sliderValue[0] >= SLIDER_BREAKPOINTS[1] && "text-[#56A2FE]",
              )}
            />
            <StarSliderIcon
              onClick={() => {
                makeHapticFeedback({ impactOccured: "soft" })
                setSliderValue([SLIDER_BREAKPOINTS[2]])
              }}
              style={{ left: "50%" }}
              className={cn(
                "absolute top-1/2 -translate-x-1 -translate-y-[calc(50%+3px)] cursor-pointer text-[#17202D] transition-all active:scale-105",
                sliderValue[0] >= SLIDER_BREAKPOINTS[2] && "text-[#CE52C9]",
              )}
            />
            <StarSliderIcon
              onClick={() => {
                makeHapticFeedback({ impactOccured: "soft" })
                setSliderValue([SLIDER_BREAKPOINTS[3]])
              }}
              style={{ left: "75%" }}
              className={cn(
                "absolute top-1/2 -translate-x-3 -translate-y-[calc(50%+3px)] cursor-pointer text-[#17202D] transition-all active:scale-105",
                sliderValue[0] >= SLIDER_BREAKPOINTS[3] && "text-[#F28D70]",
              )}
            />
            <StarSliderIcon
              onClick={() => {
                makeHapticFeedback({ impactOccured: "soft" })
                setSliderValue([SLIDER_BREAKPOINTS[4]])
              }}
              style={{ left: "100%" }}
              className={cn(
                "absolute top-1/2 -translate-x-[22px] -translate-y-[calc(50%+3px)] cursor-pointer text-[#17202D] transition-all active:scale-105",
                sliderValue[0] >= SLIDER_BREAKPOINTS[4] && "text-[#FDD573]",
              )}
            />
          </div>
        </div>

        <button
          className="group relative mt-10 flex h-14 w-full items-start outline-none"
          disabled={isCommitPaymentLocked || donateItem === null}
          onClick={donate}
        >
          <motion.div
            style={{ background: mainMotionBg }}
            className="relative z-50 flex h-[50px] w-full items-center justify-center gap-1.5 rounded-xl font-tt-hoves-expanded text-base font-semibold text-[#060E13] group-active:translate-y-1.5"
          >
            {donateItem === null || isCommitPaymentLocked ? (
              <Loader className="animate-spin" />
            ) : (
              <>
                {t("Поддержать на")}
                {Telegram.WebApp.initData ? (
                  <StarIcon />
                ) : (
                  <TonIcon className="h-5 w-5" />
                )}{" "}
                {Telegram.WebApp.initData
                  ? numberWithSpaces(calculateSliderValue())
                  : calculateSliderValue()}
              </>
            )}
          </motion.div>
          <motion.div
            style={{ background: shadowMotionBg }}
            className="absolute top-0 h-full w-full rounded-xl group-active:h-[50px] group-active:translate-y-1.5"
          />
        </button>
      </SheetContent>
    </Sheet>
  )
}

export default DonateSheet
