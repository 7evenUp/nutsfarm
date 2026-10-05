import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"

import BitgetIcon from "@/assets/lesson-icons/bitget-icon.svg?react"

import BitgetModal from "./modals/BitgetModal"
import USDTIcon from "./icons/USDTIcon"

import { useGetActiveModulesQuery } from "@/redux/api/learn"
import { useAppSelector } from "@/redux/hooks"
import { useGetCurrentTasksQuery, useStartTaskMutation } from "@/redux/api/task"
import { useGetCurrentUserQuery } from "@/redux/api/user"

import { ActiveTask, UserTask } from "@/types/task"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

const ModuleTask = ({
  firstTask,
  currentTask,
}: {
  firstTask: ActiveTask | null
  currentTask: UserTask | undefined
}) => {
  const { t } = useTranslation()

  const lang = useAppSelector((state) => state.language.value)
  const countryCode = useAppSelector((state) => state.countryCode.value)
  const selectedModuleId = useAppSelector(
    (state) => state.selectedModule.selectedModuleId,
  )

  const { data: currentUser } = useGetCurrentUserQuery()
  const { data: modules } = useGetActiveModulesQuery({
    lang,
    region: countryCode,
  })
  const { data: currentTasks } = useGetCurrentTasksQuery({ lang })
  const [startTask, { isLoading }] = useStartTaskMutation()

  const lessonsList = useMemo(() => {
    if (modules) {
      const result =
        modules.flatMap((module) => {
          const lessonsWithActiveStatus = module.lessons.map((lesson) => ({
            ...lesson,
            moduleId: module.id,
            isActive: false, // Изначально устанавливаем isActive в false
          }))

          for (const lesson of lessonsWithActiveStatus) {
            if (!lesson.isClaimed) {
              lesson.isActive = true // Устанавливаем isActive в true для первого не заявленного урока
              break // Выходим из цикла после первого найденного урока
            }
          }
          return lessonsWithActiveStatus
        }) ?? []

      return result
    }
  }, [modules])

  const moduleClaimedLessons = useMemo(() => {
    if (!lessonsList) return undefined
    if (lessonsList.length === 0) return undefined

    return lessonsList.filter((lesson) => lesson.isClaimed)
  }, [modules, selectedModuleId])

  useEffect(() => {
    if (!firstTask) return
    if (!currentTasks) return

    const currentTask = currentTasks.find(
      (currentTask) => currentTask.taskId === firstTask.task.id,
    )

    if (currentTask) return

    const startActiveTask = async () => {
      if (isLoading) return

      try {
        await startTask({
          taskId: firstTask.task.id,
          type: firstTask.task.type,
          lang,
        }).unwrap()
      } catch {
        /* empty */
      }
    }

    startActiveTask()
  }, [firstTask, currentTasks])

  if (!modules) return null
  if (!currentTasks) return null
  if (!currentUser) return null

  if (
    lessonsList &&
    lessonsList.length > 8 &&
    moduleClaimedLessons &&
    firstTask &&
    firstTask.task.partnerName === "bitget"
  )
    return (
      <BitgetModal
        currentUserTgId={currentUser.telegramId}
        claimedLessons={moduleClaimedLessons}
        currentTask={currentTask}
        lessons={lessonsList ?? []}
      >
        <button
          className="group rounded-xl focus:outline-none"
          onClick={() => {
            makeHapticFeedback({ impactOccured: "soft" })
          }}
        >
          <div className="relative h-full w-full">
            {/* Кнопка */}
            <div className="relative z-40 flex flex-col gap-2 rounded-xl bg-gradient-to-b from-[#00E0FF] to-[#6DEDFF] p-2 group-active:translate-y-1">
              <div className="flex items-center gap-2">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-background phone-sm-fix:h-16 phone-sm-fix:w-16">
                  <BitgetIcon className="h-8 w-8 phone-sm-fix:h-10 phone-sm-fix:w-10" />
                </div>
                <span className="text-left text-xs/[18px] font-extrabold uppercase text-background phone-sm-fix:text-sm phone-sm-fix:font-bold">
                  {t("Пройди 8 уроков и участвуй в розыгрыше")}{" "}
                  <span className="rounded-md bg-[#17202D] px-1.5 py-0.5 font-extrabold text-[#49E9FF]">
                    $20,000
                  </span>{" "}
                  {t("от биржи BitGet")}
                </span>
              </div>

              <div className="flex flex-wrap gap-x-2 gap-y-1">
                <p className="flex h-[25px] items-center rounded-md bg-[#17202D] p-1.5 text-xs/[14px] font-medium text-white">
                  <span>{t("1000 наград по")}</span>
                  <USDTIcon className="ml-1 mr-0.5" />
                  <span className="translate-y-px font-bold">20</span>
                </p>
                <p className="h-[25px] rounded-md bg-[#17202D] p-1.5 text-xs/[14px] font-bold text-[#A3FF47]">
                  {t("Узнать итоги")}
                </p>
                {/* {currentTask && currentTask.status === "CLAIMED" ? (
                    <p className="h-[25px] rounded-md bg-[#17202D] p-1.5 text-xs/[14px] font-bold text-[#A3FF47]">
                      {t("Вы участвуете")}
                    </p>
                  ) : (
                    <p className="h-[25px] rounded-md bg-[#17202D] p-1.5 text-xs/[14px] font-bold text-[#05E0FF]">
                      {t("Принять участие")}
                    </p>
                  )} */}
              </div>
            </div>

            {/* Тень кнопки */}
            <div className="absolute top-1 h-full w-full rounded-xl bg-[#08ACC3]" />
          </div>
        </button>
      </BitgetModal>
    )
}

export default ModuleTask
