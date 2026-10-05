import { useEffect, useState } from "react"
import { Description } from "@radix-ui/react-dialog"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { AnimationPlaybackControls, motion, useAnimate } from "framer-motion"
import Rive from "@rive-app/react-webgl2"

import CoinFrozenIcon from "@/assets/icons/nut-coin-frozen.svg?react"
import StarIcon1 from "@/assets/icons/star-1.svg?react"
import StarIcon2 from "@/assets/icons/star-2.svg?react"
import FrozenBackground from "@/assets/icons/frozen-bg.svg?react"
import FrozenBackgroundActive from "@/assets/icons/frozen-bg-active.svg?react"
import CoinIcon from "@/assets/icons/coin.svg?react"
import Loader from "@/assets/icons/loader.svg?react"

import StreakBooster from "@/components/StreakBooster"
import StreakReward from "@/components/StreakReward"

import { Dialog, DialogContent, DialogHeader } from "@/shared/ui/Dialog"
import { TextEffect } from "@/shared/ui/TextEffect"
import { LargeButton } from "@/shared/ui/LargeButton"

import {
  useClaimStreakMutation,
  useGetCurrentStreakQuery,
} from "@/redux/api/streak"
import { useGetCurrentUserQuery } from "@/redux/api/user"

import { numberWithSpaces } from "@/utils/numberWithSpaces"
import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

import { cn } from "@/lib/cn"

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

