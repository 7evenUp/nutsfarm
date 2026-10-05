import { useMemo } from "react"
import useEmblaCarousel from "embla-carousel-react"

import StoryGradientBorder from "@/assets/icons/story-gradient-border.svg?react"
import StoryBorder from "@/assets/icons/story-border.svg?react"
import CoinPng from "@/assets/images/coin.png"

import {
  useGetCurrentStoriesQuery,
  useGetStoriesQuery,
} from "@/redux/api/stories"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { setOpenedStoryId } from "@/redux/slices/story"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

import { cn } from "@/lib/cn"

const Stories = () => {
  const lang = useAppSelector((state) => state.language.value)

  const [emblaRef] = useEmblaCarousel({
    dragFree: true,
    loop: false,
  })

  const { data } = useGetStoriesQuery()
  const { data: currentStories } = useGetCurrentStoriesQuery()

  const sortedUnreadStories = useMemo(() => {
    if (!data || !currentStories) return null

    return [...data]
      .filter(
        (story) =>
          !currentStories.find(
            (currentStory) => currentStory.story.id === story.id,
          ),
      )
      .sort((a, b) => {
        if (a.pageNumber === null) return -1
        if (b.pageNumber === null) return 1
        return a.pageNumber - b.pageNumber
      })
  }, [data, currentStories])

  const sortedReadStories = useMemo(() => {
    if (!data || !currentStories) return null

    return [...data]
      .filter((story) =>
        currentStories.find(
          (currentStory) => currentStory.story.id === story.id,
        ),
      )
      .sort((a, b) => {
        if (a.pageNumber === null) return -1
        if (b.pageNumber === null) return 1
        return a.pageNumber - b.pageNumber
      })
  }, [data, currentStories])

  if (sortedUnreadStories === null || sortedReadStories === null) return null

  const sortedStories = [...sortedUnreadStories, ...sortedReadStories]

  return (
    <div
      className="z-50 h-[78px] w-full cursor-grab overflow-hidden px-4 active:cursor-grabbing"
      ref={emblaRef}
    >
      <div className="flex items-center gap-1.5">
        {sortedStories.map(
          (story, i) =>
            story.storyParts.length > 0 && (
              <StoryCard
                key={story.id}
                pointsBonus={story.pointsBonus}
                storyId={story.id}
              >
                <span className="relative z-10 text-[10px]/[11px] font-bold">
                  {lang === "RU" ? story.title : story.titleEn}
                </span>
                {story.image && lang === "RU" && (
                  <img
                    src={story.image}
                    alt={"История №" + i}
                    className="absolute inset-0 h-full w-full rounded-[7px] object-cover"
                  />
                )}
                {story.imageEn && lang === "EN" && (
                  <img
                    src={story.imageEn}
                    alt={"Story №" + i}
                    className="absolute inset-0 h-full w-full rounded-[7px] object-cover"
                  />
                )}
              </StoryCard>
            ),
        )}
      </div>
    </div>
  )
}

export default Stories

const StoryCard = ({
  children,
  isDisabled,
  pointsBonus,
  storyId,
}: {
  children: React.ReactNode
  isDisabled?: boolean
  pointsBonus: number
  storyId: string
}) => {
  const dispatch = useAppDispatch()

  const { data: currentStories } = useGetCurrentStoriesQuery()

  if (!currentStories) return null

  return (
    <button
      key={currentStories.length}
      className="relative z-[1] flex h-[74px] w-[74px] shrink-0 items-center justify-center focus:outline-none"
      onClick={() => {
        makeHapticFeedback({ impactOccured: "light" })
        dispatch(setOpenedStoryId(storyId))
      }}
    >
      {currentStories.find(
        (currentStory) => currentStory.story.id === storyId,
      ) ? (
        <StoryBorder className="absolute left-0 top-0" />
      ) : (
        <StoryGradientBorder className="absolute left-0 top-0" />
      )}
      <div
        className={cn(
          "relative flex h-[67px] w-[67px] rounded-[7px] bg-[#262B31] px-1.5 pt-1.5",
          isDisabled && "bg-[#262B31]/30",
        )}
      >
        {children}
        {!currentStories.find(
          (currentStory) => currentStory.story.id === storyId,
        ) && (
          <div className="absolute -bottom-2 -left-2 z-50 flex items-center rounded-full border border-background py-px pl-0.5 pr-[5px] text-[10px] font-bold text-[#FEEE1F] backdrop-blur">
            <img src={CoinPng} alt="Nuts coin icon" className="mr-0.5 size-3" />
            <span className="translate-y-px">+{pointsBonus}</span>
          </div>
        )}
      </div>
    </button>
  )
}
