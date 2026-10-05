import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import Coin from "@/assets/icons/coin.svg?react"

import TaskIcon from "./TaskIcon"
import UserTaskButton from "./buttons/UserTaskButton"
import { TgAdsTask } from "./TgAdsTask"

import { XP_PER_LEVEL } from "@/modules/NutsPassV2/constants"

import { useGetCurrentTasksQuery } from "@/redux/api/task"
import { useGetCurrentUserQuery, useGetReferralsQuery } from "@/redux/api/user"
import { useAppSelector } from "@/redux/hooks"

import { Skeleton } from "@/shared/ui/Skeleton"

import { UserTask as IUserTask } from "@/types/task"

import { numberWithSpaces } from "@/utils/numberWithSpaces"
import { openLinkWithTelegram } from "@/utils/openLink"

import { cn } from "@/lib/cn"

const DEFAULT_PAGINATION_SIZE = 15

const UserTask = ({
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
  const { data: currentUser } = useGetCurrentUserQuery()

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
        openLinkWithTelegram(link)
        setHasLinkOpened(true)
      } else {
        toast.error(t("Ошибка"), {
          description: t("Не удалось открыть ссылку. Возможно её нет"),
        })
      }
    }

    if (type === "ALL_FRIENDS_NOTIFICATION" || type === "NOTIFICATION") {
      navigate("/friends")
    }

    if (type === "NUT_PASS_PURCHASE") {
      navigate("/pass?showOnboarding=true")
    }

    if (type === "RECEIVE_NFT") {
      navigate("/pass")
    }

    if (
      type === "CRYPTLE_WIN_IN_N_STEPS" ||
      type === "CRYPTLE_USE_HINT" ||
      type === "SPIN_WHEEL_WIN_NFT" ||
      type === "SPIN_WHEEL_WIN_JACKPOT" ||
      type === "COMPLETE_GAME_LEVELS" ||
      type === "COMPLETE_HARD_GAME_LEVELS" ||
      type === "SPIN_WHEEL"
    ) {
      navigate("/games")
    }

    if (type === "NUT_PASS_REACH_LEVEL") {
      if (currentUser && value) {
        if (Math.floor(currentUser.nutPassXpBalance / XP_PER_LEVEL) + 1 < value)
          navigate("/pass")
      }
    }

    if (type === "LEARN_LESSON") {
      return
    }

    if (type === "STORIES") {
      return
    }

    if (type === "URL") {
      if (link) openLinkWithTelegram(link)
      else {
        toast.error(t("Ошибка"), {
          description: t("Не удалось открыть ссылку. Возможно её нет"),
        })
      }
    }

    if (type === "TELEGRAM_CHANNEL_SUBSCRIPTION") {
      if (link) openLinkWithTelegram(link)
      else {
        toast.error(t("Ошибка"), {
          description: t("Не удалось открыть ссылку. Возможно её нет"),
        })
      }
    }

    if (type === "PARTNER_SUBSCRIPTION") {
      if (link) openLinkWithTelegram(link)
    }

    if (
      type === "USER_ANSWER" ||
      type === "MANUAL_USER_ANSWER" ||
      type === "MANUAL_UGC" ||
      type === "APP_CENTER_VOTE"
    ) {
      if (link) openLinkWithTelegram(link)
    }
  }

  if (type === "TG_ADS_TASK_DAILY") {
    if (currentUser)
      return (
        <div className="relative flex-1">
          <span className="absolute left-1.5 top-1.5 rounded-full border border-[#FEEE1F]/70 bg-[#feef1f20] px-1.5 py-0.5 text-xs text-[#FEEE1F]/80">
            Telegram Ads
          </span>
          <TgAdsTask
            blockId="task-13456"
            debug={false}
            reward={reward}
            nutPassXp={nutPassXp}
            type={type}
            id={id}
            lang={lang}
            executionIntervalHours={executionIntervalHours}
            lastExecutionDateTime={lastExecutionDateTime}
          />
        </div>
      )

    return null
  }

  if (type === "RECRUIT_REFERRALS" && !referralInfo)
    return (
      <Skeleton className="h-[62px] w-full rounded-2xl phone-sm:h-[76px]" />
    )

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#0F1824] p-1.5 pr-2.5">
      <button className="flex items-center gap-3" onClick={handleItemClick}>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1C2430] phone-sm:h-16 phone-sm:w-16">
          <TaskIcon
            icon={icon}
            type={type}
            iconClassName="h-7 w-7 phone-sm:h-9 phone-sm:w-9"
          />
        </div>
        <div className="flex flex-col items-start gap-1.5 phone-sm:pt-2">
          <span className="text-left text-[13px]/4 font-normal text-white phone-sm:text-sm/4 phone-sm:font-semibold">
            {title}
          </span>
          <div className="flex gap-1">
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

export default UserTask
