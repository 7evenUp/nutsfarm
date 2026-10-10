import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Close, Description } from "@radix-ui/react-dialog"
import {
  BackButton,
  initBackButton,
  RemoveEventListenerFn,
} from "@/demo/telegram-sdk"

import CloseIcon from "@/assets/icons/close.svg?react"
import NutcrackerIcon from "@/assets/icons/nutcracker.svg?react"
import ForwardIcon from "@/assets/icons/forward.svg?react"
import GetgemsIcon from "@/assets/icons/getgems.svg?react"

import ClubImage from "@/assets/images/nuts-club.png"

import NutcrackersCarousel from "./NutcrackersCarousel"

import { Sheet, SheetContent, SheetTrigger } from "@/shared/ui/SideSheet"
import { LargeButton } from "@/shared/ui/LargeButton"
import { Skeleton } from "@/shared/ui/Skeleton"

import NoNutcrackersImage from "@/assets/images/no-nutcrakers.png"

import { useAppDispatch } from "@/redux/hooks"
import { setOpenedStoryId } from "@/redux/slices/story"
import { useGetNutcrackersQuery } from "@/redux/api/inventory"

import { sendMetrika } from "@/utils/sendMetrika"
import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

import { cn } from "@/lib/cn"

let backButton: BackButton

if (true) {
  try {
    const [initializedBackButton] = initBackButton()
    backButton = initializedBackButton
  } catch {
    /* empty */
  }
}

const NUTCRACKERS_STORY_ID = "1005499191131439105"

