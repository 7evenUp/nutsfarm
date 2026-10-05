import { useNavigate } from "react-router-dom"

import Coin from "@/assets/icons/coin.svg?react"

import TaskIcon from "./TaskIcon"

import ActiveTaskButton from "./buttons/ActiveTaskButton"

import { useAppDispatch } from "@/redux/hooks"
import { setOpenedStoryId } from "@/redux/slices/story"

import { ActiveTask as ITask } from "@/types/task"
import { Lesson as LessonType } from "@/types/learn"

import { numberWithSpaces } from "@/utils/numberWithSpaces"
import { openLinkWithTelegram } from "@/utils/openLink"

const ActivePartnerTask = ({
  title,
  link,
  icon,
  task,
  lang,
  lessonsList,
}: ITask & { lessonsList: (LessonType & { isActive: boolean })[] }) => {
  const navigate = useNavigate()

  const { type, reward, nutPassXp, objectId } = task

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

  return (
    <div className="flex items-center gap-5 rounded-2xl bg-[#0F1824] pb-3 pl-3 pr-2.5 pt-3.5">
      <button className="flex items-center gap-5" onClick={handleItemClick}>
        <TaskIcon icon={icon} type={type} iconClassName="h-9 w-9 shrink-0" />

        <div className="flex flex-col items-start gap-2">
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

export default ActivePartnerTask
