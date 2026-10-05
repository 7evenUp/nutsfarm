import { useEffect, useState } from "react"
import { Description } from "@radix-ui/react-dialog"
import { useTranslation } from "react-i18next"

import CoinIcon from "@/assets/icons/coin.svg?react"
import FireStreakIcon from "./FireStreakIcon"

import DaysCarousel from "./NewDaysCarousel"

import StreakRank from "@/components/StreakRank"
import StreakBooster from "@/components/StreakBooster"
import StreakReward from "@/components/StreakReward"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/shared/ui/SideSheet"

import { useGetCurrentStreakQuery } from "@/redux/api/streak"

import { StreakDay } from "@/types/streak"

import { numberWithSpaces } from "@/utils/numberWithSpaces"
import { sendMetrika } from "@/utils/sendMetrika"

import { cn } from "@/lib/cn"

const CurrentStreakDialog = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedDayInfo, setSelectedDayInfo] = useState<StreakDay | null>(null)
  // const [isClaimLocked, setIsClaimLocked] = useState(false)

  const { data: streak } = useGetCurrentStreakQuery({
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  })
  // const [claim, { isLoading: isClaimLoading }] = useClaimRewardMutation()

  // const daysWithRewards = useMemo(() => {
  //   if (!rewards || rewards.length === 0) return []

  //   const arr: number[] = []
  //   rewards.forEach((reward) => {
  //     if (!reward.isPrizeClaimed) arr.push(reward.streakDay.dayNumber)
  //   })

  //   return arr
  // }, [rewards])

  useEffect(() => {
    if (!open) {
      setSelectedDay(null)
      setSelectedDayInfo(null)
    }
  }, [open])

  if (!streak) return null

  const {
    todayStreakInfo: {
      dayNumber,
      nutDashRank,
      bonusPercentage,
      percentageLvl,
      nutsReward,
      isMilestone,
      additionalReward,
    },
  } = streak

  // const onClaimClick = async () => {
  //   if (isClaimLoading || isClaimLocked) return
  //   if (!rewards) return

  //   const neededReward = rewards.find(
  //     (reward) => reward.streakDay.dayNumber === selectedDay,
  //   )

  //   if (!neededReward) return

  //   makeHapticFeedback({ impactOccured: "rigid" })

  //   setIsClaimLocked(true)

  //   try {
  //     await claim({ rewardId: neededReward.id }).unwrap()
  //   } catch (error) {
  //     // @ts-expect-error NO_RTKQ_ERROR_TYPES
  //     if (error.data && error.data.includes("Where's the ton wallet")) {
  //       toast.error("Сперва привяжите TON кошелёк")
  //     } else {
  //       toast.error(t("Ошибка"), {
  //         description: t("Упс, что-то пошло не так"),
  //       })
  //     }
  //   } finally {
  //     setTimeout(() => setIsClaimLocked(false), 1000)
  //   }
  // }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={className}
        onClick={() => {
          sendMetrika("streak", { currentStreak: dayNumber })
        }}
      >
        {children}
      </SheetTrigger>
      <SheetContent
        className={cn(
          "h-[100dvh] max-h-[100dvh] gap-0 overflow-hidden overflow-y-scroll rounded-t-none px-0 pb-0",
          Telegram.WebApp.platform === "weba"
            ? "pb-8"
            : "pb-[max(var(--tg-safe-area-inset-bottom,16px),32px)]",
        )}
      >
        <Description className="sr-only">
          Current daily streak modal
        </Description>

        <SheetHeader />

        <div className="mx-auto flex flex-col items-center justify-center h-screen-740:pt-20">
          <FireStreakIcon day={dayNumber} />
          <span className="mt-1.5 font-tt-hoves-expanded text-2xl font-semibold text-white phone-sm-fix:mt-2 phone-sm-fix:text-[28px]">
            {t("дней в ударе!", {
              count: dayNumber,
            })}
          </span>
        </div>

        <DaysCarousel
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          setSelectedDayInfo={setSelectedDayInfo}
          daysWithRewards={[]}
        />

        <span className="mb-8 self-center text-balance px-4 text-center font-nunito text-xs font-medium text-white/75 phone-sm-fix:mb-[70px] phone-sm-fix:text-sm">
          {t(
            "Каждый день заходи в Nuts Farm, прокачивай уровень и получай дополнительные бонусы!",
          )}
        </span>

        <span className="mb-3.5 text-center text-xs font-medium text-white/75 phone-sm-fix:mb-5 phone-sm-fix:text-sm">
          {selectedDay
            ? selectedDay < dayNumber
              ? t("Вы уже получили эти бонусы")
              : selectedDay === dayNumber
                ? t("Бонусы сегодня")
                : t("Бонусы, которые ждут тебя")
            : t("Бонусы сегодня")}
        </span>

        <div className="flex gap-2 self-center">
          <div className="flex h-[77px] w-[128px] items-center justify-center gap-2.5 rounded-[14px] bg-[#17202D] phone-sm-fix:h-[84px] phone-sm-fix:w-[142px] phone-sm-fix:gap-2">
            <CoinIcon className="h-7 w-7 phone-sm-fix:h-8 phone-sm-fix:w-8" />
            <span className="font-tt-hoves-expanded text-2xl font-semibold text-white phone-sm-fix:text-[28px]">
              {selectedDay === null || selectedDay === dayNumber
                ? numberWithSpaces(nutsReward)
                : numberWithSpaces(selectedDayInfo?.nutsReward || 0)}
            </span>
          </div>
          {selectedDay === null || selectedDay === dayNumber ? (
            additionalReward ? (
              <StreakReward
                rewardSrc={additionalReward.img}
                rewardName={additionalReward.name}
              />
            ) : (
              isMilestone && (
                <StreakBooster
                  bonusPercentage={bonusPercentage}
                  percentageLvl={percentageLvl}
                />
              )
            )
          ) : selectedDayInfo?.additionalReward ? (
            <StreakReward
              rewardSrc={selectedDayInfo.additionalReward.img}
              rewardName={selectedDayInfo.additionalReward.name}
            />
          ) : (
            selectedDayInfo?.isMilestone && (
              <StreakBooster
                bonusPercentage={selectedDayInfo.bonusPercentage}
                percentageLvl={selectedDayInfo.percentageLvl}
              />
            )
          )}
        </div>

        <div className="mx-auto mt-3 flex w-[296px] items-center justify-between rounded-xl bg-[#17202D] py-3 pl-4 pr-3 phone-sm-fix:mt-5 phone-sm-fix:w-[337px] phone-sm-fix:py-3.5 phone-sm-fix:pr-3.5">
          <span className="text-xs font-medium text-white/75 phone-sm-fix:text-sm">
            {t("Твоё звание:")}
          </span>
          <StreakRank nutDashRank={nutDashRank} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default CurrentStreakDialog
