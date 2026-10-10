import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import * as Popover from "@radix-ui/react-popover"
import { useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { initInvoice } from "@/demo/telegram-sdk"
import { toast } from "sonner"

import Loader from "@/assets/icons/loader.svg?react"
import CheckSuccess from "@/assets/images/check-success.png"
import Coin from "@/assets/lesson-icons/nutscoin.svg?react"
import Ticket from "@/assets/icons/ticket.svg?react"

import TonIcon from "@/assets/icons/ton.svg?react"
import LockIcon from "@/assets/lesson-icons/lock.svg?react"
import StarIcon from "@/assets/passV2/icons/star.svg?react"
import BlackStarIcon from "@/assets/icons/black-star-fill.svg?react"

import PremiumCircle from "@/assets/lesson-icons/premium_lesson_circle.svg?react"
import PremiumCircleShadow from "@/assets/lesson-icons/premium_lesson_circle_shadow.svg?react"
import PremiumCircleActive from "@/assets/lesson-icons/premium_lesson_circle_active.svg?react"
import PremiumCircleShadowActive from "@/assets/lesson-icons/premium_lesson_circle_active_shadow.svg?react"
import PremiumCircleFull from "@/assets/lesson-icons/premium_lesson_full.svg?react"
import PremiumCircleFullShadow from "@/assets/lesson-icons/premium_lesson_full_shadow.svg?react"

import LessonIcon from "./LessonIcon"
import PremiumModulePreviewModal from "./modals/PremiumModulePreview"

import {
  useCommitPaymentMutation,
  useCommitTonPaymentMutation,
  useGetPaymentItemsQuery,
} from "@/redux/api/payment"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { setOpenedLessonId } from "@/redux/slices/lesson"
import {
  useGetActiveModulesQuery,
  useGetHealthPointsQuery,
  useLazyGetPremiumChatLinkQuery,
} from "@/redux/api/learn"
import { useGetCurrentStreakQuery } from "@/redux/api/streak"
import { useGetCurrentUserQuery } from "@/redux/api/user"

import { Button } from "@/shared/ui/Button"

import { Lesson as LessonType, Module } from "@/types/learn"

import { isHexColor } from "@/utils/color"
import { hexToHsl } from "@/utils/hexToHsl"
import { sendMetrika } from "@/utils/sendMetrika"
import { makeHapticFeedback } from "@/utils/makeHapticFeedback"
import { openLinkWithTelegram } from "@/utils/openLink"

import { cn } from "@/lib/cn"

import "./MapItem.styles.css"

const HARDCODED_LESSON_ID = "260000"

// @ts-expect-error Not-in-telegram-environment
let invoice

if (true) {
  try {
    invoice = initInvoice()
  } catch {
    /* empty */
  }
}

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

const MapItem = ({
  order,
  length,
  isFirst,
  isLast,
  lesson,
  color,
  currentId,
  isPremiumModule,
  moduleId,
  moduleTonPrice,
  moduleFullTonPrice,
  moduleStarsPrice,
  openPaymentStatus,
  onModulePurchase,
  shouldShowModulePreview,
  modulePreview,
  isFirstPremiumLesson,
}: {
  order: number
  length: number
  isFirst: boolean
  isLast: boolean
  color: string
  lesson: LessonType & { isActive: boolean }
  currentId: string | null
  isPremiumModule: boolean | null
  moduleId: string | null
  moduleTonPrice: number | null
  moduleFullTonPrice: number | null
  moduleStarsPrice: number | null
  openPaymentStatus: () => void
  onModulePurchase?: () => void
  shouldShowModulePreview?: boolean
  modulePreview?: string[] | null
  isFirstPremiumLesson: boolean
}) => {
  const {
    reward,
    nutPassXp,
    title,
    titleEn,
    description,
    descriptionEn,
    starsPrice,
    tonPrice,
    tonPriceFull,
    id,
    isClaimed,
    isActive,
    image,
    blocks,
    isPurchased,
  } = lesson
  const { t } = useTranslation()

  const { lessonId: lessonIdRouterParam } = useParams()

  const [isCommitPaymentLocked, setIsCommitPaymentLocked] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<
    "cancelled" | "paid" | null
  >(null)
  const [popoverOpened, setPopoverOpened] = useState(false)
  const [lessonPreviewOpen, setLessonPreviewOpen] = useState(false)

  const lessonRef = useRef<HTMLDivElement | null>(null)

  const dispatch = useAppDispatch()

  const selectedModuleId = useAppSelector(
    (state) => state.selectedModule.selectedModuleId,
  )
  const lang = useAppSelector((state) => state.language.value)
  const countryCode = useAppSelector((state) => state.countryCode.value)
  const healthPoints = useAppSelector((state) => state.health.healthPoints)

  const [fetchLink, { isFetching: isPremiumLinkLoading }] =
    useLazyGetPremiumChatLinkQuery()
  const { data: modules } = useGetActiveModulesQuery({
    lang,
    region: countryCode,
  })
  const { data: currentUser } = useGetCurrentUserQuery()
  const { data: streak } = useGetCurrentStreakQuery({
    timezone,
  })
  const { data: paymentItems } = useGetPaymentItemsQuery(undefined)
  const [commitTonPayment] = useCommitTonPaymentMutation()
  const [commitPayment] = useCommitPaymentMutation({
    fixedCacheKey: "buy-lesson",
  })

  const selectedModule = useMemo(() => {
    if (!modules) return null

    if (!selectedModuleId) return null

    return modules.find((module) => module.id === selectedModuleId)
  }, [modules, selectedModuleId])

  const { data } = useGetHealthPointsQuery()

  const onStartClick = async () => {
    if (lesson.id === HARDCODED_LESSON_ID) {
      try {
        const link = await fetchLink(undefined, true).unwrap()
        openLinkWithTelegram(link)
      } catch (error) {
        // @ts-expect-error No RTKQ error types
        if (error.status === 409) {
          toast.error(t("Не удалось получить доступ"), {
            description: t("Свяжитесь с поддержкой"),
          })
        } else {
          toast.error(t("Ошибка"), {
            description: t("Упс, что-то пошло не так"),
          })
        }
        console.log(error)
      }
      setPopoverOpened(false)

      return
    }

    if (isClaimed) {
      sendMetrika("lesson_start_again", { userBalance: currentUser?.balance })
    } else {
      sendMetrika("lesson_start", { userBalance: currentUser?.balance })
    }

    setPopoverOpened(false)
    dispatch(setOpenedLessonId(id))
  }

  const handleLessonPurchaseClick = () => {
    if (
      isPremiumModule &&
      shouldShowModulePreview &&
      modulePreview &&
      onModulePurchase
    ) {
      setLessonPreviewOpen(true)
      return
    }

    onPurchaseClick()
  }

  const onPurchaseClick = async () => {
    if (isCommitPaymentLocked) return
    if (lessonItem === null) return

    makeHapticFeedback({ notificationOccured: "success" })

    setIsCommitPaymentLocked(true)

    try {
      if (Telegram.WebApp.initData) {
        const response = await commitPayment({
          id: lessonItem.id,
          lang,
          objectId: isPremiumModule ? Number(moduleId) : Number(id),
        }).unwrap()

        // @ts-expect-error Not-in-telegram-environment
        const status = await invoice.open(response.paymentFormUrl, "url")
        setPaymentStatus(status)
      } else {
        const response = await commitTonPayment({
          id: lessonItem.id,
          lang,
          objectId: isPremiumModule ? Number(moduleId) : Number(id),
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

  const hsl = useMemo(() => {
    if (!isHexColor(color)) return { h: 227, s: 54, l: 52 }

    return hexToHsl(color, true)
  }, [color])

  const lessonItem = useMemo(() => {
    if (!paymentItems) return null

    const neededItem = paymentItems.find((item) =>
      isPremiumModule
        ? item.type === "UNLOCK_MODULE"
        : item.type === "UNLOCK_LESSON",
    )

    if (!neededItem) return null

    return neededItem
  }, [paymentItems])

  useLayoutEffect(() => {
    if (!currentId) return
    if (!lessonRef.current) return

    if (lesson.id === currentId) {
      lessonRef.current.scrollIntoView({ block: "center" })
    }
  }, [currentId])

  useEffect(() => {
    if (paymentStatus === null) return

    if (paymentStatus === "cancelled") {
      setPaymentStatus(null)
      return
    }

    if (paymentStatus === "paid") {
      setPaymentStatus(null)
      setLessonPreviewOpen(false) // new
      openPaymentStatus()
      return
    }
  }, [paymentStatus])

  useEffect(() => {
    if (!lessonRef.current) return

    if (streak && !streak.streakRewardReceivedToday) return

    if (lessonIdRouterParam) {
      if (id === lessonIdRouterParam) {
        setPopoverOpened(true)
        lessonRef.current.scrollIntoView({ block: "center" })
      }
      return
    }

    const { start_param } = Telegram.WebApp.initDataUnsafe

    if (!start_param) return

    const lessonIdParam = start_param
      .split("-")
      .find((param) => param.startsWith("lessonid_"))

    if (!lessonIdParam) return

    const lessonIdValue = lessonIdParam.split("_")[1]

    if (id === lessonIdValue) {
      setPopoverOpened(true)
      lessonRef.current.scrollIntoView({ block: "center" })
    }
  }, [streak])

  return (
    <>
      {isFirst && (
        <>
          <div
            className={cn(
              "absolute inset-0",
              selectedModule &&
                selectedModule.isPurchased !== undefined &&
                selectedModule.isPurchased !== null
                ? "bg-roadmap-pattern-premium mix-blend-multiply"
                : "bg-roadmap-pattern",
            )}
            style={{
              backgroundPosition:
                order % 7 === 0
                  ? "center 0px"
                  : order % 7 === 1
                    ? "center 564px"
                    : order % 7 === 2
                      ? "center 465px"
                      : order % 7 === 3
                        ? "center 386px"
                        : order % 7 === 4
                          ? "center 290px"
                          : order % 7 === 5
                            ? "center 187px"
                            : order % 7 === 6
                              ? "center 100px"
                              : "center 0px",
            }}
          />
        </>
      )}
      <div
        ref={lessonRef}
        className={cn(
          "relative flex h-[70px] w-[70px] items-center justify-center rounded-full text-white first:-translate-y-1 first:translate-x-1",
          isActive ? "z-[3]" : "z-[2]",
          order % 7 === 0 && "ml-[17px] mt-[18px]",
          order % 7 === 1 && "ml-0 mt-9",
          order % 7 === 2 && "ml-[51px] mt-7",
          order % 7 === 3 && "ml-[129px] mt-[9px]",
          order % 7 === 4 && "ml-auto mt-[25px]",
          order % 7 === 5 && "ml-[158px] mt-9",
          order % 7 === 6 && "ml-[87px] mt-[15px]",
          order === 0 && "mt-0",
          isFirst && "mt-0",
          isLast &&
            length % 7 === 1 &&
            "last:-translate-x-1 last:translate-y-1",
          isLast && length % 7 === 2 && "last:translate-x-1 last:translate-y-1",
          isLast &&
            length % 7 === 3 &&
            "last:translate-x-3.5 last:translate-y-2.5",
          isLast && length % 7 === 4 && "last:translate-x-2 last:translate-y-2",
          isLast &&
            length % 7 === 6 &&
            "last:-translate-x-1.5 last:translate-y-1",
          isLast &&
            length % 7 === 0 &&
            "last:-translate-x-3 last:translate-y-3",
        )}
      >
        {isFirst &&
          selectedModule &&
          (selectedModule.isPurchased === undefined ||
            selectedModule.isPurchased === null) && (
            <div className="absolute top-0 z-[1] h-10 w-[84px] bg-background" />
          )}

        <Popover.Root open={popoverOpened} onOpenChange={setPopoverOpened}>
          <Popover.Trigger
            className="group relative z-[2] h-full w-full focus:outline-none"
            onClick={() => {
              makeHapticFeedback({ impactOccured: "soft" })
            }}
          >
            {(blocks && blocks.length > 0) || isPurchased !== null ? (
              <>
                {isClaimed ? (
                  <>
                    {selectedModule &&
                    selectedModule.isPurchased !== undefined &&
                    selectedModule.isPurchased !== null ? (
                      <>
                        <PremiumCircleShadow className="absolute top-1" />
                        <div className="clipy-path relative flex items-center justify-center overflow-hidden group-active:translate-y-1">
                          <PremiumCircle />
                          <div className="absolute text-[#A55F11]">
                            <LessonIcon icon={image} />
                          </div>
                        </div>
                        <img
                          src={CheckSuccess}
                          className="absolute left-[53px] top-[50px] h-[18px] w-[18px] group-active:translate-y-1"
                        />
                      </>
                    ) : (
                      <>
                        <div
                          className={cn(
                            "relative z-40 flex h-full w-full items-center justify-center rounded-full group-active:-translate-x-0.5 group-active:translate-y-1",
                            selectedModule &&
                              selectedModule.isPurchased !== undefined &&
                              selectedModule.isPurchased !== null &&
                              "border border-[#A55F11]",
                          )}
                          style={{
                            background:
                              selectedModule &&
                              selectedModule.isPurchased !== undefined &&
                              selectedModule.isPurchased !== null
                                ? "linear-gradient(-40deg, #DC7C00 -10%, #FC0 68%, #FEF27F 110%)"
                                : isHexColor(color)
                                  ? color
                                  : "#6D6BE2",
                          }}
                        >
                          <LessonIcon icon={image} />
                          <div
                            className={cn(
                              "absolute left-12 top-12 flex h-5 w-5 items-center rounded-full ring-4",
                              selectedModule &&
                                selectedModule.isPurchased !== undefined &&
                                selectedModule.isPurchased !== null
                                ? "bg-[#A55F11] ring-[#A55F11]"
                                : "bg-[#1C2430] ring-[#050D12]",
                            )}
                          >
                            <img src={CheckSuccess} className="h-full w-full" />
                          </div>
                        </div>
                        <div
                          className="absolute -left-0.5 top-1 h-full w-full rounded-full"
                          style={{
                            backgroundColor:
                              selectedModule &&
                              selectedModule.isPurchased !== undefined &&
                              selectedModule.isPurchased !== null
                                ? `#A55F11`
                                : `hsl(${hsl.h} ${hsl.s}% ${hsl.l}%)`,
                          }}
                        />
                      </>
                    )}
                  </>
                ) : isActive ? (
                  <>
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
                      className={cn(
                        "absolute -bottom-3 left-1/2 z-[41] rounded-lg bg-white px-2.5 py-1.5 text-xs font-extrabold uppercase",
                        selectedModule &&
                          selectedModule.isPurchased !== undefined &&
                          selectedModule.isPurchased !== null
                          ? "border border-[#AF90D0] text-[#4E2A02]"
                          : "border-2 border-background text-background",
                      )}
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
                      <p>
                        {lesson.id === HARDCODED_LESSON_ID 
                          ? t("Перейти в чат")
                          : t("Начать")
                        }
                      </p>
                    </motion.div>

                    {selectedModule &&
                    selectedModule.isPurchased !== undefined &&
                    selectedModule.isPurchased !== null ? (
                      <>
                        {reward ? (
                          <PremiumCircleShadowActive className="absolute top-1" />
                        ) : (
                          <PremiumCircleFullShadow className="absolute top-1" />
                        )}
                        <div
                          className={cn(
                            "relative flex items-center justify-center overflow-hidden group-active:translate-y-1",
                            reward && "clipy-path--active",
                          )}
                        >
                          {reward ? (
                            <PremiumCircleActive className="relative" />
                          ) : (
                            <PremiumCircleFull className="relative" />
                          )}
                          <div className="absolute text-[#A55F11]">
                            {isFirstPremiumLesson ? (
                              <BlackStarIcon className="h-10 w-10" />
                            ) : (
                              <LessonIcon icon={image} />
                            )}
                          </div>
                        </div>
                        {reward && (
                          <div className="absolute left-[46px] top-[51px] flex h-5 w-max items-center gap-1 rounded-md bg-[#1C2430] px-1 group-active:translate-y-1">
                            <Coin className="h-3 w-3" />
                            <span className="text-xs font-bold text-[#FEED1E]">
                              {reward}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div
                          className={cn(
                            "relative z-40 flex h-full w-full items-center justify-center rounded-full group-active:-translate-x-0.5 group-active:translate-y-1",
                            selectedModule &&
                              selectedModule.isPurchased !== undefined &&
                              selectedModule.isPurchased !== null &&
                              "border border-[#A55F11]",
                          )}
                          style={{
                            background:
                              selectedModule &&
                              selectedModule.isPurchased !== undefined &&
                              selectedModule.isPurchased !== null
                                ? "linear-gradient(-80deg, #DC7C00 -10%, #FC0 68%, #FEF27F 110%)"
                                : isHexColor(color)
                                  ? color
                                  : "#6D6BE2",
                          }}
                        >
                          {isFirstPremiumLesson ? (
                            <BlackStarIcon className="h-10 w-10 text-[#A55F11]" />
                          ) : (
                            <LessonIcon icon={image} />
                          )}

                          {reward && (
                            <div className="absolute left-10 top-12 flex h-5 w-max items-center gap-1 rounded-md border border-[#FEED1E] bg-[#1C2430] px-1 ring-4 ring-[#050D12]">
                              <Coin className="h-3 w-3" />
                              <span className="text-xs font-bold text-[#FEED1E]">
                                {reward}
                              </span>
                            </div>
                          )}
                        </div>
                        <div
                          className="absolute -left-0.5 top-1 h-full w-full rounded-full"
                          style={{
                            backgroundColor:
                              selectedModule &&
                              selectedModule.isPurchased !== undefined &&
                              selectedModule.isPurchased !== null
                                ? `#A55F11`
                                : `hsl(${hsl.h} ${hsl.s}% ${hsl.l}%)`,
                          }}
                        />
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div
                      className={cn(
                        "relative z-40 flex h-full w-full items-center justify-center rounded-full group-active:-translate-x-0.5 group-active:translate-y-1",
                        selectedModule &&
                          selectedModule.isPurchased !== undefined &&
                          selectedModule.isPurchased !== null
                          ? "bg-[#E2C6FF]"
                          : "bg-[#283649]",
                      )}
                    >
                      {isFirstPremiumLesson ? (
                        <BlackStarIcon className="h-10 w-10 text-[#8E73F4]" />
                      ) : (
                        <div
                          className={cn(
                            selectedModule &&
                              selectedModule.isPurchased !== undefined &&
                              selectedModule.isPurchased !== null &&
                              "text-[#8E73F4]",
                          )}
                        >
                          <LessonIcon icon={image} />
                        </div>
                      )}

                      {reward &&
                        selectedModule &&
                        (selectedModule.isPurchased === undefined ||
                          selectedModule.isPurchased === null) && (
                          <div className="absolute left-10 top-12 flex h-5 w-max items-center gap-1 rounded-md border border-[#FEED1E] bg-[#1C2430] px-1 ring-4 ring-[#050D12]">
                            <Coin className="h-3 w-3" />

                            <p className="text-xs font-bold text-[#FEED1E]">
                              {reward}
                            </p>
                          </div>
                        )}
                    </div>
                    <div
                      className={cn(
                        "absolute -left-0.5 top-1 h-full w-full rounded-full",
                        selectedModule &&
                          selectedModule.isPurchased !== undefined &&
                          selectedModule.isPurchased !== null
                          ? "bg-[#AF90D0]"
                          : "bg-[#3B4A60]",
                      )}
                    />
                  </>
                )}
              </>
            ) : (
              <>
                <div
                  className={cn(
                    "relative z-40 flex h-full w-full items-center justify-center rounded-full bg-[#283649] group-active:-translate-x-0.5 group-active:translate-y-1",
                    selectedModule &&
                      selectedModule.isPurchased !== undefined &&
                      selectedModule.isPurchased !== null
                      ? "bg-[#E2C6FF]"
                      : "bg-[#283649]",
                  )}
                >
                  {selectedModule &&
                  selectedModule.isPurchased !== undefined &&
                  selectedModule.isPurchased !== null ? (
                    <div
                      className={cn(
                        selectedModule &&
                          selectedModule.isPurchased !== undefined &&
                          selectedModule.isPurchased !== null &&
                          "text-[#8E73F4]",
                      )}
                    >
                      <LessonIcon icon={image} />
                    </div>
                  ) : (
                    <LockIcon
                      className={cn(
                        "h-10 w-10",
                        selectedModule &&
                          selectedModule.isPurchased !== undefined &&
                          selectedModule.isPurchased !== null
                          ? "text-[#8E73F4]"
                          : "text-background",
                      )}
                    />
                  )}

                  {selectedModule &&
                    (selectedModule.isPurchased === undefined ||
                      selectedModule.isPurchased === null) && (
                      <div className="absolute left-10 top-12 flex h-5 w-max items-center gap-1 rounded-md border border-white/75 bg-[#1C2430] px-1 text-xs text-white/75 ring-4 ring-[#050D12]">
                        {t("Скоро")}
                      </div>
                    )}
                </div>
                <div
                  className={cn(
                    "absolute -left-0.5 top-1 h-full w-full rounded-full",
                    selectedModule &&
                      selectedModule.isPurchased !== undefined &&
                      selectedModule.isPurchased !== null
                      ? "bg-[#AF90D0]"
                      : "bg-[#3B4A60]",
                  )}
                />
              </>
            )}
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              className="z-50 flex w-[calc(100vw-64px)] max-w-[360px] flex-col rounded-[10px] bg-[#132F40]/90 p-2.5 font-nunito text-white shadow-md outline-none backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
              collisionPadding={{ bottom: 80, right: 32, left: 32 }}
              sideOffset={8}
            >
              {!isClaimed && reward !== 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="flex h-6 items-center gap-1.5 rounded-lg bg-[#0F1824] px-1.5 text-[#FEED1E]">
                    <Coin className="h-4 w-4" />

                    <span className="mt-px text-sm font-bold">
                      {reward} NUTS
                    </span>
                  </div>

                  <div className="flex h-6 items-center gap-1.5 rounded-lg bg-[#0F1824] px-1.5 text-[#F68DF1]">
                    <Ticket className="h-4 w-4" />
                    <span className="mt-px text-sm font-bold">
                      {nutPassXp} XP
                    </span>
                  </div>
                </div>
              )}
              <span
                className={cn(
                  "text-base font-bold",
                  !isClaimed && reward !== 0 && "mt-3",
                )}
              >
                {lang === "RU" ? title : titleEn}
              </span>
              <span className="mt-1 text-sm">
                {lang === "RU" ? description : descriptionEn}
              </span>
              <Button
                appearance={
                  healthPoints === 0 && !isClaimed
                    ? "gray-dark"
                    : isPurchased === false
                      ? "yellow-linear"
                      : "white"
                }
                className="mt-4 h-10"
                contentClassName={cn(
                  "h-9 text-base",
                  isPurchased === false
                    ? !isActive
                      ? "text-white/75"
                      : "text-[#481F02]"
                    : "",
                )}
                shadowClassName="h-10 group-active:h-9"
                onClick={
                  isPurchased === false
                    ? handleLessonPurchaseClick
                    : onStartClick
                }
                disabled={
                  (healthPoints === 0 && !isClaimed) ||
                  (!isClaimed && !isActive) ||
                  (blocks === null && isPurchased === true) ||
                  (blocks?.length === 0 && isPurchased === null)
                }
              >
                {((healthPoints === 0 && !isClaimed) ||
                  (!isClaimed && !isActive) ||
                  (blocks?.length === 0 && isPurchased === null)) && (
                  <LockIcon className="h-4 w-4" />
                )}
                {isPremiumLinkLoading ? (
                  <Loader className="animate-spin" />
                ) : lesson.id === HARDCODED_LESSON_ID ? (
                  t("Присоединиться")
                ) : blocks && blocks.length > 0 ? (
                  isClaimed ? (
                    t("Пройти снова")
                  ) : healthPoints === 0 ? (
                    data && data.nextRestore !== null ? (
                      `${t("Новая попытка через:")} ${Math.round((new Date(data?.nextRestore).getTime() - Date.now()) / 1000 / 60)}${t("m")}`
                    ) : (
                      t("Чуть-чуть подожди")
                    )
                  ) : (
                    t("Начать")
                  )
                ) : isPurchased === false &&
                  isPremiumModule &&
                  starsPrice &&
                  tonPrice ? (
                  isCommitPaymentLocked ? (
                    <Loader className="animate-spin" />
                  ) : (
                    <>{t("Начать")}</>
                  )
                ) : isPurchased === false && starsPrice && tonPrice ? (
                  isCommitPaymentLocked ? (
                    <Loader className="animate-spin" />
                  ) : (
                    <>
                      {t("Открыть за")}
                      {Telegram.WebApp.initData ? (
                        <>
                          <StarIcon className="h-4 w-4" />
                          {starsPrice}
                        </>
                      ) : (
                        <>
                          <TonIcon className="h-4 w-4" />
                          {tonPrice.toFixed(2)}
                          <span className="text-sm line-through opacity-80">
                            {tonPriceFull.toFixed(2)}
                          </span>
                        </>
                      )}
                    </>
                  )
                ) : (
                  t("Недоступно")
                )}
              </Button>
              <Popover.Arrow className="fill-[#132F40]/90" />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>

      {isPremiumModule && modulePreview && onModulePurchase && (
        <PremiumModulePreviewModal
          open={lessonPreviewOpen}
          onOpenChange={setLessonPreviewOpen}
          preview={modulePreview}
          selectedModule={
            {
              starsPrice: moduleStarsPrice,
              tonPrice: moduleTonPrice,
              tonPriceFull: moduleFullTonPrice,
              title: lang === "RU" ? title : titleEn,
              titleEn: lang === "RU" ? title : titleEn,
            } as Module
          }
          isCommitPaymentLocked={isCommitPaymentLocked}
          onPurchaseClick={onPurchaseClick}
        />
      )}
    </>
  )
}

export default MapItem
