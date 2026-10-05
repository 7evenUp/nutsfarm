import { Description, Close } from "@radix-ui/react-dialog"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import CloseIcon from "@/assets/icons/close.svg?react"
import CoinIcon from "@/assets/icons/coin.svg?react"
import PassIcon from "@/assets/icons/ticket.svg?react"
import Loader from "@/assets/icons/loader.svg?react"

import HiddenAchievementPNG from "@/assets/images/hidden-achievement.png"
import CoinPng from "@/assets/images/coin.png"

import { Sheet, SheetContent, SheetTrigger } from "@/shared/ui/SideSheet"
import { LargeButton } from "@/shared/ui/LargeButton"

import {
  useClaimAchievementMutation,
  useGetAchievementsQuery,
  useHideAchievementNotificationMutation,
} from "@/redux/api/achievement"
import { useGetCurrentUserQuery } from "@/redux/api/user"

import { numberWithSpaces } from "@/utils/numberWithSpaces"
import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

import { cn } from "@/lib/cn"

const isDesktop =
  Telegram.WebApp.platform === "tdesktop" ||
  Telegram.WebApp.platform === "macos" ||
  Telegram.WebApp.platform === "web" ||
  Telegram.WebApp.platform === "weba"

const AchievementPreviewDialog = ({
  achievementId,
  src,
  title,
  description,
  reward,
  nutPassXp,
  isClaimed,
  status,
  children,
}: {
  achievementId: number
  src: string | null
  title: string
  description: string
  reward: number
  nutPassXp: number
  isClaimed: boolean
  status: string | null
  children: React.ReactNode
}) => {
  const { t } = useTranslation()

  const { data: currentUser } = useGetCurrentUserQuery()
  const { isFetching } = useGetAchievementsQuery()

  const [claim, { isLoading }] = useClaimAchievementMutation()
  const [hideAchievementNotification] = useHideAchievementNotificationMutation()

  const onClaimClick = async () => {
    if (isLoading) return
    if (isFetching) return
    if (status === null || status === "CLAIMED") return
    if (!currentUser) return

    makeHapticFeedback({ impactOccured: "rigid" })

    try {
      await claim({ achievementId }).unwrap()

      if (currentUser.isNewAchievementReceived === true) {
        hideAchievementNotification()
      }

      toast(
        <div className="flex flex-wrap items-center font-bold">
          <img
            src={CoinPng}
            alt="Nuts coin icon"
            className="mr-2.5 h-10 w-10"
          />
          <span className="text-[#FED900]">
            +{numberWithSpaces(reward)} NUTS
          </span>
        </div>,
        {
          className: "justify-center",
        },
      )
    } catch {
      toast.error(t("Ошибка"), {
        description: t("Упс, что-то пошло не так"),
      })
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="max-h-screen gap-0 overflow-hidden overflow-y-scroll px-0 pb-[max(var(--tg-safe-area-inset-bottom,16px),16px)] pt-6">
        <Description className="sr-only">Achievement preview modal</Description>

        <div
          className={cn(
            "flex justify-end px-4",
            isDesktop ? "mb-4" : "mb-4 phone-xsm:mb-8",
          )}
        >
          <Close className="opacity-70 transition-opacity focus:outline-none active:opacity-100">
            <CloseIcon className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </Close>
        </div>

        <div className="flex flex-col items-center px-4">
          <img
            src={src ?? HiddenAchievementPNG}
            className={cn(
              isDesktop
                ? "mb-5 h-[150px] w-[150px]"
                : "mt-b h-[150px] w-[150px] phone-xsm:mb-7 phone-xsm:h-[200px] phone-xsm:w-[200px] phone-sm-fix:h-[250px] phone-sm-fix:w-[250px] phone-lg:h-[300px] phone-lg:w-[300px]",
            )}
          />

          <span className="mb-3.5 text-center font-tt-hoves-expanded text-2xl font-semibold tracking-[-0.02em]">
            {title}
          </span>

          <span className="text-balance text-center text-sm font-medium text-white/75">
            {description}
          </span>

          <div
            className={cn(
              "flex flex-col items-center gap-3",
              isDesktop ? "mt-10" : "mt-10 phone-xsm:mt-16",
              status === null && "opacity-50",
            )}
          >
            <p className="text-sm font-semibold">{t("Награда")}</p>
            <div className="flex items-center gap-2">
              <div className="flex h-10 items-center gap-1.5 rounded-[10px] bg-[#17202D] px-3">
                <CoinIcon className="h-5 w-5 shrink-0" />
                <span className="text-sm font-bold">
                  {numberWithSpaces(reward)}
                </span>
              </div>
              {nutPassXp > 0 && (
                <div className="flex h-10 items-center gap-1.5 rounded-[10px] bg-[#17202D] px-3">
                  <PassIcon className="h-5 w-5 shrink-0" />
                  <span className="text-sm font-bold">
                    {numberWithSpaces(nutPassXp)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <LargeButton
            className={cn(isDesktop ? "mt-14" : "mt-14 phone-xsm:mt-20")}
            appearance="yellow-linear"
            disabled={isLoading || isFetching || isClaimed || status === null}
            onClick={onClaimClick}
          >
            {isLoading || isFetching ? (
              <Loader className="animate-spin" />
            ) : isClaimed ? (
              t("Получено")
            ) : status === null ? (
              t("Недоступно")
            ) : (
              t("Получить награду")
            )}
          </LargeButton>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default AchievementPreviewDialog
