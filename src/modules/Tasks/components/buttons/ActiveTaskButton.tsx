import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

import LoaderIcon from "@/assets/icons/loader.svg?react"

import { XP_PER_LEVEL } from "@/modules/NutsPassV2/constants"

import { Button } from "@/shared/ui/Button"

import { useAppDispatch } from "@/redux/hooks"
import { useStartTaskMutation } from "@/redux/api/task"
import { setOpenedStoryId } from "@/redux/slices/story"
import { useGetCurrentUserQuery } from "@/redux/api/user"

import { ActiveTask as ITask } from "@/types/task"
import { Lesson as LessonType } from "@/types/learn"

import { openLinkWithTelegram } from "@/utils/openLink"
import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

import { cn } from "@/lib/cn"

const ActiveTaskButton = ({
  link,
  task,
  lang,
  appearance,
  className,
  lessonsList,
}: Pick<ITask, "link" | "task" | "lang"> & {
  className?: string
  appearance: "yellow-linear" | "white"
  lessonsList: (LessonType & { isActive: boolean })[]
}) => {
  const { t } = useTranslation()

  const navigate = useNavigate()

  const { type, id: taskId, objectId, value } = task

  const dispatch = useAppDispatch()

  const [startStarted, setStartStarted] = useState(false)

  const { data: currentUser } = useGetCurrentUserQuery()

  const [startTask, { isLoading }] = useStartTaskMutation()

  const onStartClick = () => {
    if (isLoading || startStarted) return

    makeHapticFeedback({ impactOccured: "rigid" })

    setStartStarted(true)

    setTimeout(async () => {
      try {
        await startTask({
          taskId,
          type,
          lang,
        }).unwrap()

        if (type === "STORIES") {
          dispatch(setOpenedStoryId(objectId))
        }

        if (type === "LEARN_LESSON") {
          if (!objectId) return

          const tasklesson = lessonsList.find(
            (lesson) => lesson.id === objectId,
          )
          if (!tasklesson?.isClaimed) navigate("/earn/" + objectId)
        }

        if (type === "NOTIFICATION" || type === "ALL_FRIENDS_NOTIFICATION") {
          navigate("/friends")
        }

        if (type === "HOME_SCREEN_ICON") {
          // @ts-expect-error no-tma-provided-types
          Telegram.WebApp.addToHomeScreen()
        }

        if (type === "NUT_PASS_PURCHASE") {
          navigate("/pass?showOnboarding=true")
        }

        if (type === "RECEIVE_NFT") {
          navigate("/pass")
        }

        if (type === "NUT_PASS_REACH_LEVEL") {
          if (currentUser && value) {
            if (
              Math.floor(currentUser.nutPassXpBalance / XP_PER_LEVEL) + 1 <
              value
            )
              navigate("/pass")
          }
        }

        if (
          type === "URL" ||
          type === "TELEGRAM_CHANNEL_SUBSCRIPTION" ||
          type === "PARTNER_SUBSCRIPTION" ||
          type === "USER_ANSWER" ||
          type === "MANUAL_USER_ANSWER" ||
          type === "MANUAL_UGC" ||
          type === "SOUL_PARTNER_SUBSCRIPTION" ||
          type === "APP_CENTER_VOTE" ||
          type === "CAPS_GAME_PARTNER_COMPLETED_COLLECTION"
        ) {
          if (link) openLinkWithTelegram(link)
        }
      } catch {
        toast.error(t("Ошибка"), {
          description: t("Не удалось начать задание"),
        })
        setStartStarted(false)
      }
    }, 1000)
  }

  return (
    <Button
      className={cn("ml-auto", className)}
      appearance={appearance}
      onClick={onStartClick}
    >
      {isLoading || startStarted ? (
        <LoaderIcon className="h-4 w-4 animate-spin" />
      ) : type === "URL" ? (
        t("Перейти")
      ) : type === "TELEGRAM_CHANNEL_SUBSCRIPTION" ? (
        t("Подписаться")
      ) : type === "LEARN_LESSON" ? (
        t("Учиться")
      ) : type === "HOME_SCREEN_ICON" ? (
        t("Добавить")
      ) : (
        t("Начать")
      )}
    </Button>
  )
}

export default ActiveTaskButton
