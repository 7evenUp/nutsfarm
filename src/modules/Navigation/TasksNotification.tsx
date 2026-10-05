import { useMemo } from "react"

import {
  useGetActiveTasksQuery,
  useGetCurrentTasksQuery,
} from "@/redux/api/task"
import { useAppSelector } from "@/redux/hooks"

const TasksNotification = () => {
  const countryCode = useAppSelector((state) => state.countryCode.value)
  const lang = useAppSelector((state) => state.language.value)

  const { data: activeTasks } = useGetActiveTasksQuery({
    lang,
    region: countryCode,
    showHomeTask:
      Telegram.WebApp.platform === "android" ||
      Telegram.WebApp.platform === "ios",
  })
  const { data: currentTasks } = useGetCurrentTasksQuery({ lang })

  const filteredActiveTasks = useMemo(() => {
    if (!activeTasks) return []
    if (!currentTasks) return []

    return activeTasks.filter(({ task }) => {
      return currentTasks.find((currentTask) => currentTask.taskId === task.id)
        ? false
        : true
    })
  }, [activeTasks, currentTasks])

  if (filteredActiveTasks.length === 0) return null

  return (
    <div className="absolute -bottom-0.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#243B54] transition-colors group-focus:bg-[#1c242f] group-active:bg-[#1c242f]">
      <div className="h-2 w-2 rounded-full bg-cyan" />
    </div>
  )
}

export default TasksNotification
