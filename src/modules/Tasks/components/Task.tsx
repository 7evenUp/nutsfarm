import { useNavigate } from "react-router-dom"

import Coin from "@/assets/icons/coin.svg?react"

import TaskIcon from "./TaskIcon"
import ActiveTaskButton from "./buttons/ActiveTaskButton"

import { XP_PER_LEVEL } from "@/modules/NutsPassV2/constants"

import { useAppDispatch } from "@/redux/hooks"
import { setOpenedStoryId } from "@/redux/slices/story"
import { useGetCurrentUserQuery } from "@/redux/api/user"

import { ActiveTask as ITask } from "@/types/task"
import { Lesson as LessonType } from "@/types/learn"

import { numberWithSpaces } from "@/utils/numberWithSpaces"
import { openLinkWithTelegram } from "@/utils/openLink"


const Task = ({
  title,
  link,
  icon,
  task,
  lang,
  lessonsList,
}: ITask & { lessonsList: (LessonType & { isActive: boolean })[] }) => {
  const { type, reward, nutPassXp, objectId, value } = task

  const { data: currentUser } = useGetCurrentUserQuery()

  const navigate = useNavigate()

  const dispatch = useAppDispatch()

  const handleItemClick = () => {
    if (type === "STORIES") {
      dispatch(setOpenedStoryId(objectId))
    }

    if (type === "LEARN_LESSON") {
      navigate("/earn/" + objectId)
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

    if (type === "HOME_SCREEN_ICON") {
      // @ts-expect-error no-tma-provided-types
      Telegram.WebApp.addToHomeScreen()
    }

    if (
      type === "URL" ||
      type === "TELEGRAM_CHANNEL_SUBSCRIPTION" ||
      type === "PARTNER_SUBSCRIPTION" ||
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
              <div className="flex flex-wrap gap-1">
                <div className="flex h-[22px] min-w-max items-center gap-1 rounded-full bg-[#1C2430] pl-1 pr-1.5">
                  <Coin className="h-3 w-3 shrink-0" />
                  <span className="text-left text-xs/none font-bold text-[#FEED1E]">
                    {numberWithSpaces(reward)}
                  </span>
                </div>
                {nutPassXp !== null && nutPassXp > 0 && (
                  <div className="flex h-[22px] min-w-max items-center justify-center gap-1 rounded-full bg-[#1C2430] px-1.5 text-xs/none font-bold text-[#F68DF1]">
                    {numberWithSpaces(nutPassXp)} XP
                  </div>
                )}
              </div>
            </div>
          </button>
          <ActiveTaskButton
            appearance="yellow-linear"
            link={link}
            task={task}
            lang={lang}
            lessonsList={lessonsList}
          />
        </div>
      )

    return null
  }

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
          <div className="flex flex-wrap gap-1">
            <div className="flex h-[22px] min-w-max items-center gap-1 rounded-full bg-[#1C2430] pl-1 pr-1.5">
              <Coin className="h-3 w-3 shrink-0" />
              <span className="text-left text-xs/none font-bold text-[#FEED1E]">
                {numberWithSpaces(reward)}
              </span>
            </div>
            {nutPassXp !== null && nutPassXp > 0 && (
              <div className="flex h-[22px] min-w-max items-center justify-center gap-1 rounded-full bg-[#1C2430] px-1.5 text-xs/none font-bold text-[#F68DF1]">
                {numberWithSpaces(nutPassXp)} XP
              </div>
            )}
          </div>
        </div>
      </button>
      <ActiveTaskButton
        appearance="yellow-linear"
        link={link}
        task={task}
        lang={lang}
        lessonsList={lessonsList}
      />
    </div>
  )
}

export default Task
