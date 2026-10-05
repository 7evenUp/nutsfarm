import { useEffect, useState } from "react"

import { useAppSelector } from "@/redux/hooks"
import { useFinishOnboardingMutation } from "@/redux/api/user"

import { sendMetrika } from "@/utils/sendMetrika"
import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

import { cn } from "@/lib/cn"

const S3Domain =
  import.meta.env.VITE_ENVIRONMENT === "PROD"
    ? "https://s3-nutsfarm.crypton.xyz"
    : "https://s3-nutsfarm-dev.crypton.xyz"

const SLIDES_RU = [
  `${S3Domain}/onboarding/onboarding_new_01_04_ru.png`,
  `${S3Domain}/onboarding/onboarding_new_02_04_ru.png`,
  `${S3Domain}/onboarding/onboarding_new_03_04_ru.png`,
  `${S3Domain}/onboarding/onboarding_new_04_04_ru.png`,
]
const SLIDES_EN = [
  `${S3Domain}/onboarding/onboarding_new_01_04_en.png`,
  `${S3Domain}/onboarding/onboarding_new_02_04_en.png`,
  `${S3Domain}/onboarding/onboarding_new_03_04_en.png`,
  `${S3Domain}/onboarding/onboarding_new_04_04_en.png`,
]

const AppOnboarding = ({
  finishOnboarding,
}: {
  finishOnboarding: VoidFunction
}) => {
  const [activeSlide, setActiveSlide] = useState(0)
  const [metrikaWasSent, setMetrikaWasSent] = useState<number[]>([])

  const lang = useAppSelector((state) => state.language.value)

  const [mutate] = useFinishOnboardingMutation()

  const SLIDES_TO_CACHE = lang === "RU" ? SLIDES_RU : SLIDES_EN

  useEffect(() => {
    if (metrikaWasSent.includes(activeSlide)) return

    if (activeSlide === 0) sendMetrika("new_onboarding_1")
    if (activeSlide === 1) sendMetrika("new_onboarding_2")
    if (activeSlide === 2) sendMetrika("new_onboarding_3")
    if (activeSlide === 3) sendMetrika("new_onboarding_4")

    setMetrikaWasSent((prev) => [...prev, activeSlide])
  }, [activeSlide])

  useEffect(() => {
    const cacheContent = async () => {
      const promises = SLIDES_TO_CACHE.map((src) => {
        return new Promise((resolve, reject) => {
          if (!src) return

          const img = new Image()
          img.src = src
          img.onload = resolve
          img.onerror = reject
        })
      })

      await Promise.all(promises)
    }

    cacheContent()
  }, [])

  const onPrevClick = () => {
    makeHapticFeedback({ impactOccured: "soft" })


    if (activeSlide !== 0) {
      setActiveSlide((prev) => prev - 1)
    }
  }

  const onNextClick = () => {
    makeHapticFeedback({ impactOccured: "soft" })

    if (activeSlide >= SLIDES_TO_CACHE.length - 1) {
      setTimeout(() => {
        mutate()
      }, 500)
      finishOnboarding()
      return
    }

    setActiveSlide((prev) => prev + 1)
  }

  return (
    <div
      className={cn(
        "flex h-screen flex-col px-4",
        Telegram.WebApp.platform === "weba"
          ? "pb-4"
          : "pb-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
      )}
    >
      <div className="absolute left-1/2 top-4 z-50 flex w-full -translate-x-1/2 items-center gap-1 px-4">
        {SLIDES_TO_CACHE.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full",
              activeSlide >= i ? "bg-white" : "bg-[#333848]",
            )}
          />
        ))}
      </div>

      <img
        alt={`Onboarding slide №${activeSlide + 1}`}
        src={SLIDES_TO_CACHE[activeSlide]}
        className="absolute inset-0 h-full w-full object-cover object-top"
      />

      {activeSlide > 0 && (
        <button
          aria-label="Previous onboarding slide"
          className="absolute inset-y-0 left-0 z-50 h-full w-1/2"
          onClick={onPrevClick}
        />
      )}

      <button
        aria-label={
          activeSlide >= SLIDES_TO_CACHE.length - 1
            ? "Complete onboarding"
            : "Next onboarding slide"
        }
        className="absolute inset-y-0 right-0 z-50 h-full w-1/2"
        onClick={onNextClick}
      />
    </div>
  )
}

export default AppOnboarding
