import { useEffect, useState } from "react"
import { Description } from "@radix-ui/react-dialog"
import { AnimationPlaybackControls, useAnimate } from "framer-motion"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import Rive from "@rive-app/react-webgl2"

import FireIcon from "@/assets/icons/fire.svg?react"
import CoinIcon from "@/assets/icons/coin.svg?react"
import Loader from "@/assets/icons/loader.svg?react"

import StreakBooster from "@/components/StreakBooster"
import StreakReward from "@/components/StreakReward"

import { Dialog, DialogContent, DialogHeader } from "@/shared/ui/Dialog"
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

const DailyStreakDialog = () => {
  const { t } = useTranslation()

  const [scope, animate] = useAnimate()

  const [currentAnimation, setCurrentAnimation] =
    useState<AnimationPlaybackControls | null>(null)
  const [isClaimLocked, setIsClaimLocked] = useState(false)
  const [open, setOpen] = useState(true)

  const { refetch: refetchCurrentUser } = useGetCurrentUserQuery()
  const [claimStreak] = useClaimStreakMutation()

  const {
    data: streak,
    isLoading: isClaimLoading,
    refetch: refetchStreak,
  } = useGetCurrentStreakQuery({
    timezone,
  })

  useEffect(() => {
    if (open && streak) {
      // Анимация, которую можно проскипать
      const animation = animate([
        // инициализируем начальные положения каждого слоя
        [".intro-text", { top: "16%", opacity: 1 }, { duration: 0 }],
        [
          ".days",
          { top: "40%", transform: "translateX(-50%) scale(1.2)" },
          { duration: 0, at: "<" },
        ],
        [
          ".bottom-animation",
          {
            bottom: "-20%",
            opacity: 0,
            transform: "translateX(-50%) scale(0.8)",
          },
          { duration: 0, at: "<" },
        ],
        [
          ".days-bar",
          {
            opacity: 0,
          },
          { duration: 0, at: "<" },
        ],
        [
          ".active-bar",
          {
            width: "33.33%",
          },
          { duration: 0, at: "<" },
        ],
        [
          ".fire-icon",
          {
            left: "33.33%",
          },
          { duration: 0, at: "<" },
        ],
        [
          ".prev-day",
          {
            opacity: 1,
            transform: "translate(-50%) scale(1.15)",
          },
          { duration: 0, at: "<" },
        ],
        [
          ".current-day",
          {
            opacity: 0.5,
            transform: "translate(-50%) scale(1)",
          },
          { duration: 0, at: "<" },
        ],
        [
          ".your-reward-text",
          {
            bottom: 0,
            opacity: 0,
            transform: "translate(-50%)",
          },
          { duration: 0, at: "<" },
        ],
        [
          ".reward-nuts",
          {
            transform: "translateY(100px)",
            opacity: 0,
          },
          { duration: 0, at: "<" },
        ],
        [
          ".reward-lvl",
          {
            transform: "translateY(100px)",
            opacity: 0,
          },
          { duration: 0, at: "<" },
        ],
        [
          ".claim-btn",
          {
            transform: "translateY(100px)",
            opacity: 0,
          },
          { duration: 0, at: "<" },
        ],
        // Начало анимации
        [
          ".intro-text",
          { top: 0, opacity: 0 },
          { delay: 1.6, duration: 1, ease: "easeInOut" },
        ],
        [
          ".days",
          { top: "10%", transform: "translateX(-50%) scale(1)" },
          { duration: 1, delay: 1.2, at: "<", ease: "easeInOut" },
        ],
        [
          ".bottom-animation",
          { bottom: 0, opacity: 1, transform: "translateX(-50%) scale(1)" },
          { duration: 1, at: "-0.8", ease: "easeInOut" },
        ],
        [
          ".days-bar",
          {
            opacity: 1,
          },
          { duration: 0.6, ease: "easeInOut" },
        ],
        [
          ".active-bar",
          {
            width: "50%",
          },
          { duration: 1.5, at: "+0.5", ease: "anticipate" },
        ],
        [
          ".fire-icon",
          {
            left: "50%",
          },
          { duration: 1.5, at: "<", ease: "anticipate" },
        ],
        [
          ".prev-day",
          {
            opacity: 0.5,
            transform: "translate(-50%) scale(1)",
          },
          { duration: 0.2, at: "-0.8", ease: "easeInOut" },
        ],
        [
          ".current-day",
          {
            opacity: 1,
            transform: "translate(-50%) scale(1.15)",
          },
          { duration: 0.2, at: "-0.1", ease: "easeInOut" },
        ],
        [
          ".bottom-animation",
          {
            opacity: 0,
            transform: "translateX(-50%) scale(0.8)",
          },
          { duration: 0.6, at: "+0.4", ease: "easeInOut" },
        ],
      ])
      // Анимация, которая появляется после скипа
      animation.then(() => {
        animate([
          [
            ".your-reward-text",
            {
              bottom: "34%",
              opacity: 1,
              transform: "translate(-50%)",
            },
            { duration: 0.8, ease: "easeInOut" },
          ],
          [
            ".reward-nuts",
            {
              transform: "translateY(0px)",
              opacity: 1,
            },
            { delay: 0.3, duration: 0.8, at: "<", ease: "easeInOut" },
          ],
          [
            ".reward-lvl",
            {
              transform: "translateY(0px)",
              opacity: 1,
            },
            { delay: 0.45, duration: 0.8, at: "<", ease: "easeInOut" },
          ],
          [
            ".claim-btn",
            {
              transform: "translateY(0)",
              opacity: 1,
            },
            { delay: 0.6, duration: 0.8, at: "<", ease: "easeInOut" },
          ],
        ])
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

  if (!streak) return null

  const {
    todayStreakInfo: {
      dayNumber,
      nutsReward,
      percentageLvl,
      bonusPercentage,
      isMilestone,
      additionalReward,
    },
  } = streak!

  const onClaimClick = async () => {
    if (isClaimLoading || isClaimLocked) return

    makeHapticFeedback({ impactOccured: "rigid" })

    setIsClaimLocked(true)

    try {
      await claimStreak({ timezone, payForFreeze: true }).unwrap()

      setTimeout(() => {
        refetchCurrentUser()
        refetchStreak()
      }, 200)
    } catch {
      toast.error("Не удалось получить награду")
      setOpen(false)
    } finally {
      setTimeout(() => setIsClaimLocked(false), 1000)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="items-center overflow-hidden rounded-t-none p-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-top-0 data-[state=open]:slide-in-from-top-0">
        <DialogHeader className="sr-only">Your daily streak</DialogHeader>
        <Description className="sr-only">Daily streak modal</Description>
        <div className="relative h-screen w-screen" ref={scope}>
          {/* Приветственная фраза */}
          <span className="intro-text absolute left-1/2 w-[200px] -translate-x-1/2 text-center font-tt-hoves-expanded text-xl font-semibold tracking-[-0.02em] phone-sm-fix:w-[275px] phone-sm-fix:text-2xl">
            {t("Щёлк-щёлк, ты опять к нам?")}
          </span>

          {/* Текущий активный стрик */}
          <div className="days absolute left-1/2 flex flex-col">
            <span className="bg-[linear-gradient(to_bottom,#FFF6D7_1%,#FFF982_59%,#FB8329_84%)] bg-clip-text text-center font-tt-hoves-expanded text-[96px]/[100px] font-semibold text-transparent phone-sm-fix:text-[128px]/[140px]">
              {dayNumber}
            </span>
            <span className="text-center font-tt-hoves-expanded text-xl font-medium text-[#FBF9C2] phone-sm-fix:text-2xl">
              {t("дней в ударе!", { count: dayNumber })}
            </span>
          </div>

          {/* Анимация снизу экрана */}
          <Rive
            className="bottom-animation absolute left-1/2 h-[200px] w-screen max-w-[350px] phone-xsm:h-[300px]"
            src="/fire.riv"
          />

          {/* Шкала с ближайшими днями и огоньком */}
          <div
            className={cn(
              "days-bar absolute top-1/2 flex h-[67px] w-full -translate-y-1/2 flex-col gap-4 phone-sm-fix:h-[77px] phone-sm-fix:gap-5",
              Telegram.WebApp.platform === "tdesktop"
                ? "-mt-3"
                : "max-phone-sm:-mt-5",
            )}
          >
            <div className="relative mx-[14px] mt-3 h-4 w-auto bg-[#17202D] phone-sm-fix:mx-4 phone-sm-fix:mt-[18px]">
              <div className="active-bar absolute bottom-0 left-0 top-0 w-1/2 bg-gradient-to-r from-[#FFFD95] to-[#F0311A]" />
              <div className="fire-icon absolute -top-3 left-0 h-9 w-9 -translate-x-[18px] phone-sm-fix:h-[42px] phone-sm-fix:w-[42px] phone-sm-fix:-translate-x-[21px]">
                <FireIcon className="h-9 w-9 phone-sm-fix:h-[42px] phone-sm-fix:w-[42px]" />
              </div>
            </div>
            <div className="relative mx-[14px] h-6 text-base font-medium phone-sm-fix:mx-4">
              <span className="absolute left-0 top-0 text-[#FC9D2C]/50">
                {dayNumber > 2 && dayNumber - 3}
              </span>
              <span className="absolute left-[calc(100%_/_6)] top-0 -translate-x-1/2 text-[#FC9D2C]/50">
                {dayNumber > 1 && dayNumber - 2}
              </span>
              <span className="prev-day absolute left-[calc(100%_/_6_*2)] top-0 text-[#FC9D2C]">
                {dayNumber > 0 && dayNumber - 1}
              </span>
              <span className="current-day absolute left-1/2 top-0 text-[#FC9D2C]">
                {dayNumber}
              </span>
              <span className="absolute right-[calc(100%_/_6_*2)] top-0 translate-x-1/2 text-white/50">
                {dayNumber + 1}
              </span>
              <span className="absolute right-[calc(100%_/_6_*1)] top-0 translate-x-1/2 text-white/50">
                {dayNumber + 2}
              </span>
              <span className="absolute right-0 top-0 text-white/50">
                {dayNumber + 3}
              </span>
            </div>
          </div>

          {/* Ваша награда - текст */}
          <span className="your-reward-text absolute left-1/2 text-lg font-medium text-white/50 phone-sm-fix:text-xl">
            {t("Ваша награда")}
          </span>

          {/* Награды за текущий день */}
          <div
            className={cn(
              "absolute bottom-[18%] left-1/2 flex h-[72px] w-[300px] -translate-x-1/2 items-center phone-sm-fix:bottom-[18%] phone-sm-fix:h-[84px] phone-sm-fix:w-[345px]",
              isMilestone || additionalReward !== null
                ? "justify-between"
                : "justify-center",
            )}
          >
            <div className="reward-nuts flex h-[72px] w-[128px] items-center justify-center gap-2.5 rounded-[14px] bg-[#17202D] phone-sm-fix:h-[84px] phone-sm-fix:w-[142px] phone-sm-fix:gap-1.5">
              <CoinIcon className="h-7 w-7 phone-sm-fix:h-9 phone-sm-fix:w-9" />
              <span className="font-tt-hoves-expanded text-2xl font-semibold text-white phone-sm-fix:text-[28px]">
                {numberWithSpaces(nutsReward)}
              </span>
            </div>
            {additionalReward !== null ? (
              <StreakReward
                rewardSrc={additionalReward.img}
                rewardName={additionalReward.name}
                className="reward-lvl h-[72px]"
              />
            ) : (
              isMilestone && (
                <StreakBooster
                  percentageLvl={percentageLvl}
                  bonusPercentage={bonusPercentage}
                  className="reward-lvl h-[72px]"
                />
              )
            )}
          </div>

          {/* Кнопка клейма */}
          <LargeButton
            appearance="yellow-linear"
            onClick={onClaimClick}
            className={cn(
              "claim-btn absolute inset-x-3.5 w-auto phone-sm-fix:inset-x-4",
              Telegram.WebApp.platform === "weba"
                ? "bottom-5"
                : "bottom-[max(var(--tg-safe-area-inset-bottom,20px),20px)]",
            )}
          >
            {isClaimLoading || isClaimLocked ? (
              <Loader className="animate-spin" />
            ) : (
              t("Забрать")
            )}
          </LargeButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DailyStreakDialog
