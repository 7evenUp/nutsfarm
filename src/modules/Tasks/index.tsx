import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import * as Tabs from "@radix-ui/react-tabs"
import useEmblaCarousel from "embla-carousel-react"

import TasksLoadingScreen from "./TasksLoadingScreen"

import Task from "./components/Task"
import UserTask from "./components/UserTask"
import PartnerGroup from "./components/PartnerGroup"
import { CRYPTON_ICONS_MAP } from "./components/TaskIcon"
import ConnectTon from "./components/ConnectTon"

import StoriesDialog from "@/modals/Stories"

import { useAppSelector } from "@/redux/hooks"
import {
  useGetActiveTasksQuery,
  useGetCurrentTasksQuery,
} from "@/redux/api/task"
import { useGetActiveModulesQuery } from "@/redux/api/learn"
import { useGetCurrentUserQuery } from "@/redux/api/user"

import { UserTask as UserTaskType, ActiveTask, TaskType } from "@/types/task"

import { cn } from "@/lib/cn"

const isCurrentTaskInterface = (
  task: ActiveTask | UserTaskType,
): task is UserTaskType => (task as UserTaskType).type !== undefined

type GroupNames =
  | "DAILY"
  | "SOCIALS"
  | "PARTNERS"
  | "FRIENDS"
  | "LEARN"
  | "CRYPTON"
  | "UGC"
  | "PASS"
  | "GAMES"

const TASK_GROUPS: Record<GroupNames, TaskType[]> = {
  DAILY: [],
  SOCIALS: [
    "URL",
    "TELEGRAM_CHANNEL_SUBSCRIPTION",
    "STORIES",
    "USER_ANSWER",
    "MANUAL_USER_ANSWER",
    "CRYPTON_ONBOARDING",
    "HOME_SCREEN_ICON",
    "NUT_PASS_PURCHASE",
    "APP_CENTER_VOTE",
    "TG_ADS_TASK_DAILY",
  ],
  LEARN: ["LEARN_LESSON"],
  PASS: ["NUT_PASS_REACH_LEVEL", "RECEIVE_NFT"],
  GAMES: [
    "CRYPTLE_USE_HINT",
    "CRYPTLE_WIN_IN_N_STEPS",
    "SPIN_WHEEL_WIN_JACKPOT",
    "SPIN_WHEEL_WIN_NFT",
  ],
  CRYPTON: [],
  UGC: ["MANUAL_UGC"],
  PARTNERS: ["PARTNER_SUBSCRIPTION"],
  FRIENDS: ["RECRUIT_REFERRALS", "ALL_FRIENDS_NOTIFICATION", "NOTIFICATION"],
}

const DEFAULT_GROUP_ORDER: GroupNames[] = [
  "DAILY",
  "LEARN",
  "SOCIALS",
  "PASS",
  "GAMES",
  "CRYPTON",
  "FRIENDS",
  "UGC",
  "PARTNERS",
]

const groupTasksByType = (
  tasks: (ActiveTask | UserTaskType)[],
): Map<GroupNames, (ActiveTask | UserTaskType)[]> => {
  const grouped = new Map<GroupNames, (ActiveTask | UserTaskType)[]>()

  grouped
    .set("DAILY", [])
    .set("SOCIALS", [])
    .set("LEARN", [])
    .set("PASS", [])
    .set("GAMES", [])
    .set("CRYPTON", [])
    .set("UGC", [])
    .set("PARTNERS", [])
    .set("FRIENDS", [])

  tasks.forEach((task) => {
    if (isCurrentTaskInterface(task)) {
      if (
        task.executionIntervalDays !== null ||
        (task.executionIntervalHours !== undefined &&
          task.executionIntervalHours !== null)
      ) {
        grouped.get("DAILY")?.push(task)
        return
      }
    } else {
      if (
        task.task.executionIntervalDays !== null ||
        (task.task.executionIntervalHours !== undefined &&
          task.task.executionIntervalHours !== null)
      ) {
        grouped.get("DAILY")?.push(task)
        return
      }
    }

    // Если задание с криптоновской иконкой, то помещаем задание в группу Crypton
    if (CRYPTON_ICONS_MAP.includes(task.icon)) {
      grouped.get("CRYPTON")?.push(task)
      return
    }

    // Learn Icon
    if (task.icon === "10") {
      grouped.get("LEARN")?.push(task)
      return
    }

    const group = Object.keys(TASK_GROUPS).find((key) => {
      return isCurrentTaskInterface(task)
        ? TASK_GROUPS[key as GroupNames].includes(task.type)
        : TASK_GROUPS[key as GroupNames].includes(task.task.type)
    })

    if (group !== undefined) grouped.get(group as GroupNames)?.push(task)
  })

  return grouped
}

