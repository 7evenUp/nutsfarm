import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Description } from "@radix-ui/react-dialog"

import Settings from "./components/Settings"
import Inventory from "./components/Inventory"
import Achievements from "./components/Achievements"
import TransactionsHistory from "./components/TransactionsHistory"

import UserAvatar from "@/components/UserAvatar"
import UserNickname from "@/components/UserNickname"

import { Sheet, SheetContent, SheetHeader } from "@/shared/ui/SideSheet"

import { useHideInventoryNotificationMutation } from "@/redux/api/inventory"
import { useGetCurrentUserQuery } from "@/redux/api/user"
import { useAppDispatch } from "@/redux/hooks"
import { setOpenedProfileId } from "@/redux/slices/public-profile"

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

const Root = ({
  open,
  setOpen,
  close,
  openChangeAvatar,
}: {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  close: () => void
  openChangeAvatar: () => void
}) => {
  const { t } = useTranslation()

  const contentRef = useRef<HTMLDivElement>(null)
  const [hasScrolledHalfway, setHasScrolledHalfway] = useState(false)

  const { data: currentUser, isLoading: isCurrentUserLoading } =
    useGetCurrentUserQuery()
  const [hideNotification] = useHideInventoryNotificationMutation()

  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!open) return

    const timeout = setTimeout(() => {
      const element = contentRef.current
      if (!element) {
        return
      }

      const handleScroll = () => {
        if (hasScrolledHalfway) return

        const { scrollTop, scrollHeight, clientHeight } = element
        const scrollPercentage =
          (scrollTop / (scrollHeight - clientHeight)) * 100

        if (scrollPercentage >= 50) {
          setHasScrolledHalfway(true)
          sendMetrika("profile_scroll_down")
        }
      }

      handleScroll()

      element.addEventListener("scroll", handleScroll)
      return () => {
        element.removeEventListener("scroll", handleScroll)
      }
    }, 100)

    return () => clearTimeout(timeout)
  }, [open, hasScrolledHalfway])

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
      setHasScrolledHalfway(false)
    }

    return () => {
      if (rmListener) {
        rmListener()
      }
    }
  }, [open])

  useEffect(() => {
    if (!currentUser || !open) return

    if (currentUser.isInventoryNotificationReceived === false) {
      hideNotification()
    }
  }, [currentUser, open])

  if (isCurrentUserLoading) return

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        ref={contentRef}
        className={cn(
          "gap-0 overflow-hidden overflow-y-scroll px-0",
          Telegram.WebApp.initData
            ? "max-h-screen rounded-t-none"
            : "max-h-[100svh]",
        )}
      >
        <Description className="sr-only">
          Demo profile, settings, achievements and inventory
        </Description>
        <SheetHeader className="mt-2 min-h-0"> </SheetHeader>
        <div className="flex flex-col gap-2">
          <div className="mb-6 flex items-center justify-between gap-4 px-4">
            <UserAvatar
              className="h-[72px] w-[72px]"
              onClick={() => {
                if (currentUser) {
                  dispatch(setOpenedProfileId(currentUser.id))
                }
              }}
            />
            <div className="flex flex-1 flex-col gap-1.5">
              <UserNickname className="text-sm" />
              <div className="flex gap-1.5">
                <button
                  className="flex h-9 w-fit items-center justify-center gap-2 rounded-lg bg-[#17202D] p-2.5 font-tt-hoves-expanded text-xs font-medium transition-colors active:bg-[#202936]"
                  onClick={() => {
                    close()
                    openChangeAvatar()
                  }}
                >
                  {t("Сменить аватар")}
                </button>
              </div>
            </div>
          </div>

          <Settings />

          <Achievements />

          <Inventory />

          <TransactionsHistory />
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default Root
