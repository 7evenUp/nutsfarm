import { memo, useEffect, useState } from "react"
import Stories, { WithSeeMore } from "react-insta-stories"
import { Story as InstaStory } from "react-insta-stories/dist/interfaces"
import { useNavigate } from "react-router-dom"

import LoadingScreen from "@/modules/LoadingScreen"

import { LargeButton } from "@/shared/ui/LargeButton"

import { useGetStoryByIdQuery } from "@/redux/api/stories"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { setOpenedStoryId } from "@/redux/slices/story"

import { cn } from "@/lib/cn"

const StoryPartsPreview = memo(
  ({
    setStoryPartIndex,
  }: {
    setStoryPartIndex: React.Dispatch<React.SetStateAction<number | null>>
  }) => {
    const navigate = useNavigate()

    const [isImageLoaded, setIsImageLoaded] = useState(false)

    const dispatch = useAppDispatch()
    const { openedStoryId: storyId } = useAppSelector((state) => state.story)
    const lang = useAppSelector((state) => state.language.value)

    const { data: story, isLoading } = useGetStoryByIdQuery(
      { storyId: storyId! },
      { skip: storyId === undefined || storyId === null },
    )

    useEffect(() => {
      if (!story) return

      const cacheImage = async () => {
        const promise = new Promise((resolve, reject) => {
          if (lang === "RU") {
            if (!story.storyParts[0].image) return

            const img = new Image()
            img.src = story.storyParts[0].image
            img.onload = resolve
            img.onerror = reject
          }

          if (lang === "EN") {
            if (!story.storyParts[0].imageEn) return

            const img = new Image()
            img.src = story.storyParts[0].imageEn
            img.onload = resolve
            img.onerror = reject
          }
        })

        await promise
        setIsImageLoaded(true)
      }

      cacheImage()
    }, [story])

    if (isLoading || !isImageLoaded) return <LoadingScreen />

    if (!storyId || !story) return null

    const openLinkWithTg = (url: string) => {
      if (url === "https://nutsfarm.crypton.xyz/pass") {
        navigate("/pass")
      } else if (url === "https://nutsfarm.crypton.xyz/pass-onboarding") {
        navigate("/pass?showOnboarding=true")
      } else {
        url.includes("https://t.me")
          ? Telegram.WebApp.openTelegramLink(url)
          : Telegram.WebApp.openLink(url)
      }
    }

    if (story && story.storyParts.length > 0) {
      const storyParts: InstaStory[] = story.storyParts.map((part, i) => {
        const splitedImg =
          lang === "RU" ? part.image.split(".") : part.imageEn.split(".")
        const fileExtension = splitedImg[splitedImg.length - 1]
        const knownExtensions = [
          "MP4",
          "MOV",
          "AVI",
          "WMV",
          "MKV",
          "WebM",
          "FLV",
          "MPEG",
        ]

        if (knownExtensions.includes(fileExtension.toUpperCase()))
          return {
            type: "video",
            url: lang === "RU" ? part.image : part.imageEn,
          }

        return {
          content: ({ action, story }) => {
            if (part.buttonText && part.url)
              return (
                <WithSeeMore
                  story={story}
                  action={action}
                  customCollapsed={({ action }) => (
                    <div className="w-full px-4 pb-10">
                      <LargeButton
                        appearance="white"
                        onClick={() => {
                          action("pause")
                          if (lang === "RU") {
                            openLinkWithTg(part.url)
                          } else {
                            openLinkWithTg(part.urlEn)
                          }
                        }}
                      >
                        {lang === "RU" ? part.buttonText : part.buttonTextEn}
                      </LargeButton>
                    </div>
                  )}
                >
                  <div className="relative h-full w-full bg-background px-4 pt-6 text-white">
                    {part.image && lang === "RU" && (
                      <img
                        alt={"Фото-контент истории №" + i}
                        src={part.image}
                        className={cn(
                          "absolute inset-0 h-full w-full",
                          Telegram.WebApp.platform === "tdesktop" ||
                            Telegram.WebApp.platform === "macos" ||
                            Telegram.WebApp.platform === "web"
                            ? "object-contain"
                            : "object-cover",
                        )}
                      />
                    )}
                    {part.imageEn && lang === "EN" && (
                      <img
                        alt={"Story-content image №" + i}
                        src={part.imageEn}
                        className={cn(
                          "absolute inset-0 h-full w-full",
                          Telegram.WebApp.platform === "tdesktop" ||
                            Telegram.WebApp.platform === "macos" ||
                            Telegram.WebApp.platform === "web"
                            ? "object-contain"
                            : "object-cover",
                        )}
                      />
                    )}
                  </div>
                </WithSeeMore>
              )

            return (
              <div className="relative h-full w-full bg-background px-4 pt-6 text-white">
                {part.image && lang === "RU" && (
                  <img
                    alt={"Фото-контент истории №" + i}
                    src={part.image}
                    className={cn(
                      "absolute inset-0 h-full w-full",
                      Telegram.WebApp.platform === "tdesktop" ||
                        Telegram.WebApp.platform === "macos" ||
                        Telegram.WebApp.platform === "web"
                        ? "object-contain"
                        : "object-cover",
                    )}
                  />
                )}
                {part.imageEn && lang === "EN" && (
                  <img
                    alt={"Story-content image №" + i}
                    src={part.imageEn}
                    className={cn(
                      "absolute inset-0 h-full w-full",
                      Telegram.WebApp.platform === "tdesktop" ||
                        Telegram.WebApp.platform === "macos" ||
                        Telegram.WebApp.platform === "web"
                        ? "object-contain"
                        : "object-cover",
                    )}
                  />
                )}
              </div>
            )
          },
          seeMoreCollapsed: ({ toggleMore }) => (
            <button
              className="absolute bottom-4 z-50 h-14 rounded-xl bg-[#17202D] font-tt-hoves text-base font-semibold text-white"
              onClick={() => toggleMore(true)}
            >
              {lang === "RU" ? part.buttonText : part.buttonTextEn}
            </button>
          ),
          seeMore: ({ close }: { close: () => void }) => (
            <div
              style={{
                maxWidth: "100%",
                height: "100%",
              }}
              className="flex flex-col items-center justify-center bg-background font-nunito text-white"
            >
              <h2>Ошибочка, вы не должны этого видеть...</h2>
              <p style={{ textDecoration: "underline" }} onClick={close}>
                Вернуться назад
              </p>
            </div>
          ),
        }
      })

      return (
        <Stories
          stories={storyParts}
          loop
          width="100%"
          height="100vh"
          progressContainerStyles={{ paddingTop: 14, paddingRight: 40 }}
          onAllStoriesEnd={() => {
            dispatch(setOpenedStoryId(null))
          }}
          defaultInterval={10000}
          onStoryStart={(index: number) => {
            setStoryPartIndex(index)
          }}
        />
      )
    }
  },
)

export default StoryPartsPreview
