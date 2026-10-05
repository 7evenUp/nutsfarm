import { useEffect } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { useTranslation } from "react-i18next"

import HiddenAchievementPNG from "@/assets/images/hidden-achievement.png"

import { useAppSelector } from "@/redux/hooks"

import { Achievement } from "@/types/achievements"

interface AchievementsListProps {
  achievements: Achievement[]
}

const AchievementsList = ({ achievements }: AchievementsListProps) => {
  const { t } = useTranslation()

  const lang = useAppSelector((state) => state.language.value)

  const [emblaRef, emblaApi] = useEmblaCarousel({
    dragFree: true,
    loop: false,
  })

  useEffect(() => {
    if (!emblaApi) return

    emblaApi.scrollTo(0)
  }, [emblaApi])

  return (
    <div className="mt-9 flex flex-col gap-4">
      <p className="pl-3.5 font-tt-hoves-expanded text-lg/6 font-semibold">
        {t("Достижения")}
      </p>

      <div
        className="w-full cursor-grab overflow-hidden px-3.5 active:cursor-grabbing"
        ref={emblaRef}
      >
        <div className="flex items-start gap-2">
          {achievements.map((item) => {
            if (!item.isActive) return

            return (
              <AchievementItem
                key={item.id}
                imgSrc={lang === "RU" ? item.image : item.imageEn}
                title={
                  item.isHidden && item.userStatus === null
                    ? t("Скрытое")
                    : lang === "RU"
                      ? item.title
                      : item.titleEn
                }
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default AchievementsList

const AchievementItem = ({
  imgSrc,
  title,
}: {
  imgSrc: string | null
  title: string
}) => {
  return (
    <div className="relative flex w-[168px] shrink-0 flex-col gap-2.5">
      <div className="flex h-[168px] w-full items-center justify-center rounded-xl bg-[#17202D]">
        <img
          src={imgSrc ?? HiddenAchievementPNG}
          loading="lazy"
          className="h-full w-full"
        />
      </div>
      <span className="text-left text-sm/4 font-semibold">{title}</span>
    </div>
  )
}
