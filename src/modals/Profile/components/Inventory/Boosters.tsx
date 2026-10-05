import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import useEmblaCarousel from "embla-carousel-react"

import PointsOnce from "./BoosterItems/PointsOnce"
import FarmingDuration from "./BoosterItems/FarmingDuration"
import PointsPerSecond from "./BoosterItems/PointsPerSecond"
import XpBonus from "./BoosterItems/XpBonus"

import { Skeleton } from "@/shared/ui/Skeleton"

import { useGetBoostersQuery } from "@/redux/api/items"

import { Booster, BoosterBonusType } from "@/types/item"

const Boosters = () => {
  const { t } = useTranslation()

  const [emblaRef] = useEmblaCarousel({
    dragFree: true,
    loop: false,
  })

  const { data: boosters, isLoading: isBoostersLoading } = useGetBoostersQuery()

  const groupedBoosters = useMemo(() => {
    if (!boosters) return null
    if (boosters.length === 0) return null

    const groupedBoosters: Record<BoosterBonusType, Booster[]> = {
      FARMING_DURATION: [],
      POINTS_ONCE_BONUS: [],
      POINTS_PER_SECOND: [],
      XP_BONUS: [],
    }

    boosters.forEach((booster) =>
      groupedBoosters[booster.bonusType].push(booster),
    )

    return groupedBoosters
  }, [boosters])

  if (isBoostersLoading) return <BoostersSkeleton />

  if (groupedBoosters && boosters && boosters.length > 0)
    return (
      <div
        className="w-full cursor-grab overflow-hidden px-4 active:cursor-grabbing"
        ref={emblaRef}
      >
        <div className="flex items-center gap-2">
          <PointsOnce boosters={groupedBoosters.POINTS_ONCE_BONUS} />
          <FarmingDuration boosters={groupedBoosters.FARMING_DURATION} />
          <PointsPerSecond boosters={groupedBoosters.POINTS_PER_SECOND} />
          <XpBonus boosters={groupedBoosters.XP_BONUS} />
        </div>
      </div>
    )

  return (
    <div className="mx-4 flex h-[249px] flex-col items-center justify-center rounded-xl bg-[#17202D]">
      <p className="mb-3 text-center text-lg">{t("Сейчас здесь пусто")}</p>
      <p className="text-balance px-3 text-center text-sm font-medium">
        {t(
          "Совсем скоро здесь появятся твои бустеры, которые можно будет активировать и фармить больше NUTS",
        )}
      </p>
    </div>
  )
}

export default Boosters

const BoostersSkeleton = () => {
  return (
    <div className="flex items-center gap-2.5 px-4">
      <Skeleton className="h-[249px] w-[168px] shrink-0 rounded-xl" />
      <Skeleton className="h-[249px] w-[168px] shrink-0 rounded-xl" />
      <Skeleton className="h-[249px] w-[168px] shrink-0 rounded-xl" />
    </div>
  )
}
