import { useEffect, useLayoutEffect, useState } from "react"
import { Description, Title } from "@radix-ui/react-dialog"

import { Sheet, SheetContent, SheetTrigger } from "@/shared/ui/SideSheet"

import { useAppSelector } from "@/redux/hooks"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

import { cn } from "@/lib/cn"
import PassSlide from "@/demo/PassSlide"

import {
  BackButton,
  initBackButton,
  RemoveEventListenerFn,
} from "@/demo/telegram-sdk"
import { initCloudStorage } from "@/demo/telegram-sdk"

let backButton: BackButton
// @ts-expect-error Not-in-telegram-environment
let cloudStorage

if (true) {
  try {
    const [initializedBackButton] = initBackButton()
    backButton = initializedBackButton
    cloudStorage = initCloudStorage()
  } catch {
    /* empty */
  }
}

const SLIDES_RU = [0, 1, 2]
const SLIDES_EN = [0, 1, 2]

const NutsPassInfo = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)

  const lang = useAppSelector((state) => state.language.value)

  const SLIDES_TO_CACHE = lang === "RU" ? SLIDES_RU : SLIDES_EN

  useLayoutEffect(() => {
    const url = new URL(location.href)
    const showOnboaringParam = url.searchParams.get("showOnboarding")

    if (showOnboaringParam && showOnboaringParam === "true") {
      setOpen(true)
    }
  }, [])

  useLayoutEffect(() => {
    const toggleNotification = async () => {
      if (true) {
        // @ts-expect-error Not-in-telegram-environment
        const storageValue: string = await cloudStorage.get(
          "pass-info-already-watched",
        )

        if (!storageValue) {
          setOpen(true)
          // @ts-expect-error Not-in-telegram-environment
          cloudStorage.set("pass-info-already-watched", "watched")
        }
      }
    }

    toggleNotification()
  }, [])

  useEffect(() => {
    if (!open) setActiveSlide(0)
  }, [open])

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
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        className={cn(
          "gap-0 overflow-y-auto bg-[#20142D] px-0",
          Telegram.WebApp.initData ? "h-screen rounded-t-none" : "h-[100svh]",
        )}
      >
        <Title className="sr-only">About Nuts Pass modal</Title>
        <Description className="sr-only">About Nuts Pass modal</Description>

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

        <PassSlide index={activeSlide} lang={lang}  />


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
              ? "Finish Nuts Pass Info"
              : "Next slide"
          }
          className="absolute inset-y-0 right-0 z-50 h-full w-1/2"
          onClick={onNextClick}
        />
      </SheetContent>
    </Sheet>
  )
}

export default NutsPassInfo
