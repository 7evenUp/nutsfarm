import { useMemo } from "react"
import useEmblaCarousel from "embla-carousel-react"

import ClaimedDayIcon from "./ClaimedDayIcon"
import FreezeDayIcon from "./FreezeDayIcon"

import { Skeleton } from "@/shared/ui/Skeleton"

import {
  useGetCurrentStreakQuery,
  useGetStreakMapQuery,
} from "@/redux/api/streak"

import { StreakDay } from "@/types/streak"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

import { cn } from "@/lib/cn"

const DaysCarousel = ({
  selectedDay,
  setSelectedDay,
  setSelectedDayInfo,
}: {
  selectedDay: number | null
  setSelectedDay: React.Dispatch<React.SetStateAction<number | null>>
  setSelectedDayInfo: React.Dispatch<React.SetStateAction<StreakDay | null>>
  daysWithRewards: number[]
}) => {
  const { data: streak } = useGetCurrentStreakQuery({
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  })
  const { data: mapData, isLoading } = useGetStreakMapQuery()

  const {
    todayStreakInfo: { dayNumber },
    streakDays,
  } = streak!

  const freezeDays = useMemo(() => {
    const neededDays: number[] = []
    let foundFrozen = false
    let offset = 0

    if (streakDays === undefined) return []
    if (streakDays.length === 0) return []

    for (let i = 0; i < streakDays.length; i++) {
      if (foundFrozen) {
        if (!streakDays[i].freezing) {
          neededDays.push(i + 1 - offset)
          foundFrozen = false
        } else {
          offset++
        }
      } else {
        if (streakDays[i].freezing) {
          foundFrozen = true
          offset++
        }
      }
    }

    if (streakDays[streakDays.length - 1].freezing) {
      neededDays.push(streakDays.length - offset)
    }

    return neededDays
  }, [streak])

  const [emblaRef, emblaApi] = useEmblaCarousel({
    dragFree: true,
    containScroll: false,
    loop: false,
    startIndex: dayNumber - 1,
  })

  if (isLoading) return <DaysLoader />

  if (!mapData) return null

  return (
    <div className="no-scroll relative my-6 flex shrink-0 items-center overflow-x-auto font-tt-hoves-expanded text-black phone-sm-fix:my-8">
      <div
        className="flex h-[45px] w-full cursor-grab items-center justify-center overflow-hidden active:cursor-grabbing"
        ref={emblaRef}
      >
        <div className="flex items-center gap-[18px]">
          {Object.entries(mapData).map(([key, value]) => {
            const mapDay = parseInt(key)

            if (mapDay <= dayNumber) {
              return (
                <div
                  key={key}
                  className="relative z-40 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-4xl font-semibold"
                >
                  <button
                    className="relative flex h-full w-full items-center justify-center rounded-full"
                    aria-label={"Reward for day " + key}
                    onClick={() => {
                      makeHapticFeedback({ impactOccured: "light" })

                      emblaApi?.scrollTo(mapDay - 1)

                      setSelectedDay(mapDay)
                      setSelectedDayInfo(value)
                    }}
                  >
                    {freezeDays.includes(mapDay) ? (
                      <FreezeDayIcon isSelected={selectedDay === mapDay} />
                    ) : (
                      <ClaimedDayIcon isSelected={selectedDay === mapDay} />
                    )}
                  </button>
                </div>
              )
            } else {
              return (
                <button
                  key={key}
                  className={cn(
                    "relative z-50 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#17202D] text-sm font-medium text-white",
                    value.isMilestone &&
                      mapDay > dayNumber &&
                      "text-[#F9B51C80]/50",
                    selectedDay &&
                      selectedDay === mapDay &&
                      "bg-white text-[#17202D]",
                  )}
                  aria-label={"Reward for day " + key}
                  onClick={() => {
                    makeHapticFeedback({ impactOccured: "light" })

                    emblaApi?.scrollTo(mapDay - 1)

                    setSelectedDay(mapDay)
                    setSelectedDayInfo(value)
                  }}
                >
                  {key}
                </button>
              )
            }
          })}
        </div>
      </div>
    </div>
  )
}

export default DaysCarousel

const DaysLoader = () => (
  <div className="my-6 flex h-[45px] shrink-0 items-center justify-center phone-xsm:my-8">
    <div className="flex items-center gap-[18px]">
      <Skeleton className="h-9 w-9 rounded-full" />
      <Skeleton className="h-9 w-9 rounded-full" />
      <Skeleton className="h-9 w-9 rounded-full" />
      <Skeleton className="h-9 w-9 rounded-full" />
      <Skeleton className="h-9 w-9 rounded-full" />
      <Skeleton className="h-9 w-9 rounded-full" />
      <Skeleton className="h-9 w-9 rounded-full" />
    </div>
  </div>
)
