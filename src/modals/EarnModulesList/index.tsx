import { Dispatch, SetStateAction, useMemo, useState } from "react"
import { Description } from "@radix-ui/react-dialog"
import { useTranslation } from "react-i18next"

import LockIcon from "@/assets/lesson-icons/lock.svg?react"
import GiftIcon from "@/assets/lesson-icons/gift-icon.svg?react"

import ModuleIcon from "./ModuleIcon"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/shared/ui/SideSheet"

import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { setSelectedModuleId } from "@/redux/slices/module"

import { Module } from "@/types/learn"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"
import { isHexColor } from "@/utils/color"
import { hexToHsl } from "@/utils/hexToHsl"

import { cn } from "@/lib/cn"
import { initCloudStorage } from "@/demo/telegram-sdk"

import ModulePreviewRU from "@/assets/images/module_premium_preview_ru.png"
import ModulePreviewEN from "@/assets/images/module_premium_preview_en.png"

// @ts-expect-error Not-in-telegram-environment
let cloudStorage

if (Telegram.WebApp.initData) {
  cloudStorage = initCloudStorage()
}

const HARDCODED_MODULE_ID = "687348"

const ModulesListDialog = ({
  children,
  modulesList,
  open,
  setOpen,
  className,
}: {
  children: React.ReactNode
  modulesList: Module[]
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  className?: string
}) => {
  const { t } = useTranslation()

  const dispatch = useAppDispatch()
  const lang = useAppSelector((state) => state.language.value)

  const [showCoursePreview, setShowCoursePreview] = useState(false)

  const handleSelectModule = async (id: string) => {
    makeHapticFeedback({ impactOccured: "soft" })

    try {
      if (!Telegram.WebApp.initData) {
        localStorage.setItem("learn_module", id)
      } else {
        // @ts-expect-error Not-in-telegram-environment
        await cloudStorage.set("learn_module", id)
      }
      dispatch(setSelectedModuleId(id))
    } catch (error) {
      console.error("Failed to save module id:", error)
    }
    setOpen(false)
  }

  const hslList = useMemo(() => {
    return modulesList.map((module) => {
      return isHexColor(module.color)
        ? hexToHsl(module.color, true)
        : { h: 227, s: 54, l: 52 }
    })
  }, [modulesList])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className={className} asChild>
        {children}
      </SheetTrigger>
      <SheetContent
        className={cn(
          "gap-0 overflow-hidden overflow-y-scroll px-0 pb-10 pt-6",
          Telegram.WebApp.initData ? "max-h-screen" : "max-h-[100svh]",
        )}
      >
        <Description className="sr-only">Modules list modal</Description>

        <SheetHeader>
          <div className="flex w-full items-center justify-center gap-2.5">
            <span className="text-xl">{t("Список курсов")}</span>
          </div>
        </SheetHeader>

        {showCoursePreview && (
          <img
            src={lang === "RU" ? ModulePreviewRU : ModulePreviewEN}
            className="fixed inset-0 z-[9999] h-screen w-screen object-cover animate-in fade-in-0 zoom-in-75 slide-in-from-bottom-24"
            onClick={() => setShowCoursePreview(false)}
          />
        )}

        <span className="mt-4 self-center px-4 text-center text-xs font-medium text-white/50">
          {t("Выбирай интересующую тебя тему и приступай к обучению!")}
        </span>
        <div className="mt-4 flex flex-col gap-3 self-center px-4">
          {/* {modulesList.find((module) => module.id === HARDCODED_MODULE_ID) && (
            <button
              className={cn(
                "group z-50 rounded-xl",
                Telegram.WebApp.platform === "tdesktop" ||
                  Telegram.WebApp.platform === "macos"
                  ? "inset-x-3.5 top-16"
                  : "inset-x-4 top-14 phone-xsm:top-[62px] phone-sm:top-[68px]",
              )}
              onClick={() => setShowCoursePreview(true)}
            >
              <div className="relative h-full w-full">
                <div className="relative z-40 flex items-center justify-between gap-2 rounded-xl bg-gradient-to-b from-[#A68514] to-[#EED052] p-2 pl-3.5 group-active:translate-y-1">
                  <div className="flex flex-col gap-1.5 pt-1">
                    <div className="flex text-xs font-semibold">
                      <span className="text-left uppercase tracking-wider text-black/75">
                        ??? ?????
                      </span>
                    </div>
                    <span className="text-left text-base/[22px] font-bold tracking-wider text-black">
                      ????? ???
                    </span>
                  </div>
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-[#050D12]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-8 w-8 text-[#FEED1F]"
                    >
                      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" x2="12.01" y1="17" y2="17" />
                    </svg>
                  </div>
                </div>
                <div className="absolute top-1 h-full w-full rounded-xl bg-[#A98916]" />
              </div>
            </button>
          )} */}

          {modulesList.map((module, index) => {
            const notClaimedLessons = module.lessons.filter(
              (lesson) =>
                lesson.blocks && lesson.blocks.length > 0 && !lesson.isClaimed,
            )

            if (module.id === HARDCODED_MODULE_ID) return null

            return (
              <button
                key={index}
                className={cn(
                  "group z-50 rounded-xl",
                  Telegram.WebApp.platform === "tdesktop" ||
                    Telegram.WebApp.platform === "macos"
                    ? "inset-x-3.5 top-16"
                    : "inset-x-4 top-14 phone-xsm:top-[62px] phone-sm:top-[68px]",
                )}
                onClick={() => handleSelectModule(module.id)}
                disabled={module.lessons.length === 0}
              >
                <div className="relative h-full w-full">
                  {/* Кнопка */}
                  <div
                    className={cn(
                      "relative z-40 flex items-center justify-between gap-2 rounded-xl p-2 pl-3.5",
                      module.lessons.length > 0
                        ? "group-active:translate-y-1"
                        : "bg-[#0F1824] text-white/50",
                    )}
                    style={{
                      background:
                        module.isPurchased !== undefined &&
                        module.isPurchased !== null
                          ? "linear-gradient(163deg, #DC7C00 15.32%, #FC0 84.29%, #FEF27F 116.82%)"
                          : module.lessons.length > 0
                            ? isHexColor(module.color)
                              ? module.color
                              : "#6C6AE1"
                            : undefined,
                    }}
                  >
                    <div className="flex flex-col gap-1.5 pt-1">
                      <div className="flex text-xs font-semibold">
                        <span className="text-left uppercase text-white/75">
                          {lang === "RU"
                            ? module.description
                            : module.descriptionEn}
                        </span>
                        {module.isPurchased !== undefined &&
                          module.isPurchased !== null && (
                            <div
                              className={cn(
                                "h-[18px] rounded-full bg-[#FBF7E4] px-1.5",
                                (module.description || module.descriptionEn) &&
                                  "ml-3",
                              )}
                            >
                              <span
                                // style={{
                                //   color: isHexColor(module.color)
                                //     ? module.color
                                //     : "#6C6AE1",
                                // }}
                                className="text-[10px]/[8px] font-bold uppercase text-[#7D470B]"
                              >
                                Premium
                              </span>
                            </div>
                          )}
                      </div>
                      <span
                        className={cn(
                          "text-left text-base/[22px] font-bold",
                          module.isPurchased !== undefined &&
                            module.isPurchased !== null
                            ? "text-[#4E2A02]"
                            : "text-white",
                        )}
                      >
                        {lang === "RU" ? module.title : module.titleEn}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px]",
                        module.isPurchased !== undefined &&
                          module.isPurchased !== null
                          ? "bg-[#7D470B]"
                          : "bg-[#050D12]",
                      )}
                    >
                      {module.isPurchased !== undefined &&
                      module.isPurchased !== null ? (
                        <GiftIcon className="h-[30px] w-auto" />
                      ) : module.lessons.length > 0 ? (
                        <ModuleIcon {...module} />
                      ) : (
                        <LockIcon className="h-8 w-8" />
                      )}
                      {notClaimedLessons.length > 0 && (
                        <div
                          className="absolute -bottom-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full"
                          style={{
                            background:
                              module.isPurchased !== undefined &&
                              module.isPurchased !== null
                                ? "#FED828"
                                : module.lessons.length > 0
                                  ? isHexColor(module.color)
                                    ? module.color
                                    : "#6C6AE1"
                                  : "#0F1824",
                          }}
                        >
                          <div
                            className={cn(
                              "h-2 w-2 rounded-full",
                              module.isPurchased !== undefined &&
                                module.isPurchased !== null
                                ? "bg-[#7D470B]"
                                : "bg-white",
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {module.lessons.length > 0 && (
                    /* Тень кнопки */
                    <div
                      className={cn("absolute top-1 h-full w-full rounded-xl")}
                      style={{
                        background:
                          module.isPurchased !== undefined &&
                          module.isPurchased !== null
                            ? "#A55F11"
                            : `hsl(${hslList[index].h} ${hslList[index].s}% ${hslList[index].l}%)`,
                      }}
                    />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default ModulesListDialog