const Tasks = () => {
  const { t } = useTranslation()

  const [emblaRef] = useEmblaCarousel({
    dragFree: true,
    loop: false,
    startIndex: 0,
  })

  const countryCode = useAppSelector((state) => state.countryCode.value)
  const lang = useAppSelector((state) => state.language.value)

  const { data: currentUser } = useGetCurrentUserQuery()

  const { data: activeTasks, isLoading: isActiveTasksLoading } =
    useGetActiveTasksQuery({
      lang,
      region: countryCode,
      showHomeTask:
        Telegram.WebApp.platform === "android" ||
        Telegram.WebApp.platform === "ios",
    })

  const { data: currentTasks, isLoading: isCurrentTasksLoading } =
    useGetCurrentTasksQuery({ lang })

  const { data: modules, isLoading: isModulesLoading } =
    useGetActiveModulesQuery({ lang, region: countryCode })

  const lessonsList = useMemo(() => {
    if (modules) {
      const result =
        modules.flatMap((module) => {
          const lessonsWithActiveStatus = module.lessons.map((lesson) => ({
            ...lesson,
            moduleId: module.id,
            isActive: false,
          }))

          for (const lesson of lessonsWithActiveStatus) {
            if (!lesson.isClaimed) {
              lesson.isActive = true
              break
            }
          }
          return lessonsWithActiveStatus
        }) ?? []

      return result
    }
    return []
  }, [modules])

  const filteredActiveTasks = useMemo(() => {
    if (!activeTasks || !currentTasks) return null

    return activeTasks.filter(({ task }) => {
      if (task.partnerName) return false
      return currentTasks.find((currentTask) => currentTask.taskId === task.id)
        ? false
        : true
    })
  }, [activeTasks, currentTasks])
  const filteredCurrentTasks = useMemo(() => {
    if (!currentTasks) return null
    return currentTasks.filter((task) => {
      if (!task.isActive) return false
      if (task.partnerName) return false
      return true
    })
  }, [currentTasks])

  // Группируем "активные" задачи (ActiveTask) и "текущие" (UserTask)
  const groupedActiveTasks = useMemo(() => {
    if (!filteredActiveTasks) return null

    return groupTasksByType(filteredActiveTasks)
  }, [filteredActiveTasks])
  const groupedCurrentTasks = useMemo(() => {
    if (!filteredCurrentTasks) return null

    return groupTasksByType(filteredCurrentTasks)
  }, [filteredCurrentTasks])

  const orderedTaskGroups = useMemo(() => {
    if (!groupedActiveTasks || !groupedCurrentTasks) return []

    // Фильтрануть активные блоки (исключая DAILY)
    const activeGroupKeys = DEFAULT_GROUP_ORDER.filter((groupKey) => {
      if (groupKey === "DAILY") return false // DAILY будет всегда первым

      const notStarted = (groupedActiveTasks.get(groupKey) || []).filter(
        (aTask) =>
          !((groupedCurrentTasks.get(groupKey) || []) as UserTaskType[]).some(
            (cTask) => cTask.taskId === aTask.id,
          ),
      )
      const inProgress = (
        (groupedCurrentTasks.get(groupKey) || []) as UserTaskType[]
      ).filter((cTask) => cTask.status !== "CLAIMED")
      return notStarted.length > 0 || inProgress.length > 0
    })

    // Фильтрануть неактивные блоки (исключая DAILY)
    const completedGroupKeys = DEFAULT_GROUP_ORDER.filter(
      (groupKey) => groupKey !== "DAILY" && !activeGroupKeys.includes(groupKey),
    )

    // DAILY всегда первый, затем активные, затем завершенные
    return ["DAILY", ...activeGroupKeys, ...completedGroupKeys]
  }, [groupedActiveTasks, groupedCurrentTasks])

  if (isActiveTasksLoading || isCurrentTasksLoading || isModulesLoading)
    return <TasksLoadingScreen />

  if (
    !activeTasks ||
    !filteredActiveTasks ||
    !filteredCurrentTasks ||
    !groupedActiveTasks ||
    !groupedCurrentTasks
  )
    return null

  return (
    <main
      className={cn(
        "flex flex-1 flex-col items-center px-4 pt-20 phone-sm:pt-24",
        Telegram.WebApp.platform === "weba"
          ? "pb-[108px]"
          : "pb-[calc(max(var(--tg-safe-area-inset-bottom,16px),16px)+92px)]",
      )}
    >
      <>
        {currentUser && !currentUser.tonWallet && <ConnectTon />}

        {/* Отрисовка "партнёрских" групп */}
        {[...new Set(activeTasks.map((task) => task.task.partnerName))].map(
          (partner) =>
            partner && (
              <PartnerGroup
                partnerName={partner}
                key={partner}
                lessonsList={lessonsList}
              />
            ),
        )}

        <Tabs.Root defaultValue="DAILY" className="mt-4 w-full">
          <div
            className="horizontal-mask -ml-4 mb-1 w-screen cursor-grab overflow-hidden px-4 active:cursor-grabbing"
            ref={emblaRef}
          >
            <Tabs.List className="flex items-center gap-5">
              {orderedTaskGroups.map((groupKey) => {
                const hasUnclaimedTasks =
                  (groupedActiveTasks.get(groupKey as GroupNames) || [])
                    .length > 0

                const hasTasks =
                  hasUnclaimedTasks ||
                  (groupedCurrentTasks.get(groupKey as GroupNames) || [])
                    .length > 0

                if (!hasTasks) return null

                return (
                  <Tabs.Trigger
                    key={groupKey}
                    value={groupKey}
                    className="relative whitespace-nowrap py-2 text-base font-semibold text-white/50 focus:outline-none data-[state=active]:text-white"
                  >
                    <GroupKeyTitle groupName={groupKey as GroupNames} />
                    {groupKey === "DAILY" ? (
                      <span className="absolute -right-1.5 top-2.5 h-1.5 w-1.5 rounded-full bg-cyan" />
                    ) : (
                      hasUnclaimedTasks && (
                        <span className="absolute -right-1.5 top-2.5 h-1.5 w-1.5 rounded-full bg-cyan" />
                      )
                    )}
                  </Tabs.Trigger>
                )
              })}
            </Tabs.List>
          </div>

          {orderedTaskGroups.map((groupKey) => {
            // Активные задачи (ActiveTask) этой группы
            const groupActive = (groupedActiveTasks.get(
              groupKey as GroupNames,
            ) || []) as ActiveTask[]
            // Текущие задачи (UserTask) этой группы
            const groupCurrent = (groupedCurrentTasks.get(
              groupKey as GroupNames,
            ) || []) as UserTaskType[]

            // --- ЛОГИКА РАЗДЕЛЕНИЯ НА ПОД-СЕКЦИИ ---
            // 1) "Не начатые" — ActiveTask, которых нет среди UserTask (user не взял задачу)
            const notStartedTasks = groupActive.filter((aTask) => {
              // Проверяем, есть ли эта активная задача среди текущих user-задач
              return !groupCurrent.some(
                (cTask) => cTask.taskId === aTask.task.id,
              )
            })

            // 2) "В процессе" — UserTask, у которых status !== "CLAIMED"
            const inProgressTasks = groupCurrent.filter(
              (cTask) => cTask.status !== "CLAIMED",
            )

            // 3) "Завершённые" — UserTask, у которых status === "CLAIMED"
            const completedTasks = groupCurrent.filter(
              (cTask) => cTask.status === "CLAIMED",
            )

            // Проверяем, есть ли в группе хоть какие-то задачи вообще
            const hasAnyTasks =
              notStartedTasks.length > 0 ||
              inProgressTasks.length > 0 ||
              completedTasks.length > 0

            return (
              <Tabs.Content
                key={groupKey}
                value={groupKey}
                className="flex flex-col"
              >
                {/* Если задач нет, показываем сообщение */}
                {!hasAnyTasks && (
                  <span className="h-32 text-sm text-white/50">
                    {t("Вы выполнили все задания в данном разделе")}
                  </span>
                )}

                {/* --- В ПРОЦЕССЕ --- */}
                {inProgressTasks.length > 0 && (
                  <div className="mb-2 flex w-full flex-col gap-2">
                    {inProgressTasks.map((task) => (
                      <UserTask key={task.id} {...task} />
                    ))}
                  </div>
                )}

                {/* --- НЕ НАЧАТЫЕ --- */}
                {notStartedTasks.length > 0 && (
                  <div className="mb-2 flex w-full flex-col gap-2">
                    {notStartedTasks.map((task) => (
                      <Task key={task.id} lessonsList={lessonsList} {...task} />
                    ))}
                  </div>
                )}
                {completedTasks.length > 0 && (
                  <div className="mb-2 flex w-full flex-col gap-2">
                    {completedTasks.map((task) => (
                      <UserTask key={task.id} {...task} />
                    ))}
                  </div>
                )}
              </Tabs.Content>
            )
          })}
        </Tabs.Root>
        <StoriesDialog />
      </>
    </main>
  )
}

export default Tasks

const GroupKeyTitle = ({ groupName }: { groupName: GroupNames }) => {
  const { t } = useTranslation()

  if (groupName === "DAILY") return t("Повторяемые")
  if (groupName === "SOCIALS") return t("Социальные")
  if (groupName === "PARTNERS") return t("Партнёры")
  if (groupName === "FRIENDS") return t("Друзья")
  if (groupName === "LEARN") return t("Обучение")
  if (groupName === "CRYPTON") return "Crypton"
  if (groupName === "UGC") return "Creackers"
  if (groupName === "PASS") return "Nuts Pass"
  if (groupName === "GAMES") return t("Игры")

  return null
}
