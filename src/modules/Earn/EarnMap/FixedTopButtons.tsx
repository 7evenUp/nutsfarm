import {
  forwardRef,
  HTMLAttributes,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { createPortal } from "react-dom"
import { motion } from "framer-motion"

import GiftIcon from "@/assets/lesson-icons/gift-icon.svg?react"

// import ModuleTask from "./ModuleTask"

import ModulesListDialog from "@/modals/EarnModulesList"
import ModuleIcon from "@/modals/EarnModulesList/ModuleIcon"

import { useGetActiveModulesQuery } from "@/redux/api/learn"
import { useAppSelector } from "@/redux/hooks"
// import { useGetCurrentTasksQuery } from "@/redux/api/task"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"
import { isHexColor } from "@/utils/color"
import { hexToHsl } from "@/utils/hexToHsl"

import { cn } from "@/lib/cn"

import { initCloudStorage } from "@telegram-apps/sdk"
import { t } from "i18next"

// @ts-expect-error Not-in-telegram-environment
let cloudStorage

if (Telegram.WebApp.initData) {
  cloudStorage = initCloudStorage()
}

const FixedTopButtons = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>((_, forwardedRef) => {
  const moduleSelectButtonRef = useRef<HTMLButtonElement | null>(null)
  const portalRef = useRef<HTMLDivElement | null>(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)

  const [showOnboarding, setShowOnboarding] = useState(false)
  const [moduleListOpen, setModulesListOpen] = useState(false)

  const lang = useAppSelector((state) => state.language.value)
  const countryCode = useAppSelector((state) => state.countryCode.value)

  const { data: modules } = useGetActiveModulesQuery({
    lang,
    region: countryCode,
  })
  // const { data: currentTasks } = useGetCurrentTasksQuery()

  const selectedModuleId = useAppSelector(
    (state) => state.selectedModule.selectedModuleId,
  )

  const selectedModule = useMemo(() => {
    if (!modules) return null

    if (!selectedModuleId) return null

    return modules.find((module) => module.id === selectedModuleId)
  }, [modules, selectedModuleId])

  // const hasSelectedModuleTasks = useMemo(() => {
  //   if (!modules) return false

  //   const neededModule = modules.find(
  //     (module) => module.id === selectedModuleId,
  //   )
  //   if (!neededModule || neededModule.tasks.length === 0) return false

  //   return true
  // }, [modules, selectedModuleId])

  // const firstTask = useMemo(() => {
  //   if (!modules) return null

  //   const neededModule = modules.find(
  //     (module) => module.id === selectedModuleId,
  //   )

  //   if (!neededModule) return null
  //   if (!neededModule.tasks || neededModule.tasks.length === 0) return null

  //   return neededModule.tasks[0]
  // }, [modules, selectedModuleId])

  // const currentTask = useMemo(() => {
  //   if (!currentTasks || !firstTask) return undefined

  //   return currentTasks.find(
  //     (currentTask) => currentTask.taskId === firstTask.task.id,
  //   )
  // }, [firstTask, currentTasks])

  const hsl = useMemo(() => {
    if (!selectedModule) return { h: 227, s: 54, l: 52 }

    return isHexColor(selectedModule.color)
      ? hexToHsl(selectedModule.color, true)
      : { h: 227, s: 54, l: 52 }
  }, [selectedModule])

  // Высчитываем стили для онбординга модулей
  useEffect(() => {
    if (
      moduleSelectButtonRef.current &&
      portalRef.current &&
      tooltipRef.current
    ) {
      const { top, bottom } =
        moduleSelectButtonRef.current.getBoundingClientRect()

      const TOP_OFFSET = 4
      const BUTTON_SHADOW_SIZE = 4

      portalRef.current.style.clipPath = `polygon(
        0% 0%,
        0% 100%,
        0px 100%,
        0px ${top - TOP_OFFSET}px,
        100% ${top - TOP_OFFSET}px,
        100% ${bottom + BUTTON_SHADOW_SIZE}px,
        0px ${bottom + BUTTON_SHADOW_SIZE}px,
        0px 100%,
        100% 100%,
        100% 0%
      )`

      tooltipRef.current.style.top = bottom + "px"
    }
  }, [selectedModule, showOnboarding])

  useLayoutEffect(() => {
    const checkIfOnboardingPassed = async () => {
      let storageValue: string | null

      if (!Telegram.WebApp.initData) {
        storageValue = localStorage.getItem("module-onboarding-passed")
      } else {
        // @ts-expect-error Not-in-telegram-environment
        storageValue = await cloudStorage.get("module-onboarding-passed")
      }

      if (!storageValue) setShowOnboarding(true)
    }

    checkIfOnboardingPassed()
  }, [])

  useEffect(() => {
    const url = new URL(location.href)
    const openModulesParam = url.searchParams.get("openModules")

    if (openModulesParam && openModulesParam === "true") {
      setModulesListOpen(true)
    }
  }, [])

  if (!modules) return
  if (!selectedModule) return

  return (
    <div
      ref={forwardedRef}
      className={cn(
        "fixed z-50 flex w-full max-w-[500px] flex-col gap-3",
        Telegram.WebApp.platform === "tdesktop" ||
          Telegram.WebApp.platform === "macos"
          ? "top-16 px-3.5"
          : "top-14 px-4 phone-xsm:top-[62px] phone-sm:top-[68px]",
        selectedModule &&
          selectedModule.isPurchased !== undefined &&
          selectedModule.isPurchased !== null
          ? "bg-transparent"
          : "bg-background",
      )}
    >
      <ModulesListDialog
        open={moduleListOpen}
        setOpen={setModulesListOpen}
        modulesList={modules}
      >
        <button
          ref={moduleSelectButtonRef}
          className="group rounded-xl focus:outline-none"
          onClick={async () => {
            makeHapticFeedback({ impactOccured: "soft" })

            if (!Telegram.WebApp.initData) {
              localStorage.setItem("module-onboarding-passed", "watched")
            } else {
              // @ts-expect-error Not-in-telegram-environment
              await cloudStorage.set("module-onboarding-passed", "watched")
            }

            setShowOnboarding(false)
          }}
        >
          <div className="relative h-full w-full">
            {/* Кнопка */}
            <div
              className={cn(
                "relative z-40 flex items-center justify-between gap-2 rounded-xl p-2 pl-3.5 group-active:translate-y-1",
                // currentTask?.status !== "CLAIMED" && "justify-between",
              )}
              style={{
                background:
                  selectedModule &&
                  selectedModule.isPurchased !== undefined &&
                  selectedModule.isPurchased !== null
                    ? "linear-gradient(163deg, #DC7C00 15.32%, #FC0 84.29%, #FEF27F 116.82%)"
                    : isHexColor(selectedModule.color)
                      ? selectedModule.color
                      : "#6C6AE1",
              }}
            >
              <div className="flex flex-col gap-1.5 pt-1">
                {/* {currentTask?.status !== "CLAIMED" && ( */}
                <div className="flex">
                  <span className="text-left text-xs font-semibold uppercase text-white/75">
                    {lang === "RU"
                      ? selectedModule.description
                      : selectedModule.descriptionEn}
                  </span>
                  {selectedModule.isPurchased !== undefined &&
                    selectedModule.isPurchased !== null && (
                      <div
                        className={cn(
                          "flex h-[18px] items-center justify-center rounded-full bg-[#FBF7E4] px-1.5",
                          (selectedModule.description ||
                            selectedModule.descriptionEn) &&
                            "ml-3",
                        )}
                      >
                        <span
                          style={{
                            color:
                              selectedModule &&
                              selectedModule.isPurchased !== undefined &&
                              selectedModule.isPurchased !== null
                                ? "#7D470B"
                                : isHexColor(selectedModule.color)
                                  ? selectedModule.color
                                  : "#6C6AE1",
                          }}
                          className="text-center text-[10px]/[8px] font-bold uppercase"
                        >
                          Premium
                        </span>
                      </div>
                    )}
                </div>
                {/* )} */}
                <span
                  className={cn(
                    "text-left text-base/[22px] font-bold",
                    selectedModule &&
                      selectedModule.isPurchased !== undefined &&
                      selectedModule.isPurchased !== null
                      ? "text-[#4E2A02]"
                      : "text-white",
                  )}
                >
                  {lang === "RU"
                    ? selectedModule.title
                    : selectedModule.titleEn}
                </span>
              </div>
              {/* {currentTask?.status !== "CLAIMED" && ( */}
              <div
                className={cn(
                  "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px]",
                  selectedModule &&
                    selectedModule.isPurchased !== undefined &&
                    selectedModule.isPurchased !== null
                    ? "bg-[#7D470B]"
                    : "bg-background",
                )}
              >
                {selectedModule &&
                selectedModule.isPurchased !== undefined &&
                selectedModule.isPurchased !== null ? (
                  <GiftIcon className="h-[30px] w-auto" />
                ) : (
                  <ModuleIcon {...selectedModule} />
                )}
              </div>
              {/* )} */}
            </div>

            {/* Тень кнопки */}
            <div
              className={cn("absolute top-1 h-full w-full rounded-xl")}
              style={{
                backgroundColor:
                  selectedModule &&
                  selectedModule.isPurchased !== undefined &&
                  selectedModule.isPurchased !== null
                    ? "#A55F11"
                    : `hsl(${hsl.h} ${hsl.s}% ${hsl.l}%)`,
              }}
            />
          </div>
        </button>
      </ModulesListDialog>

      {showOnboarding &&
        createPortal(
          <div
            className="fixed inset-0 z-[49] bg-black/50 backdrop-blur-sm"
            ref={portalRef}
          >
            <motion.div
              initial={{ y: 35, x: "-50%", scaleX: 1.03, scaleY: 0.92 }}
              animate={{ y: 27, scaleX: 1, scaleY: 1 }}
              transition={{
                repeat: Infinity,
                duration: 1,
                type: "spring",
                bounce: 0.01,
                repeatType: "reverse",
              }}
              className="absolute left-1/2 z-[41] -translate-x-1/2 rounded-lg border-2 border-background bg-white px-2.5 py-1.5 font-nunito text-xs font-extrabold uppercase text-background"
              ref={tooltipRef}
            >
              <svg
                className="absolute left-1/2 top-px -translate-x-1/2 -translate-y-full fill-white"
                width={10}
                height={5}
                viewBox="0 0 30 10"
                preserveAspectRatio="none"
              >
                <polygon points="0,10 30,10 15,0"></polygon>
              </svg>
              <p>{t("Выбери курс")}</p>
            </motion.div>
          </div>,
          document.body,
        )}

      {/* {hasSelectedModuleTasks && (
        <ModuleTask firstTask={firstTask} currentTask={currentTask} />
      )} */}
    </div>
  )
})

export default FixedTopButtons
