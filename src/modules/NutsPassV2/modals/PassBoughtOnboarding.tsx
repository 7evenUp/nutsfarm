import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { Description, Title } from "@radix-ui/react-dialog"

import { Sheet, SheetContent } from "@/shared/ui/SideSheet"

import { useAppSelector } from "@/redux/hooks"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

import { cn } from "@/lib/cn"

import {
  BackButton,
  initBackButton,
  RemoveEventListenerFn,
} from "@telegram-apps/sdk"

let backButton: BackButton

if (import.meta.env.VITE_IS_DEV_LOCAL === undefined) {
  try {
    const [initializedBackButton] = initBackButton()
    backButton = initializedBackButton
  } catch {
    /* empty */
  }
}

const S3Domain =
  import.meta.env.VITE_ENVIRONMENT === "PROD"
    ? "https://s3-nutsfarm.crypton.xyz"
    : "https://s3-nutsfarm-dev.crypton.xyz"

const SLIDES_RU = [
  `${S3Domain}/pass_bought_onboarding/pass_bought_01_02_ru_new.png`,
  `${S3Domain}/pass_bought_onboarding/pass_bought_02_02_ru_new.png`,
]
const SLIDES_EN = [
  `${S3Domain}/pass_bought_onboarding/pass_bought_01_02_en_new.png`,
  `${S3Domain}/pass_bought_onboarding/pass_bought_02_02_en_new.png`,
]

const PassBoughtOnboarding = ({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}) => {
  const [activeSlide, setActiveSlide] = useState(0)

  const lang = useAppSelector((state) => state.language.value)

  const SLIDES_TO_CACHE = lang === "RU" ? SLIDES_RU : SLIDES_EN

  useEffect(() => {
    if (!open) setActiveSlide(0)
  }, [open])

  // cacheImages
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

  // TMA Back Button
  useEffect(() => {
    if (!backButton) return

    let rmListener: RemoveEventListenerFn
    if (open) {
      backButton.show()
      rmListener = backButton.on("click", () => {
        setOpen(false)
      })
    } else {
      backButton.hide()
    }

    return () => {
      if (rmListener) {
        rmListener()
      }
    }
  }, [open])

  const onPrevClick = () => {
    makeHapticFeedback({ impactOccured: "soft" })

    if (activeSlide !== 0) {
      setActiveSlide((prev) => prev - 1)
    }
  }

  const onNextClick = () => {
    makeHapticFeedback({ impactOccured: "soft" })

    if (activeSlide >= SLIDES_TO_CACHE.length - 1) {
      setOpen(false)
      return
    }

    setActiveSlide((prev) => prev + 1)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        className={cn(
          "gap-0 overflow-y-auto bg-[#20142D] px-0",
          Telegram.WebApp.initData ? "h-screen rounded-t-none" : "h-[100svh]",
        )}
      >
        <Title className="sr-only">Pass successfull bought modal</Title>
        <Description className="sr-only">
          Pass successfull bought modal
        </Description>

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
          alt={`Info slide №${activeSlide + 1}`}
          src={SLIDES_TO_CACHE[activeSlide]}
          className="absolute inset-0 h-full w-full object-cover object-top"
        />

        {activeSlide > 0 && (
          <button
            aria-label="Previous slide"
            className="absolute inset-y-0 left-0 z-50 h-full w-1/2"
            onClick={onPrevClick}
          />
        )}

        <button
          aria-label={
            activeSlide >= SLIDES_TO_CACHE.length - 1
              ? "Finish Successfull Nuts Pass Bought info"
              : "Next slide"
          }
          className="absolute inset-y-0 right-0 z-50 h-full w-1/2"
          onClick={onNextClick}
        />
      </SheetContent>
    </Sheet>
  )
}

export default PassBoughtOnboarding
