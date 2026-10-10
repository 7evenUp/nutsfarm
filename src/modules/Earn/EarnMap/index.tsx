import { useEffect, useLayoutEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"

import SupportUsIcon from "@/assets/lesson-icons/support-us.svg?react"
// import MoneyBagIcon from "@/assets/friends/icons/money-bag.svg?react"

import LessonsList from "./LessonsList"
import FixedTopButtons from "./FixedTopButtons"
// import PremiumLinks from "./PremiumLinks"

import Lesson from "../Lesson"

import DonateDialog from "@/modals/Donate"
import SuccessfullDonate from "@/modals/Donate/SuccessfullDonate"

import LoadingScreen from "@/modules/LoadingScreen"

import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import {
  useGetActiveModulesQuery,
  useGetHealthPointsQuery,
} from "@/redux/api/learn"
import { setSelectedModuleId } from "@/redux/slices/module"
import { setHealthPoints } from "@/redux/slices/health"
import { useGetCurrentTasksQuery } from "@/redux/api/task"
import { useGetCurrentUserQuery } from "@/redux/api/user"

import { sendMetrika } from "@/utils/sendMetrika"
import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

import { cn } from "@/lib/cn"
import { initCloudStorage } from "@/demo/telegram-sdk"

// @ts-expect-error Not-in-telegram-environment
let cloudStorage

if (Telegram.WebApp.initData) {
  cloudStorage = initCloudStorage()
}

const EarnMap = () => {
  const { lessonId: lessonIdRouterParam } = useParams()

  const [donateOpen, setDonateOpen] = useState(false)
  const [successfullDonateOpen, setSuccessfullDonateOpen] = useState(false)

  const dispatch = useAppDispatch()
  const selectedModuleId = useAppSelector(
    (state) => state.selectedModule.selectedModuleId,
  )
  const lang = useAppSelector((state) => state.language.value)
  const countryCode = useAppSelector((state) => state.countryCode.value)

  const { data: currentUser } = useGetCurrentUserQuery()
  const {
    data: modules,
    isLoading,
    isError,
  } = useGetActiveModulesQuery({ lang, region: countryCode })
  const { data: hearts } = useGetHealthPointsQuery()
  const { isLoading: isCurrentTasksLoading } = useGetCurrentTasksQuery({ lang })

  useLayoutEffect(() => {
    const getModuleId = async () => {
      if (!modules) return

      let moduleId: string | null = null
      let tgModuleWasWatched: string | null = null
      const hardcodedTgModuleId = "32"

      if (!Telegram.WebApp.initData) {
        moduleId = localStorage.getItem("learn_module")
        tgModuleWasWatched = localStorage.getItem("tgModuleWasWatched")
      } else {
        // @ts-expect-error Not-in-telegram-environment
        moduleId = (await cloudStorage.get("learn_module")) as string | null
        // @ts-expect-error Not-in-telegram-environment
        tgModuleWasWatched = (await cloudStorage.get("tgModuleWasWatched")) as
          | string
          | null
      }

      if (!tgModuleWasWatched) {
        if (!Telegram.WebApp.initData) {
          localStorage.setItem("learn_module", hardcodedTgModuleId)
          localStorage.setItem("tgModuleWasWatched", "true")
        } else {
          // @ts-expect-error Not-in-telegram-environment
          await cloudStorage.set("learn_module", hardcodedTgModuleId)
          // @ts-expect-error Not-in-telegram-environment
          await cloudStorage.set("tgModuleWasWatched", "true")
        }
        dispatch(setSelectedModuleId(hardcodedTgModuleId))

        return
      }

      if (lessonIdRouterParam) {
        const module = modules.find((module) =>
          module.lessons.some((lesson) => lesson.id === lessonIdRouterParam),
        )

        if (!module) return dispatch(setSelectedModuleId(modules[0].id))
        dispatch(setSelectedModuleId(module.id))
        return
      }

      const { start_param } = Telegram.WebApp.initDataUnsafe

      if (start_param) {
        const moduleIdParam = start_param
          .split("-")
          .find((param) => param.startsWith("moduleid_"))

        if (moduleIdParam) {
          const moduleIdValue = moduleIdParam.split("_")[1]
          const module = modules.find((module) => module.id === moduleIdValue)

          if (!module) return dispatch(setSelectedModuleId(modules[0].id))
          dispatch(setSelectedModuleId(moduleIdValue))

          return
        }
      }

      if (!moduleId) {
        try {
          if (!Telegram.WebApp.initData) {
            localStorage.setItem("learn_module", modules[0].id)
          } else {
            // @ts-expect-error Not-in-telegram-environment
            await cloudStorage.set("learn_module", modules[0].id)
          }
          dispatch(setSelectedModuleId(modules[0].id))
        } catch (error) {
          console.error("Failed to save module id:", error)
        }
        return
      }

      //detection of inccorect module id in store
      const module = modules.find((module) => module.id === moduleId)

      if (!module) return dispatch(setSelectedModuleId(modules[0].id))
      dispatch(setSelectedModuleId(moduleId))
    }

    getModuleId()
  }, [modules])

  useEffect(() => {
    if (hearts) dispatch(setHealthPoints(hearts.remainingLives))
  }, [hearts])

  const lessonsList = useMemo(() => {
    if (!modules) return []

    const result =
      modules?.flatMap((module) => {
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
  }, [modules])

  const selectedModule = useMemo(() => {
    if (!modules) return null

    if (!selectedModuleId) return null

    return modules.find((module) => module.id === selectedModuleId)
  }, [modules, selectedModuleId])

  if (isLoading || isCurrentTasksLoading) return <LoadingScreen />
  if (isError) return <ErrorScreen />
  if (!modules || modules.length === 0) return <EmptyScreen />

  return (
    <>
      {selectedModule &&
        selectedModule.isPurchased !== undefined &&
        selectedModule.isPurchased !== null && (
          <div className="fixed top-0 h-screen w-screen bg-premium-module bg-cover bg-no-repeat" />
        )}

      {/* Градиент сверху */}
      <div className="fixed left-0 top-0 z-40 h-[120px] w-full bg-gradient-to-b from-[#292A49] to-[#151A47]/0 opacity-75" />
      <div
        className={cn(
          "align-center relative mb-4 flex flex-1 flex-col items-center px-4 pb-24",
          selectedModule &&
            selectedModule.isPurchased !== undefined &&
            selectedModule.isPurchased !== null
            ? "pt-36"
            : "pt-48",
        )}
      >
        <FixedTopButtons />

        {modules.map((module) => {
          if (selectedModuleId !== module.id) return

          return (
            <LessonsList
              key={module.id}
              lessonsList={lessonsList}
              moduleId={module.id}
              modulesList={modules}
            />
          )
        })}
      </div>

      {/* Градиент под навигацией */}
      <div className="fixed bottom-0 left-0 z-40 h-[120px] w-full bg-gradient-to-b from-[#0D112E]/0 to-[#1A1B2E]" />

      {/* {selectedModule &&
        selectedModule.isPurchased !== undefined &&
        selectedModule.isPurchased !== null && (
          <PremiumLinks>
            <button
              onClick={() => {
                makeHapticFeedback({ notificationOccured: "success" })
              }}
              className={cn(
                "fixed left-4 z-[41] flex h-[44px] w-[44px] items-center justify-center rounded-[10px] border border-[#A3FF47] bg-[#283649] shadow-[0_2px_12px_0_#A3FF4780] transition-all active:bg-[#1c242f] active:shadow-none",
                Telegram.WebApp.platform === "weba"
                  ? "bottom-[90px]"
                  : "bottom-[calc(14px+60px+max(var(--tg-safe-area-inset-bottom,16px),16px))]",
              )}
            >
              <MoneyBagIcon className="h-auto w-7" />
            </button>
          </PremiumLinks>
        )} */}

      <button
        className={cn(
          "fixed right-4 z-[41] flex h-[44px] w-[44px] items-center justify-center rounded-[10px] border border-[#FEEE1F] bg-[#283649] shadow-[0_2px_12px_0_#FEEE1F80] transition-all active:bg-[#1c242f] active:shadow-none",
          Telegram.WebApp.platform === "weba"
            ? "bottom-[90px]"
            : "bottom-[calc(14px+60px+max(var(--tg-safe-area-inset-bottom,16px),16px))]",
        )}
        onClick={() => {
          makeHapticFeedback({ notificationOccured: "success" })
          sendMetrika("learn_click_donate_icon", {
            userBalance: currentUser?.balance,
          })
          setDonateOpen(true)
        }}
        aria-label="open donate modal"
      >
        <SupportUsIcon className="h-auto w-7" />
      </button>

      <Lesson lessonsList={lessonsList ?? []} />

      <DonateDialog
        open={donateOpen}
        setOpen={setDonateOpen}
        openSuccessfullPayment={() => {
          setDonateOpen(false)
          setSuccessfullDonateOpen(true)
        }}
        isDonateLeaderboardHidden={true}
      />
      <SuccessfullDonate
        open={successfullDonateOpen}
        setOpen={setSuccessfullDonateOpen}
      />
    </>
  )
}

export default EarnMap

const ErrorScreen = () => {
  const { t } = useTranslation()

  return (
    <div className="flex h-screen w-screen items-center justify-center px-4 text-center text-white">
      <p>
        {t("Не удалось загрузить уроки")}
        <br />
        {t("Пожалуйста, перезагрузите приложение")}
      </p>
    </div>
  )
}

const EmptyScreen = () => {
  const { t } = useTranslation()

  return (
    <div className="flex h-screen w-screen items-center justify-center text-white">
      {t("Раздел для обучения ещё пуст")}
    </div>
  )
}