const Frozen1Day = () => {
  const { t } = useTranslation()

  const [scope, animate] = useAnimate()

  const [isContinueLocked, setIsContinueLocked] = useState(false)
  const [isSkipLocked, setIsSkipLocked] = useState(false)
  const [open, setOpen] = useState(true)
  const [isAnimationStarted, setIsAnimationStarted] = useState(false)
  const [isTextChanged, setIsTextChanged] = useState(false)
  const [currentAnimation, setCurrentAnimation] =
    useState<AnimationPlaybackControls | null>(null)

  const { data: currentUser, refetch: refetchCurrentUser } =
    useGetCurrentUserQuery()
  const [claimStreak] = useClaimStreakMutation()
  const {
    data: streak,
    isLoading: isClaimLoading,
    refetch: refetchStreak,
  } = useGetCurrentStreakQuery({
    timezone,
  })

  useEffect(() => {
    if (isAnimationStarted) {
      let secondTimeoutId: number

      const firstTimeoutId = window.setTimeout(() => {
        setIsTextChanged(true)

        secondTimeoutId = window.setTimeout(() => {
          refetchCurrentUser()
          refetchStreak()
          setOpen(false)
        }, 2000)
      }, 2500)

      const controller = new AbortController()

      window.addEventListener(
        "click",
        () => {
          if (firstTimeoutId) clearTimeout(firstTimeoutId)
          if (secondTimeoutId) clearTimeout(secondTimeoutId)
          refetchCurrentUser()
          refetchStreak()
          setOpen(false)
        },
        { once: true, signal: controller.signal },
      )

      return () => {
        if (firstTimeoutId) clearTimeout(firstTimeoutId)
        if (secondTimeoutId) clearTimeout(secondTimeoutId)
        controller.abort()
      }
    }
  }, [isAnimationStarted])

  useEffect(() => {
    if (open && streak) {
      // Анимация, которую можно проскипать
      const animation = animate([
        // инициализируем начальные положения каждого слоя
        [".preview-text", { opacity: 0 }, { duration: 0 }],
        [".preview-mascot", { opacity: 0 }, { duration: 0 }],
        [".main-content", { y: 150, opacity: 0 }, { duration: 0 }],
        // Начало анимации
        [".preview-text", { opacity: 1 }, { delay: 0.5 }],
        [".preview-mascot", { opacity: 1 }, { at: "-0.2" }],
        [".preview-text", { opacity: 0 }, { delay: 3, at: "<" }],
        [".preview-mascot", { opacity: 0, scale: 0.8 }, { at: ">" }],
      ])
      // Анимация, которая появляется после скипа
      animation.then(() => {
        animate([[".main-content", { opacity: 1, y: 0 }, { at: ">" }]])
        setCurrentAnimation(null)
      })
      setCurrentAnimation(animation)
    }
  }, [streak])

  useEffect(() => {
    if (currentAnimation === null) return

    const controller = new AbortController()

    window.addEventListener(
      "click",
      () => {
        currentAnimation.complete()
      },
      { once: true, signal: controller.signal },
    )

    return () => {
      controller.abort()
    }
  }, [currentAnimation])

  if (!streak || !currentUser) return null

  const {
    missedDaysFreezeCost,
    todayStreakInfo: {
      nutsReward,
      percentageLvl,
      bonusPercentage,
      isMilestone,
      dayNumber,
      additionalReward,
    },
  } = streak!

  const continueStreak = async () => {
    if (isClaimLoading || isContinueLocked || isSkipLocked) return
    if (currentUser.balance < missedDaysFreezeCost) return

    makeHapticFeedback({ impactOccured: "rigid" })

    setIsContinueLocked(true)

    try {
      await claimStreak({ timezone, payForFreeze: true }).unwrap()

      setIsAnimationStarted(true)
    } catch {
      toast.error(t("Ошибка"), {
        description: t("Упс, что-то пошло не так"),
      })
      setOpen(false)
    } finally {
      setTimeout(() => setIsContinueLocked(false), 1000)
    }
  }

  const skipStreak = async () => {
    if (isClaimLoading || isSkipLocked || isContinueLocked) return

    makeHapticFeedback({ impactOccured: "rigid" })

    setIsSkipLocked(true)

    try {
      await claimStreak({ timezone, payForFreeze: false }).unwrap()

      setTimeout(() => {
        refetchCurrentUser()
        refetchStreak()
      }, 200)
    } catch {
      toast.error(t("Ошибка"), {
        description: t("Упс, что-то пошло не так"),
      })
      setOpen(false)
    } finally {
      setTimeout(() => setIsSkipLocked(false), 1000)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="items-center overflow-hidden rounded-t-none p-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-top-0 data-[state=open]:slide-in-from-top-0">
        <DialogHeader className="sr-only">
          Freeze your daily streak
        </DialogHeader>
        <Description className="sr-only">
          Freezing daily streak modal
        </Description>

        {isAnimationStarted ? (
          <div className="relative flex h-screen w-screen flex-col items-center justify-center">
            <span className="-mt-10 mb-16 h-16 w-[240px] text-center font-tt-hoves-expanded text-xl font-semibold tracking-[-0.02em] phone-sm-fix:w-[275px] phone-sm-fix:text-2xl">
              {isTextChanged ? (
                <TextEffect per="word" preset="slide">
                  {t("Вы сохранили свой прогресс!")}
                </TextEffect>
              ) : (
                <span className="animate-pulse">{t("Заморозка...")}</span>
              )}
            </span>
            <div className="relative h-[208px] w-[232px]">
              <motion.div
                initial={{ scale: 1, x: "-50%", y: "-50%" }}
                animate={{ scale: 0.7 }}
                transition={{ delay: 1, duration: 0.7, ease: "backIn" }}
                className="absolute left-1/2 top-1/2"
              >
                <FrozenBackground className="h-auto w-[234px]" />
              </motion.div>
              <motion.div
                initial={{ scale: 0.2, x: "-50%", y: "-50%" }}
                animate={{ scale: 1 }}
                transition={{
                  duration: 2,
                  ease: [0.56, 0.71, 0.69, 1.63],
                }}
                className="absolute left-1/2 top-1/2"
              >
                <FrozenBackgroundActive />
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2 }}
                className="absolute left-16 top-20"
              >
                <StarIcon1 />
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2.2 }}
                className="absolute left-36 top-32"
              >
                <StarIcon2 />
              </motion.div>
            </div>
          </div>
        ) : (
          <div
            className="relative flex h-screen w-screen flex-col items-center"
            ref={scope}
          >
            <div className="preview-text absolute flex h-screen w-screen flex-col items-center">
              <span className="absolute top-8 w-[240px] text-center font-tt-hoves-expanded text-xl font-semibold tracking-[-0.02em] phone-sm-fix:mt-10 phone-sm-fix:w-[275px] phone-sm-fix:text-2xl">
                {t("О не-е-ет! Ты пропустил 1 день...")}
              </span>
            </div>
            <div className="preview-mascot absolute flex h-screen w-screen flex-col items-center">
              <Rive
                className="absolute top-80 h-[200px] w-screen max-w-[350px] phone-xsm:h-[300px]"
                src="/water-cry-1.riv"
              />
            </div>
            <div className="main-content absolute flex h-screen w-screen flex-col items-center">
              <span className="mt-8 w-[240px] text-center font-tt-hoves-expanded text-xl font-semibold tracking-[-0.02em] phone-sm-fix:mt-10 phone-sm-fix:w-[275px] phone-sm-fix:text-2xl">
                {t("О не-е-ет! Ты пропустил 1 день...")}
              </span>

              <span className="mt-6 text-sm text-white/50 phone-sm-fix:mt-8">
                {t("Они могли быть твоими:")}
              </span>

              <div
                className={cn(
                  "mt-4 flex h-[72px] w-[300px] items-center phone-sm-fix:mt-5 phone-sm-fix:h-[84px] phone-sm-fix:w-[345px]",
                  isMilestone || additionalReward !== null
                    ? "justify-between"
                    : "justify-center",
                )}
              >
                <div className="flex h-[72px] w-[128px] items-center justify-center gap-2.5 rounded-[14px] bg-[#17202D] phone-sm-fix:h-[84px] phone-sm-fix:w-[142px] phone-sm-fix:gap-1.5">
                  <CoinIcon className="h-7 w-7 phone-sm-fix:h-9 phone-sm-fix:w-9" />
                  <span className="font-tt-hoves-expanded text-2xl font-semibold text-white phone-sm-fix:text-[28px]">
                    {numberWithSpaces(nutsReward)}
                  </span>
                </div>
                {additionalReward !== null ? (
                  <StreakReward
                    rewardSrc={additionalReward.img}
                    rewardName={additionalReward.name}
                    className="h-[72px]"
                  />
                ) : (
                  isMilestone && (
                    <StreakBooster
                      percentageLvl={percentageLvl}
                      bonusPercentage={bonusPercentage}
                      className="h-[72px]"
                    />
                  )
                )}
              </div>

              <p className="mt-6 px-10 text-center font-tt-hoves-expanded text-xl font-semibold tracking-[-0.02em] phone-sm-fix:mt-8">
                {t("Заморозь день, чтобы сохранить прогресс")}
              </p>

              <div className="mt-4 flex w-full items-center justify-between gap-3.5 px-8 phone-sm-fix:mt-5 phone-sm-fix:px-12">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-white/50">
                    {t("Ваш прогресс:")}
                  </span>
                  <span className="font-tt-hoves-expanded text-base font-semibold">
                    <span>{dayNumber}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-tt-hoves-expanded text-base font-semibold">
                  <CoinIcon className="h-[18px] w-[18px]" />
                  <span>{numberWithSpaces(currentUser.balance)}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-9 [@media(max-height:650px)]:hidden">
                <div className="relative">
                  <FrozenBackground className="h-auto w-[128px]" />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/3 font-tt-hoves-expanded text-5xl font-semibold text-[#75BEFD]">
                    1
                  </span>
                </div>
              </div>

              {/* Кнопка клейма */}
              <div
                className={cn(
                  "absolute inset-x-3.5 flex flex-col gap-2.5 phone-sm-fix:inset-x-4",
                  Telegram.WebApp.platform === "weba"
                    ? "bottom-5"
                    : "bottom-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
                )}
              >
                <LargeButton
                  appearance="blue-linear"
                  contentClassName="gap-0"
                  onClick={continueStreak}
                  disabled={currentUser.balance < missedDaysFreezeCost}
                >
                  {isContinueLocked ? (
                    <Loader className="animate-spin" />
                  ) : (
                    <>
                      {t("Заморозить за")}
                      <CoinFrozenIcon className="ml-2 mr-1 h-4 w-4" />
                      {numberWithSpaces(missedDaysFreezeCost)}
                    </>
                  )}
                </LargeButton>
                <LargeButton
                  appearance="gray"
                  contentClassName="font-medium"
                  onClick={skipStreak}
                >
                  {isSkipLocked ? (
                    <Loader className="animate-spin" />
                  ) : (
                    t("Потерять прогресс")
                  )}
                </LargeButton>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
export default Frozen1Day