const NutcrackersDialog = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)
  const [nestedModalOpen, setNestedModalOpen] = useState(false)

  const dispatch = useAppDispatch()

  const onNutsCollectionBlockClick = () => {
    makeHapticFeedback({ impactOccured: "soft" })

    // sendMetrika("nutcrackers_collection_open")
    handleOpenNutcrackersStories()
  }

  const onLargeBtnClick = () => {
    makeHapticFeedback({ impactOccured: "soft" })

    // sendMetrika("nutcrackers_collection_open_by_btn")
    // Telegram.WebApp.openLink("https://getgems.io/nutcrackers")
    handleOpenNutcrackersStories()
  }

  const handleOpenNutcrackersStories = () => {
    // sendMetrika("nutcrackers_stories_open")
    dispatch(setOpenedStoryId(NUTCRACKERS_STORY_ID))
  }

  const {
    data: nutcrackers = [],
    isLoading,
    isError,
  } = useGetNutcrackersQuery(undefined, { skip: !open })

  useEffect(() => {
    if (!backButton) return

    let rmListener: RemoveEventListenerFn
    if (open || nestedModalOpen) {
      backButton.show()
      rmListener = backButton.on("click", () => {
        nestedModalOpen ? setNestedModalOpen(false) : setOpen(false)
      })
    } else {
      backButton.hide()
    }

    return () => {
      rmListener && rmListener()
    }
  }, [open, nestedModalOpen])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={className}
        onClick={() => {
          makeHapticFeedback({ impactOccured: "soft" })
          sendMetrika("home_nutcracker_icon")
        }}
      >
        {children}
      </SheetTrigger>
      <SheetContent
        className={cn(
          "gap-0 overflow-y-auto rounded-t-none px-0 pt-2 phone-sm:py-2",
          Telegram.WebApp.platform === "weba"
            ? "pb-8"
            : "pb-[max(var(--tg-safe-area-inset-bottom,16px),32px)]",
          Telegram.WebApp.initData ? "h-screen" : "h-[100svh]",
        )}
      >
        <Description className="sr-only">Nutcrackers modal</Description>

        {!Object.keys(Telegram.WebApp.initDataUnsafe).length ? (
          <div className="absolute right-4 ml-auto flex justify-between">
            <Close className="opacity-70 transition-opacity focus:outline-none active:opacity-100">
              <CloseIcon className="h-6 w-6" />
              <span className="sr-only">Close</span>
            </Close>
          </div>
        ) : null}

        <button
          className="max-w-[500px] px-3.5 focus:outline-none"
          onClick={handleOpenNutcrackersStories}
        >
          <div className="mb-2.5 flex w-full items-center rounded-xl bg-[#17202D] p-1.5 pr-3 phone-sm-fix:mb-2.5">
            <div className="flex h-[58px] w-[58px] items-center justify-center rounded-xl bg-[#0F1824] p-1.5">
              <img
                src={ClubImage}
                className="min-h-[46px] min-w-[46px] rounded-lg object-cover"
              />
            </div>
            <div className="ml-2 w-full phone-sm-fix:ml-3">
              <p className="py-1.5 text-left text-xs font-medium leading-[19px] phone-sm-fix:py-2.5 phone-sm-fix:text-sm">
                {t(
                  "Загляни в сторис и узнай, что такое Щелкунчики, а также как попасть в наш приватный клуб.",
                )}
              </p>
            </div>
          </div>
        </button>
        <button
          className="max-w-[500px] px-3.5 focus:outline-none"
          onClick={onNutsCollectionBlockClick}
        >
          <div className="flex w-full items-center rounded-xl bg-[#17202D] p-1.5 pr-3 phone-sm-fix:mb-2.5">
            <div className="flex h-[58px] w-[58px] items-center justify-center rounded-xl bg-[#0F1824] p-1.5">
              <div className="flex min-h-[46px] min-w-[46px] items-center justify-center">
                <NutcrackerIcon />
              </div>
            </div>
            <div className="ml-2 w-full phone-sm-fix:ml-3">
              <p className="py-1.5 text-left text-xs font-medium leading-[19px] phone-sm-fix:py-2.5 phone-sm-fix:text-sm">
                {t("Хочешь все подробности о коллекции? Жми")}{" "}
                <span className="font-medium text-[#FDF356]">
                  {t("сюда")}
                  {"! "}
                  <span className="inline-block">
                    <ForwardIcon className="inline-block h-3.5 w-3.5" />
                  </span>
                </span>
              </p>
            </div>
          </div>
        </button>

        <div className="mt-[24px] phone-sm-fix:mt-[42px] h-screen-740:mt-[72px] phone-lg:mt-[72px]">
          <p className="phone-:mb-7 mb-3 text-center font-tt-hoves-expanded text-xl font-semibold leading-[30px] phone-sm-fix:mb-4 phone-sm-fix:text-2xl h-screen-700:mb-7">
            {t("Мои NFT 'Nutcrackers'")}
          </p>

          {isLoading && (
            <div className="flex gap-4 overflow-hidden px-4">
              <div>
                <Skeleton className="h-[220px] w-[220px] rounded-[14px]" />
                <Skeleton className="mt-4 h-6 w-[90px]" />
              </div>
              <div>
                <Skeleton className="h-[220px] w-[220px] rounded-[14px]" />
                <Skeleton className="mt-4 h-6 w-[90px]" />
              </div>
              <div>
                <Skeleton className="h-[220px] w-[220px] rounded-[14px]" />
                <Skeleton className="mt-4 h-6 w-[90px]" />
              </div>
            </div>
          )}

          {isError && !isLoading && (
            <p className="mb-4 text-center text-sm text-red-400">
              {t("Произошла ошибка при загрузке")}.
            </p>
          )}

          {!isLoading && !isError && nutcrackers.length > 0 && (
            <div className="pt-1">
              <NutcrackersCarousel
                nutcrackers={nutcrackers}
                nestedModalOpen={nestedModalOpen}
                setNestedModalOpen={setNestedModalOpen}
              />
            </div>
          )}

          {!isLoading && !isError && nutcrackers.length === 0 && (
            <div className="relative flex flex-col items-center">
              <p className="mb-2 px-8 text-center font-medium text-white/50">
                {t("У тебя нет NFT 'Nutcrackers' на данный момент")}
              </p>
              <img
                src={NoNutcrackersImage}
                className="-mt-14 mb-9 max-w-[241px] phone-sm-fix:max-w-[251px]"
              />
              <div
                className={cn(
                  "fixed inset-x-0 px-4",
                  Telegram.WebApp.platform === "weba"
                    ? "bottom-3"
                    : "bottom-[max(var(--tg-safe-area-inset-bottom,12px),12px)]",
                )}
              >
                <p className="text-balance pb-8 text-center text-sm font-medium leading-[19px]">
                  {t(
                    "Хочешь стать членом уникального клуба и получать дополнительные бонусы?",
                  )}
                </p>
                <LargeButton
                  appearance="white"
                  onClick={onLargeBtnClick}
                  hasRing
                >
                  <GetgemsIcon />
                  {t("Узнать о Nutcrackers")}
                </LargeButton>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default NutcrackersDialog
