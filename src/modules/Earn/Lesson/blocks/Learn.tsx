import { useMemo, useState, useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"

import ForwardIcon from "@/assets/icons/forward.svg?react"
import ArrowRight from "../components/ArrowRight"
import VolumeOnIcon from "@/assets/lesson-icons/volume-2.svg?react"
import VolumeOffIcon from "@/assets/lesson-icons/volume-off.svg?react"

import { useAppSelector } from "@/redux/hooks"
import { Learn as LearnType } from "@/types/learn"

import LoadingScreen from "@/modules/LoadingScreen"
import { LargeButton } from "@/shared/ui/LargeButton"
import { TimerLargeButton } from "@/shared/ui/TimerLargeButton"
import { ProgressLargeButton } from "@/shared/ui/VideoProgressButton"

import { openLinkWithTelegram } from "@/utils/openLink"
import { isHexColor } from "@/utils/color"
import { Sound } from "@/utils/Sound"
import { makeHapticFeedback } from "@/utils/makeHapticFeedback"
import { cn } from "@/lib/cn"

import { initCloudStorage } from "@/demo/telegram-sdk"

// @ts-expect-error Not-in-telegram-environment
let cloudStorage

if (Telegram.WebApp.initData) {
  cloudStorage = initCloudStorage()
}

const isVideoUrl = (url: string | null | undefined): boolean => {
  if (!url) return false
  const videoExtensions = [
    ".mp4",
    ".mov",
    ".avi",
    ".wmv",
    ".mkv",
    ".webm",
    ".flv",
    ".mpeg",
  ]
  const lowercasedUrl = url.toLowerCase()
  return videoExtensions.some((ext) => lowercasedUrl.endsWith(ext))
}

const Learn = ({
  goToNextLesson,
  goToPreviousLesson,
  image,
  imageEn,
  buttons,
  bgColor,
  sound,
  isEasyMode,
  forceTimerButton = false,
}: LearnType & {
  goToNextLesson: () => void
  goToPreviousLesson: () => void
  sound: Sound
  isEasyMode?: boolean
  forceTimerButton?: boolean
}) => {
  const { t } = useTranslation()

  const lang = useAppSelector((state) => state.language.value)
  const [isLoading, setIsLoading] = useState(true)
  const [timerKey, setTimerKey] = useState(0)

  const [isMuted, setIsMuted] = useState(true)
  const [isButtonActive, setIsButtonActive] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)
  const [hasVideoPlayedOnce, setHasVideoPlayedOnce] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null)

  const mediaUrl = useMemo(
    () => (lang === "RU" ? image : imageEn),
    [lang, image, imageEn],
  )
  const isVideo = useMemo(() => isVideoUrl(mediaUrl), [mediaUrl])
  const shouldUseProgressButton = useMemo(
    () => isVideo && !forceTimerButton && !isEasyMode,
    [isVideo, forceTimerButton, isEasyMode],
  )

  useEffect(() => {
    const fetchMuteState = async () => {
      const MUTE_STATE_KEY = "video_sound_muted"
      let storedState: string | null = null
      try {
        if (!Telegram.WebApp.initData) {
          storedState = localStorage.getItem(MUTE_STATE_KEY)
        } else {
          // @ts-expect-error Not-in-telegram-environment
          storedState = await cloudStorage.get(MUTE_STATE_KEY)
        }
      } catch (error) {
        console.error("Failed to get mute state:", error)
      }

      const newMutedState = storedState !== "false"
      setIsMuted(newMutedState)

      if (videoRef.current) {
        videoRef.current.muted = newMutedState
      }
    }

    fetchMuteState()
  }, [])

  useEffect(() => {
    setIsLoading(true)
    sound.play()
    setVideoProgress(0)
    setHasVideoPlayedOnce(false)

    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current)
    }

    // Для картинок или принудительного таймера кнопка активна сразу
    // Для видео с прогресс-кнопкой - только после первого просмотра
    setIsButtonActive(!shouldUseProgressButton)

    // начальный fallback
    // Этот таймер сбрасывается в handleTimeUpdate
    if (shouldUseProgressButton) {
      fallbackTimerRef.current = setTimeout(() => {
        setIsButtonActive(true)
        setVideoProgress(100)
        setHasVideoPlayedOnce(true)
      }, 5000)
    }

    return () => {
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current)
      }
    }
  }, [mediaUrl, sound, shouldUseProgressButton])

  const handleTimeUpdate = () => {
    if (!videoRef.current || hasVideoPlayedOnce) return
    const { currentTime, duration } = videoRef.current

    if (duration) {
      const progress = (currentTime / duration) * 100
      setVideoProgress(progress)

      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current)
      }

      // новый fallback
      if (shouldUseProgressButton && !hasVideoPlayedOnce) {
        fallbackTimerRef.current = setTimeout(() => {
          setIsButtonActive(true)
          setVideoProgress(100)
          setHasVideoPlayedOnce(true)
        }, 5000)
      }

      if (currentTime >= duration - Math.min(1, duration / 10)) {
        setVideoProgress(100)
        setIsButtonActive(true)
        setHasVideoPlayedOnce(true)

        if (fallbackTimerRef.current) {
          clearTimeout(fallbackTimerRef.current)
        }
      }
    }
  }

  const handleVideoEnd = () => {
    if (!hasVideoPlayedOnce) {
      setVideoProgress(100)
      setIsButtonActive(true)
      setHasVideoPlayedOnce(true)
    }
  }

  const handleVideoError = () => {
    console.error("Ошибка загрузки видео")
    setIsLoading(false)
    setIsButtonActive(true)
    setHasVideoPlayedOnce(true)

    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current)
    }
  }

  const handleToggleMute = async () => {
    if (videoRef.current) {
      const newMutedState = !videoRef.current.muted
      videoRef.current.muted = newMutedState
      setIsMuted(newMutedState)

      try {
        const valueToSave = newMutedState.toString()
        if (!Telegram.WebApp.initData) {
          localStorage.setItem("video_sound_muted", valueToSave)
        } else {
          // @ts-expect-error Not-in-telegram-environment
          await cloudStorage.set("video_sound_muted", valueToSave)
        }
      } catch (error) {
        console.error("Failed to save mute state:", error)
      }
    }
  }

  const onNextClick = () => {
    makeHapticFeedback({ impactOccured: "rigid" })
    goToNextLesson()
    setTimerKey((prevKey) => prevKey + 1)
  }

  const imageBackgroundColor = bgColor
    ? isHexColor(bgColor)
      ? bgColor
      : "#232323"
    : "#232323"

  const buttonsNext = buttons.filter((button) => button.type === "NEXT_BUTTON")
  const buttonsLink = buttons.filter(
    (button) => button.type === "LINK" || button.type === "REF_LINK",
  )

  const nextButtonTitle = buttonsNext.find(
    (button) => button.lang === lang,
  )?.title

  const linkButtonTitle = buttonsLink.find(
    (button) => button.lang === lang,
  )?.title
  const linkButtonHref = buttonsLink.find(
    (button) => button.lang === lang,
  )?.link

  if (!mediaUrl)
    return (
      <>
        <span className="mb-8 mt-12 flex items-center gap-2 text-center font-tt-hoves-expanded text-2xl font-semibold text-white">
          {t("У нас тут технические шоколадки")}
        </span>
        <span className="flex items-center gap-2 px-10 py-10 text-center text-white">
          {t(
            "К сожалению в уроке обнаружена ошибка, мы уже решаем этот вопрос",
          )}
        </span>
        <LargeButton
          appearance="white"
          hasRing
          className={cn(
            "absolute inset-x-3.5 w-auto",
            Telegram.WebApp.platform === "weba"
              ? "bottom-4"
              : "bottom-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
          )}
          contentClassName="gap-2.5"
          onClick={goToNextLesson}
        >
          {t("Продолжить урок")}
        </LargeButton>
      </>
    )

  const renderNextButton = () => {
    if (shouldUseProgressButton) {
      return (
        <ProgressLargeButton
          appearance="white"
          hasRing
          className="w-full"
          contentClassName="gap-2.5"
          onClick={onNextClick}
          isEnabled={isButtonActive}
          progress={hasVideoPlayedOnce ? 100 : videoProgress}
        >
          {nextButtonTitle || t("Далее")} <ArrowRight />
        </ProgressLargeButton>
      )
    }

    return (
      <TimerLargeButton
        key={timerKey}
        appearance="white"
        hasRing
        className="w-full"
        contentClassName="gap-2.5"
        onClick={onNextClick}
        isEasyMode={isEasyMode}
      >
        {nextButtonTitle || t("Далее")} <ArrowRight />
      </TimerLargeButton>
    )
  }

  const renderMedia = () => {
    if (isVideo) {
      return (
        <video
          ref={videoRef}
          key={mediaUrl}
          onLoadedData={() => setIsLoading(false)}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnd}
          onError={handleVideoError}
          src={mediaUrl}
          autoPlay
          muted={isMuted}
          loop
          playsInline
          className={cn(
            "absolute inset-0 h-screen w-screen object-contain object-top",
            isLoading && "hidden",
          )}
          style={{ backgroundColor: imageBackgroundColor }}
        />
      )
    }

    return (
      <img
        key={mediaUrl}
        onLoad={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
        src={mediaUrl}
        alt="Картинка урока"
        className={cn(
          "absolute inset-0 h-screen w-screen object-contain object-top",
          isLoading && "hidden",
        )}
        style={{ backgroundColor: imageBackgroundColor }}
      />
    )
  }

  return (
    <>
      {renderMedia()}

      <div
        className="absolute inset-0 h-screen w-1/2 bg-transparent"
        onClick={() => goToPreviousLesson()}
      />

      {isLoading && <LoadingScreen hasToHideText />}

      <div
        className={cn(
          "absolute inset-x-3.5 flex flex-col gap-2",
          Telegram.WebApp.platform === "weba"
            ? "bottom-4"
            : "bottom-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
        )}
      >
        {isVideo && (
          <button
            onClick={handleToggleMute}
            className={cn(
              "z-50 ml-auto mr-0 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/75",
            )}
            aria-label={isMuted ? "Включить звук" : "Выключить звук"}
          >
            {isMuted ? (
              <VolumeOffIcon className="h-6 w-6" />
            ) : (
              <VolumeOnIcon className="h-6 w-6" />
            )}
          </button>
        )}
        {buttonsLink.length > 0 && linkButtonTitle && linkButtonHref ? (
          <div className="flex gap-2.5">
            {/* Если нужна кнопка со ссылкой */}
            <LargeButton
              appearance="blue-radial"
              hasRing
              contentClassName="gap-2.5"
              onClick={() => {
                makeHapticFeedback({ impactOccured: "rigid" })
                openLinkWithTelegram(linkButtonHref)
              }}
            >
              {linkButtonTitle} <ForwardIcon className="h-5 w-5" />
            </LargeButton>
            {renderNextButton()}
          </div>
        ) : (
          <div className="w-full">{renderNextButton()}</div>
        )}
      </div>
    </>
  )
}

export default Learn
