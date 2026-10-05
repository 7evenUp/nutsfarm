import { useEffect, useMemo, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { useTranslation } from "react-i18next"

import HiddenAchievementPNG from "@/assets/images/hidden-achievement.png"

import AchievementPreviewDialog from "./AchievementPreview"

import { Skeleton } from "@/shared/ui/Skeleton"

import { useGetAchievementsQuery } from "@/redux/api/achievement"
import { useAppSelector } from "@/redux/hooks"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

import { cn } from "@/lib/cn"

const Achievements = () => {
  const { t } = useTranslation()

  const [activeTab, setActiveTab] = useState<"all" | "claimed">("all")

  const [emblaRef, emblaApi] = useEmblaCarousel({
    dragFree: true,
    loop: false,
  })

  const lang = useAppSelector((state) => state.language.value)

  const { data: achievements, isLoading } = useGetAchievementsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })

  const filteredAchievements = useMemo(() => {
    if (!achievements) return null
    if (achievements.length === 0) return null

    return achievements.filter((achievement) =>
      activeTab === "all" ? achievement : achievement.userStatus !== null,
    )
  }, [activeTab, achievements])

  const hasUnclaimed = useMemo(() => {
    if (!achievements) return null
    if (achievements.length === 0) return null

    return achievements.some(
      (achievement) => achievement.userStatus === "RECEIVED",
    )
  }, [achievements])

  useEffect(() => {
    if (!emblaApi) return

    emblaApi.scrollTo(0)
  }, [activeTab])

  if (isLoading) return <AchievementsSkeleton />

  if (filteredAchievements === null) return null

  return (
    <div className="mb-[22px] flex flex-col">
      <span className="mb-[18px] ml-4 font-tt-hoves-expanded text-lg font-semibold text-white">
        {t("Достижения")}
      </span>
      <div className="mb-3 flex items-center gap-2 px-4">
        <button
          className={cn(
            "flex h-8 items-center rounded-full bg-[#17202D] px-4 text-white/30 transition-colors",
            activeTab === "all" && "bg-[#252E3D] text-white",
          )}
          onClick={() => {
            makeHapticFeedback({ impactOccured: "soft" })
            setActiveTab("all")
          }}
        >
          {t("Все")}
        </button>
        <button
          className={cn(
            "flex h-8 items-center rounded-full bg-[#17202D] px-4 text-white/30 transition-colors",
            activeTab === "claimed" && "bg-[#252E3D] text-white",
          )}
          onClick={() => {
            makeHapticFeedback({ impactOccured: "soft" })
            setActiveTab("claimed")
          }}
        >
          <span className="relative">
            {t("Полученные")}
            {hasUnclaimed && (
              <div className="absolute -right-1.5 top-0.5 h-[5px] w-[5px] rounded-full bg-cyan" />
            )}
          </span>
        </button>
      </div>

      {filteredAchievements.length > 0 ? (
        <div
          className="w-full cursor-grab overflow-hidden px-4 active:cursor-grabbing"
          ref={emblaRef}
        >
          <div className="flex items-start gap-2">
            {filteredAchievements.map((item) => {
              if (!item.isActive) return

              return (
                <AchievementItem
                  key={item.id}
                  achievementId={item.id}
                  imgSrc={lang === "RU" ? item.image : item.imageEn}
                  title={
                    item.isHidden && item.userStatus === null
                      ? t("Скрытое")
                      : lang === "RU"
                        ? item.title
                        : item.titleEn
                  }
                  description={
                    item.isHidden && item.userStatus === null
                      ? t(
                          "Это достижение скрыто. Попробуйте отгадать, как его получить",
                        )
                      : lang === "RU"
                        ? item.description
                        : item.descriptionEn
                  }
                  isClaimed={item.userStatus === "CLAIMED"}
                  status={item.userStatus}
                  reward={item.reward}
                  nutPassXp={item.nutPassXp}
                />
              )
            })}
          </div>
        </div>
      ) : (
        <span className="px-4 text-sm font-semibold text-white/75">
          У вас пока что нет достижений
        </span>
      )}
    </div>
  )
}

export default Achievements

const AchievementItem = ({
  achievementId,
  imgSrc,
  title,
  description,
  reward,
  isClaimed,
  status,
  nutPassXp,
}: {
  achievementId: number
  imgSrc: string | null
  title: string
  description: string
  reward: number
  nutPassXp: number
  isClaimed: boolean
  status: null | string
}) => {
  return (
    <AchievementPreviewDialog
      achievementId={achievementId}
      description={description}
      isClaimed={isClaimed}
      reward={reward}
      nutPassXp={nutPassXp}
      src={imgSrc}
      title={title}
      status={status}
    >
      <button
        className="relative flex w-[168px] shrink-0 flex-col gap-2.5"
        onClick={() => {
          makeHapticFeedback({ impactOccured: "soft" })
        }}
      >
        {status === "RECEIVED" && (
          <div className="absolute right-1.5 top-1.5 flex h-5 items-center justify-center rounded-md bg-gradient-to-b from-[#FE5541] to-[#F4371A] px-1 text-[10px]/[14px] font-bold text-background">
            <span className="translate-y-px">NEW</span>
          </div>
        )}
        <div className="flex h-[168px] w-full items-center justify-center rounded-xl bg-[#17202D]">
          <img
            src={imgSrc ?? HiddenAchievementPNG}
            loading="lazy"
            className={cn(
              "h-full w-full",
              status === null && imgSrc && "opacity-30",
            )}
          />
        </div>
        <span
          className={cn(
            "text-left text-sm/4 font-semibold",
            status === null && "opacity-70",
          )}
        >
          {title}
        </span>
      </button>
    </AchievementPreviewDialog>
  )
}

const AchievementsSkeleton = () => (
  <div className="mb-10 flex flex-col">
    <Skeleton className="mb-[18px] ml-4 h-7 w-20" />
    <div className="mb-3 flex items-center gap-2 px-4">
      <Skeleton className="h-8 w-16 rounded-full" />
      <Skeleton className="h-8 w-32 rounded-full" />
    </div>
    <div className="flex gap-2 pl-4">
      <div className="flex w-[168px] flex-col gap-2.5">
        <Skeleton className="h-[168px] w-[168px] rounded-xl" />
        <Skeleton className="h-[16px] w-[110px]" />
      </div>
      <div className="flex w-[168px] flex-col gap-2.5">
        <Skeleton className="h-[168px] w-[168px] rounded-xl" />
        <Skeleton className="h-[32px] w-[140px]" />
      </div>
      <div className="flex w-[168px] flex-col gap-2.5">
        <Skeleton className="h-[168px] w-[168px] rounded-xl" />
        <Skeleton className="h-[16px] w-[100px]" />
      </div>
    </div>
  </div>
)
