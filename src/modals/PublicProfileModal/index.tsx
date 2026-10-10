import { useEffect, useState } from "react"
import { Description, Close } from "@radix-ui/react-dialog"

import CloseIcon from "@/assets/icons/close.svg?react"

import ReviewBlock from "./components/Review"
import StreakBlock from "./components/StreakBlock"
import SkeletonLayout from "./components/Skeleton"
import UserProfile from "./components/UserProfile"
import LearnProgress from "./components/LearnProgress"
import AchievementsList from "./components/Achivements"
import NutcrackersNftCarousel from "./components/NFTCarousel"

import { Sheet, SheetContent } from "@/shared/ui/SideSheet"

import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { setOpenedProfileId } from "@/redux/slices/public-profile"
import { useGetPublicProfileQuery } from "@/redux/api/profile"

import { sendMetrika } from "@/utils/sendMetrika"

import { cn } from "@/lib/cn"

import {
  BackButton,
  initBackButton,
  RemoveEventListenerFn,
} from "@/demo/telegram-sdk"
let backButton: BackButton

if (true) {
  try {
    const [initializedBackButton] = initBackButton()
    backButton = initializedBackButton
  } catch {
    /* empty */
  }
}

const PublicProfileModal = () => {
  const dispatch = useAppDispatch()

  const { openedProfileId } = useAppSelector((state) => state.publicProfile)

  const [open, setOpen] = useState<boolean>(false)

  const { data, isFetching } = useGetPublicProfileQuery(
    { id: openedProfileId! },
    { skip: !openedProfileId || !open },
  )

  useEffect(() => {
    if (!openedProfileId) {
      setOpen(false)
      return
    }

    setOpen(true)
  }, [openedProfileId])

  // Кнопка назад
  useEffect(() => {
    if (!backButton) return

    let rmListener: RemoveEventListenerFn
    if (open) {
      backButton.show()
      rmListener = backButton.on("click", () => {
        setOpen(false)
        dispatch(setOpenedProfileId(null))
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

  // Метрика при открытии модалки
  useEffect(() => {
    if (open) {
      sendMetrika("public_profile")
    }
  }, [open])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        className={cn(
          "gap-0 overflow-hidden overflow-y-scroll px-0 pb-[max(var(--tg-safe-area-inset-bottom,35px),35px)] pt-6",
          Telegram.WebApp.initData ? "max-h-screen" : "max-h-[100svh]",
        )}
      >
        <Description className="sr-only">Public profile modal</Description>

        <div className="absolute right-3">
          <Close
            onClick={() => dispatch(setOpenedProfileId(null))}
            className="opacity-70 transition-opacity focus:outline-none active:opacity-100"
          >
            <CloseIcon className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </Close>
        </div>

        {isFetching || !data ? (
          <SkeletonLayout />
        ) : (
          <>
            <UserProfile
              avatar={data.avatar}
              name={`${data.firstname}`}
              joinDate={data.createdAt}
            />
            {/* streaks block */}
            <StreakBlock
              currentStreak={data.currentStreak}
              bestStreak={data.maxStreak}
            />

            {/* Nutcrackers/ NFT */}
            <NutcrackersNftCarousel nutcrackers={data.nutcrackers} />

            {/* Learn Progress component*/}
            <LearnProgress {...data} />

            {/* Overview component*/}
            <ReviewBlock {...data} />

            {/* Achivements list component*/}
            <AchievementsList achievements={data.achievements} />
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default PublicProfileModal
