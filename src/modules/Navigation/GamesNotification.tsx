import { useEffect, useLayoutEffect, useState } from "react"
import { useLocation } from "react-router-dom"

import { cn } from "@/lib/cn"

import { initCloudStorage } from "@/demo/telegram-sdk"

// @ts-expect-error Not-in-telegram-environment
let cloudStorage

if (true) {
  try {
    cloudStorage = initCloudStorage()
  } catch {
    /* empty */
  }
}

const GamesNotification = () => {
  const { pathname } = useLocation()

  const [isHidden, setIsHidden] = useState(true)

  useLayoutEffect(() => {
    const toggleNotification = async () => {
      if (import.meta.env.VITE_IS_DEV_LOCAL !== undefined) {
        setIsHidden(true)
      } else {
        // @ts-expect-error Not-in-telegram-environment
        const storageValue: string = await cloudStorage.get("games-visited")

        if (storageValue) setIsHidden(true)
        else setIsHidden(false)
      }
    }

    toggleNotification()
  }, [])

  useEffect(() => {
    if (true) {
      const hideNotification = async () => {
        // @ts-expect-error Not-in-telegram-environment
        const storageValue: string = await cloudStorage.get("games-visited")

        if (!storageValue) {
          // @ts-expect-error Not-in-telegram-environment
          await cloudStorage.set("games-visited", "visited")
          setIsHidden(true)
        }
      }

      if (pathname.includes("games")) {
        hideNotification()
      }
    }
  }, [pathname])

  if (isHidden) return null

  return (
    <div
      className={cn(
        "absolute -bottom-1 -right-1.5 flex h-3 w-3 items-center justify-center rounded-full",
        pathname === "/" ? "bg-[#17202D]" : "bg-[#0F1824]",
      )}
    >
      <div className="h-1.5 w-1.5 rounded-full bg-cyan" />
    </div>
  )
}

export default GamesNotification
