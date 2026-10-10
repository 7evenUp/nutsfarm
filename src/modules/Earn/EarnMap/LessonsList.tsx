import { Fragment, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import TonIcon from "@/assets/icons/ton.svg?react"
import Loader from "@/assets/icons/loader.svg?react"
import StarIcon from "@/assets/lesson-icons/star-icon.svg?react"

import MapItem from "./MapItem"
import MascotItem from "./MascotItem"
import BuyLessonPaymentStatus from "./BuyLessonPaymentStatus"
import PremiumModulePreviewModal from "./modals/PremiumModulePreview"

import { LargeButton } from "@/shared/ui/LargeButton"

import {
  useCommitPaymentMutation,
  useCommitTonPaymentMutation,
  useGetPaymentItemsQuery,
} from "@/redux/api/payment"
import { useAppSelector } from "@/redux/hooks"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"
import { getHours, getMinutes } from "@/utils/date"

import { Lesson, Mascot, Module } from "@/types/learn"

import { cn } from "@/lib/cn"

import { initInvoice } from "@/demo/telegram-sdk"

// @ts-expect-error Not-in-telegram-environment
let invoice

if (true) {
  try {
    invoice = initInvoice()
  } catch {
    /* empty */
  }
}

const LessonsList = ({
  modulesList,
  lessonsList,
  moduleId,
}: {
  modulesList: Module[]
  lessonsList: (Lesson & { isActive: boolean })[]
  moduleId: string
}) => {
  const { t } = useTranslation()

  const [premiumModulePreviewOpen, setPremiumModulePreviewOpen] =
    useState(false)
  const [isCommitPaymentLocked, setIsCommitPaymentLocked] = useState(false)

  const selectedModuleId = useAppSelector(
    (state) => state.selectedModule.selectedModuleId,
  )
  const [paymentStatusOpen, setPaymentStatusOpen] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<
    "cancelled" | "paid" | null
  >(null)

  const lang = useAppSelector((state) => state.language.value)

  const { data: paymentItems } = useGetPaymentItemsQuery(undefined)
  const [commitTonPayment] = useCommitTonPaymentMutation()
  const [commitPayment] = useCommitPaymentMutation({
    fixedCacheKey: "buy-lesson",
  })

  const selectedModule = useMemo(() => {
    return modulesList.find((module) => module.id === selectedModuleId)
  }, [modulesList, selectedModuleId])

  const mascotList = useMemo(() => {
    if (selectedModule)
      return [...selectedModule.mascots].sort(
        (a, b) => a.pageNumber - b.pageNumber,
      )
  }, [selectedModule])

  const lessons = useMemo(() => {
    return lessonsList.filter((item) => item.moduleId === moduleId)
  }, [lessonsList, moduleId])

  const groupedLessons:
    | {
        [key: number]: {
          lessons: (Lesson & {
            isActive: boolean
          })[]
          mascots: Mascot[]
        }
      }
    | undefined = useMemo(() => {
    if (mascotList === undefined) return

    const groupedLessons: {
      [key: number]: {
        lessons: (Lesson & {
          isActive: boolean
        })[]
        mascots: Mascot[]
      }
    } = lessons.reduce<{
      [key: number]: {
        lessons: (Lesson & {
          isActive: boolean
        })[]
        mascots: Mascot[]
      }
    }>((accumulator, currentValue) => {
      accumulator[currentValue["submoduleNumber"]] = accumulator[
        currentValue["submoduleNumber"]
      ] || { lessons: [], mascots: [] }

      accumulator[currentValue["submoduleNumber"]]["lessons"].push(currentValue)

      return accumulator
    }, {})

    mascotList.forEach((mascot) => {
      if (mascot.submoduleNumber === null) return
      groupedLessons[mascot.submoduleNumber].mascots.push(mascot)
    })

    return groupedLessons
  }, [lessons, mascotList])

  const submoduleTitles = useMemo(() => {
    const titles = new Set<string>()
    lessons.forEach((lesson) =>
      titles.add(
        lang === "RU" ? lesson.submoduleTitle : lesson.submoduleTitleEn,
      ),
    )
    return [...titles]
  }, [lessonsList, moduleId])

  // Ищем айдишник кружочка, до которого будем скролить экран
  const currentId = useMemo(() => {
    if (!lessons || lessons.length === 0) return null

    // Индекс первого непройденного урока в массиве
    const lessonIndex = lessons.findIndex((lesson) => !lesson.isClaimed)

    if (lessonIndex === 0) return lessons[0].id
    if (lessonIndex < 0) return lessons[lessons.length - 1].id

    if (
      !lessons[lessonIndex].blocks ||
      lessons[lessonIndex].blocks.length === 0
    )
      return lessons[lessonIndex - 1].id

    return lessons[lessonIndex].id
  }, [lessons])

  const moduleItem = useMemo(() => {
    if (!paymentItems) return null

    const neededItem = paymentItems.find(
      (item) => item.type === "UNLOCK_MODULE",
    )

    if (!neededItem) return null

    return neededItem
  }, [paymentItems])

  const modulePreview = useMemo(() => {
    if (!selectedModule) return null

    return lang === "RU" ? selectedModule.preview : selectedModule.previewEn
  }, [selectedModule, lang])

  const shouldShowPreview = useMemo(() => {
    if (!selectedModule) return false

    return !!(lang === "RU" ? selectedModule.preview : selectedModule.previewEn)
  }, [selectedModule, lang])

  const prePurchaseClick = () => {
    if (shouldShowPreview && modulePreview) {
      setPremiumModulePreviewOpen(true)
      return
    }

    handlePurchaseClick()
  }

  const handlePurchaseClick = async () => {
    if (isCommitPaymentLocked) return
    if (moduleItem === null) return

    makeHapticFeedback({ notificationOccured: "success" })

    setIsCommitPaymentLocked(true)

    try {
      if (Telegram.WebApp.initData) {
        const response = await commitPayment({
          id: moduleItem.id,
          lang,
          objectId: Number(moduleId),
        }).unwrap()

        // @ts-expect-error Not-in-telegram-environment
        const status = await invoice.open(response.paymentFormUrl, "url")
        setPaymentStatus(status)
      } else {
        const response = await commitTonPayment({
          id: moduleItem.id,
          lang,
          objectId: Number(moduleId),
        }).unwrap()

        window.open(response.paymentFormUrl, "_top")
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "WebAppMethodUnsupported")
          toast.error("Ошибка, openInvoice не поддерживается")
        if (err.message === "WebAppInvoiceOpened")
          toast.error("Ошибка, openInvoice с такой ссылкой уже был открыт")

        return
      }
      toast.error(t("Ошибка"), {
        description: t("Упс, что-то пошло не так"),
      })
    } finally {
      setTimeout(() => {
        setIsCommitPaymentLocked(false)
      }, 20)
    }
  }

  useEffect(() => {
    if (paymentStatus === null) return

    if (paymentStatus === "cancelled") {
      setPaymentStatus(null)
      return
    }

    if (paymentStatus === "paid") {
      setPaymentStatus(null)
      setPremiumModulePreviewOpen(false)
      setPaymentStatusOpen(true)
      return
    }
  }, [paymentStatus])

  if (!selectedModule) return
  if (groupedLessons === undefined) return

  let lessonOrder = -1
  let mascotOrder = -1

  return (
    <>
      {Object.entries(groupedLessons).map(([key, value], i) => {
        const firstPremiumLesson = value.lessons.find(
          (lesson) => lesson.isPurchased === false,
        )

        return (
          <Fragment key={i}>
            {Object.entries(groupedLessons).length > 1 && (
              <div className="flex w-screen flex-col gap-2 px-4">
                <div className="flex w-full items-center gap-3">
                  <div className="h-px w-full flex-1 bg-white/20" />
                  <p className="text-xs font-semibold uppercase text-white/75">
                    {t("Блок")} {key ?? 0}
                  </p>
                  <div className="h-px w-full flex-1 bg-white/20" />
                </div>
                <p className="text-center text-base font-bold -tracking-[0.02em]">
                  {submoduleTitles[key ? parseInt(key) - 1 : 0]}
                </p>
              </div>
            )}

            <div className="mb-10 mt-8 flex w-[249px] flex-col">
              {value.lessons.length > 0 && (
                <div className="relative">
                  <>
                    {value.mascots.length > 0 && (
                      <div className="absolute z-[1]">
                        {value.mascots.map((item, index) => {
                          if (item.submoduleNumber !== parseInt(key)) return
                          mascotOrder++

                          return (
                            <MascotItem
                              key={item.id}
                              order={mascotOrder}
                              img={item.image}
                              isFirst={index === 0}
                            />
                          )
                        })}
                      </div>
                    )}
                    {value.lessons.map((item, index) => {
                      lessonOrder++
                      return (
                        <MapItem
                          currentId={currentId}
                          key={item.id}
                          order={lessonOrder}
                          length={value.lessons.length}
                          color={selectedModule?.color ?? "#6C6AE1"}
                          lesson={{ ...item }}
                          isFirst={index === 0}
                          isLast={value.lessons.length === index + 1}
                          openPaymentStatus={() => {
                            setPaymentStatusOpen(true)
                          }}
                          isPremiumModule={
                            selectedModule.isPurchased !== undefined &&
                            selectedModule.isPurchased !== null
                          }
                          moduleId={moduleId}
                          moduleTonPrice={selectedModule.tonPrice}
                          moduleFullTonPrice={selectedModule.tonPriceFull}
                          moduleStarsPrice={selectedModule.starsPrice}
                          onModulePurchase={handlePurchaseClick}
                          shouldShowModulePreview={shouldShowPreview}
                          modulePreview={modulePreview}
                          isFirstPremiumLesson={
                            firstPremiumLesson
                              ? item.id === firstPremiumLesson.id
                              : false
                          }
                        />
                      )
                    })}
                  </>
                </div>
              )}
            </div>
            {selectedModule.isPurchased === false &&
              moduleItem &&
              moduleItem.personalDiscountStarsPrice !== null &&
              moduleItem.personalDiscountTonPrice !== null &&
              moduleItem.personalDiscountEndTime &&
              new Date(moduleItem.personalDiscountEndTime).getTime() >
                new Date().getTime() && (
                <div
                  className={cn(
                    "fixed z-50 w-full px-3",
                    Telegram.WebApp.platform === "weba"
                      ? "bottom-[90px]"
                      : "bottom-[calc(14px+60px+max(var(--tg-safe-area-inset-bottom,16px),16px))]",
                  )}
                >
                  <LargeButton
                    appearance="yellow-linear"
                    onClick={prePurchaseClick}
                  >
                    <p className="absolute -right-2 top-2 z-50 -translate-y-full rotate-2 whitespace-nowrap rounded-lg bg-cyan px-3 py-1 font-nunito text-xs font-bold tracking-wide drop-shadow-[0px_1px_1px_rgba(0,0,0,.5)]">
                      {t("Персональное предложение %")}
                    </p>
                    {isCommitPaymentLocked ? (
                      <Loader className="animate-spin" />
                    ) : (
                      <>
                        <span className="ml-2 flex items-center justify-center gap-1 rounded-[7px] bg-gradient-to-r from-[#93711A]/20 from-[42%] via-[#93711A]/10 via-[70%] to-[#93711A]/20 to-[90%] p-1 text-xs font-extrabold text-[#481F02]">
                          {getHours(
                            (new Date(
                              moduleItem.personalDiscountEndTime,
                            ).getTime() -
                              new Date().getTime()) /
                              1000,
                            false,
                            true,
                          )}
                          {t("h")}{" "}
                          {getMinutes(
                            (new Date(
                              moduleItem.personalDiscountEndTime,
                            ).getTime() -
                              new Date().getTime()) /
                              1000,
                          )}
                          {t("m")}
                        </span>
                        {t("Открыть за")}
                        <div className="flex items-center gap-1.5">
                          {Telegram.WebApp.initData ? (
                            <>
                              <StarIcon className="h-4 w-4" />
                              <span>
                                {Math.floor(
                                  moduleItem.personalDiscountStarsPrice,
                                )}
                              </span>
                              <span className="scale-[.9] line-through opacity-50">
                                {selectedModule.starsPrice}
                              </span>
                            </>
                          ) : (
                            <>
                              <TonIcon className="h-4 w-4" />
                              <span>
                                {moduleItem.personalDiscountTonPrice.toFixed(2)}
                              </span>
                              <span className="scale-[.9] line-through opacity-50">
                                {selectedModule.tonPrice &&
                                  selectedModule.tonPrice.toFixed(2)}
                              </span>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </LargeButton>
                </div>
              )}

            {modulePreview && (
              <PremiumModulePreviewModal
                open={premiumModulePreviewOpen}
                onOpenChange={setPremiumModulePreviewOpen}
                preview={modulePreview}
                selectedModule={selectedModule}
                isCommitPaymentLocked={isCommitPaymentLocked}
                onPurchaseClick={handlePurchaseClick}
              />
            )}

            <BuyLessonPaymentStatus
              open={paymentStatusOpen}
              setOpen={setPaymentStatusOpen}
            />
          </Fragment>
        )
      })}
    </>
  )
}

export default LessonsList
