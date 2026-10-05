import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import Coin from "@/assets/icons/coin.svg?react"

import TaskIcon from "./TaskIcon"

import UserTaskButton from "./buttons/UserTaskButton"

import { useGetCurrentTasksQuery } from "@/redux/api/task"
import { useGetReferralsQuery } from "@/redux/api/user"
import { useAppSelector } from "@/redux/hooks"

import { Skeleton } from "@/shared/ui/Skeleton"

import { UserTask as IUserTask } from "@/types/task"

import { numberWithSpaces } from "@/utils/numberWithSpaces"

import { cn } from "@/lib/cn"
import { openLinkWithTelegram } from "@/utils/openLink"

const DEFAULT_PAGINATION_SIZE = 15

const PartnerUserTask = ({
  id,
  status,
  telegramChannelId,
  translationTelegramChannelId,
  referralsCountGoal,
  link,
  icon,
  title,
  description,
  reward,
  nutPassXp,
  type,
  isClaimed,
  onManualChecking,
  executionIntervalDays,
  executionIntervalHours,
  lastExecutionDate,
  lastExecutionDateTime,
  value,
}: IUserTask & { isClaimed?: boolean }) => {
  const { t } = useTranslation()

  const navigate = useNavigate()

  const page = useAppSelector((state) => state.refPageNumber.value)
  const lang = useAppSelector((state) => state.language.value)

  const [hasLinkOpened, setHasLinkOpened] = useState(false)

  const { refetch: refetchCurrentTasks } = useGetCurrentTasksQuery({ lang })
  const { data: referralInfo } = useGetReferralsQuery({
    page,
    size: DEFAULT_PAGINATION_SIZE,
  })

  useEffect(() => {
    if (status !== "VERIFYING") return

    const timeoutId = setTimeout(() => {
      refetchCurrentTasks()
    }, 5000)

    return () => clearTimeout(timeoutId)
  }, [status])

  const handleItemClick = () => {
    if (type === "CRYPTON_ONBOARDING") {
      if (hasLinkOpened) return

      if (link) {
        setHasLinkOpened(true)
        link.includes("https://t.me")
          ? Telegram.WebApp.openTelegramLink(link)
          : Telegram.WebApp.openLink(link)
      } else {
        toast.error(t("Ошибка"), {
          description: t("Не удалось открыть ссылку. Возможно её нет"),
        })
      }
    }

    if (type === "ALL_FRIENDS_NOTIFICATION" || type === "NOTIFICATION") {
      navigate("/friends")
    }

    if (type === "STORIES") {
      return
    }

    if (
      type === "URL" ||
      type === "TELEGRAM_CHANNEL_SUBSCRIPTION" ||
      type === "PARTNER_SUBSCRIPTION" ||
      type === "USER_ANSWER" ||
      type === "MANUAL_USER_ANSWER" ||
      type === "MANUAL_UGC" ||
      type === "CAPS_GAME_PARTNER_COMPLETED_COLLECTION"
    ) {
      if (link) openLinkWithTelegram(link)
    }
  }

  if (type === "RECRUIT_REFERRALS" && !referralInfo)
    return (
      <Skeleton className="h-[62px] w-full rounded-2xl phone-sm:h-[76px]" />
    )

  return (
    <div className="flex items-center gap-5 rounded-2xl bg-[#0F1824] pb-3 pl-3 pr-2.5 pt-3.5">
      <button className="flex items-center gap-5" onClick={handleItemClick}>
        <TaskIcon icon={icon} type={type} iconClassName="h-9 w-9 shrink-0" />

        <div className="flex flex-col items-start gap-2">
          <span className="text-left text-[13px]/4 font-normal text-white phone-sm:text-sm/4 phone-sm:font-semibold">
            {title}
          </span>
          <div className="flex flex-wrap gap-1">
            <div
              className={cn(
                "flex h-[22px] min-w-max items-center gap-1 rounded-full bg-[#1C2430] pl-1 pr-1.5",
                isClaimed && "opacity-50",
              )}
            >
              <Coin className="h-3 w-3 shrink-0" />
              <span className="text-left text-xs/none font-bold text-[#FEED1E]">
                {numberWithSpaces(reward)}
              </span>
            </div>
            {nutPassXp !== null && nutPassXp > 0 && (
              <div
                className={cn(
                  "flex h-[22px] min-w-max items-center justify-center gap-1 rounded-full bg-[#1C2430] px-1.5 text-xs/none font-bold text-[#F68DF1]",
                  isClaimed && "opacity-50",
                )}
              >
                {numberWithSpaces(nutPassXp)} XP
              </div>
            )}
          </div>
        </div>
      </button>

      <UserTaskButton
        appearance="yellow-linear"
        description={description}
        id={id}
        link={link}
        referralsCountGoal={referralsCountGoal}
        status={status}
        telegramChannelId={telegramChannelId}
        translationTelegramChannelId={translationTelegramChannelId}
        title={title}
        type={type}
        onManualChecking={onManualChecking}
        executionIntervalDays={executionIntervalDays}
        executionIntervalHours={executionIntervalHours}
        lastExecutionDate={lastExecutionDate}
        lastExecutionDateTime={lastExecutionDateTime}
        value={value}
      />
    </div>
  )
}

export default PartnerUserTask
