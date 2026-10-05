import useEmblaCarousel from "embla-carousel-react"

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
  daysWithRewards,
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
  } = streak!

  const [emblaRef, emblaApi] = useEmblaCarousel({
    dragFree: true,
    containScroll: false,
    loop: false,
    startIndex: dayNumber - 1,
  })

  if (isLoading) return <DaysLoader />

  if (!mapData) return null

  return (
    <div className="no-scroll relative my-6 flex h-[72px] shrink-0 items-center overflow-x-auto font-tt-hoves-expanded text-black phone-xsm:my-8">
      <div className="absolute inset-x-0 h-2 bg-[#17202D]" />

      <div
        className="w-full cursor-grab overflow-hidden active:cursor-grabbing"
        ref={emblaRef}
      >
        <div className="flex items-center gap-[18px]">
          {Object.entries(mapData).map(([key, value]) => {
            const mapDay = parseInt(key)

            if (mapDay === dayNumber) {
              return (
                <div
                  key={key}
                  className="relative z-40 flex h-[70px] w-[70px] shrink-0 items-center justify-center rounded-full text-4xl font-semibold"
                >
                  <div className="absolute left-0.5 h-2 w-[5000px] -translate-x-full bg-[#17202D] bg-gradient-to-b from-[#9BCDF0] to-[#68BBFF]" />
                  <button
                    className={cn(
                      "relative flex h-full w-full items-center justify-center rounded-full",
                      selectedDay && selectedDay === mapDay
                        ? "bg-white text-[#17202D]"
                        : "bg-gradient-to-b from-[#9BCDF0] to-[#68BBFF]",
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
                </div>
              )
            } else
              return (
                <button
                  key={key}
                  className={cn(
                    "relative z-50 flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full text-sm font-medium phone-sm-fix:h-12 phone-sm-fix:w-12",
                    value.isMilestone &&
                      mapDay < dayNumber &&
                      "border border-white font-semibold text-white",
                    value.isMilestone &&
                      mapDay > dayNumber &&
                      "border border-[#64B9FF] font-semibold text-[#64B9FF]",
                    selectedDay && selectedDay === mapDay
                      ? "bg-white text-[#17202D]"
                      : mapDay < dayNumber
                        ? "bg-gradient-to-b from-[#9BCDF0] to-[#68BBFF]"
                        : mapDay > dayNumber && "bg-[#17202D] text-white",
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
                  {daysWithRewards.includes(mapDay) && (
                    <div className="absolute -right-0.5 -top-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                  )}
                </button>
              )
          })}
        </div>
      </div>
    </div>
  )
}

export default DaysCarousel

export const DaysLoader = () => (
  <div className="my-6 flex h-[72px] shrink-0 items-center justify-center phone-xsm:my-8">
    <Skeleton className="absolute inset-x-0 h-2 bg-[#17202D]" />

    <div className="flex items-center gap-[18px]">
      <Skeleton className="relative z-50 flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-[#17202D] text-sm font-medium phone-sm-fix:h-12 phone-sm-fix:w-12" />

      <Skeleton className="relative z-50 flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-[#17202D] text-sm font-medium phone-sm-fix:h-12 phone-sm-fix:w-12" />

      <div className="relative z-40 flex h-[70px] w-[70px] shrink-0 items-center justify-center rounded-full text-4xl font-semibold">
        <Skeleton className="relative flex h-full w-full items-center justify-center rounded-full bg-[#17202D]" />
      </div>

      <Skeleton className="relative z-50 flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-[#17202D] text-sm font-medium phone-sm-fix:h-12 phone-sm-fix:w-12" />

      <Skeleton className="relative z-50 flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-[#17202D] text-sm font-medium phone-sm-fix:h-12 phone-sm-fix:w-12" />
    </div>
  </div>
)
