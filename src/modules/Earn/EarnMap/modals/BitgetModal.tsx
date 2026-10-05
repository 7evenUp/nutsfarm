import { useState } from "react"
import { Description } from "@radix-ui/react-dialog"
import { useTranslation } from "react-i18next"

import BitgetIcon from "@/assets/lesson-icons/bitget-icon.svg?react"

import SuccessPNG from "@/assets/images/bitget-success.png"
import FailurePNG from "@/assets/images/bitget-failure.png"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/shared/ui/SideSheet"

import { Lesson } from "@/types/learn"
import { UserTask } from "@/types/task"

import { cn } from "@/lib/cn"

// TO_BE_CHANGED
// LessonBlockIdentifiers according to backend
const xyz = [
  1745179584, 956194797, 1690722271, 396804254, 5485611653, 414297004,
  956779673, 1662001224, 386917636, 517400935, 331311812, 325552142, 436235001,
  1410795562, 73528393, 1086443060, 364096327, 1670147066, 1495614108,
  348945754, 899283852, 5805898834,
]

const BitgetModal = ({
  children,
  className,
  currentTask,
  currentUserTgId,
}: {
  children: React.ReactNode
  className?: string
  claimedLessons: Lesson[]
  currentTask: UserTask | undefined
  lessons: (Lesson & { isActive: boolean })[]
  currentUserTgId: number
}) => {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)

  if (!currentTask) return
  if (currentTask.status !== "CLAIMED") return

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className={className} asChild>
        {children}
      </SheetTrigger>
      <SheetContent
        className={cn(
          "max-h-screen items-center gap-9 overflow-hidden overflow-y-scroll p-0 px-3.5 pb-10 pt-6",
          // Telegram.WebApp.platform === "weba"
          //   ? "pb-8"
          //   : "pb-[calc(max(var(--tg-safe-area-inset-bottom,32px),32px)+32px)]",
        )}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Description className="sr-only">BitGet promo event modal</Description>

        <SheetHeader closeIconClassName="top-4">
          <div className="flex w-full flex-col items-center gap-2.5 px-4">
            <BitgetIcon className="h-8 w-8" />
            <span className="text-center text-xl">
              {t("Результаты кампании")}
            </span>
          </div>
        </SheetHeader>

        {xyz.includes(currentUserTgId) ? (
          <>
            <div className="bitget-gradient-success flex w-full flex-col items-center rounded-[18px] bg-[#0F1824] pb-[262px] pt-6">
              <p className="mb-4 font-bold text-[#8BE872]">
                {t("Поздравляем! 🎉")}
              </p>
              <p className="mb-3 w-[315px] text-center text-sm text-white">
                {t(
                  "Вы вошли в число победителей партнёрской кампании Bitget x Nuts Farm!",
                )}
              </p>
              <p className="w-[315px] text-center text-sm text-white">
                {t(
                  "💸 В течение двух недель ваш приз будет зачислен на баланс аккаунта Bitget.",
                )}
              </p>
            </div>
            <img
              src={SuccessPNG}
              alt="Nutcracker image"
              className="absolute bottom-0 left-1/2 h-[261px] w-[242px] -translate-x-1/2"
            />
          </>
        ) : (
          <>
            <div className="bitget-gradient-failure flex w-full flex-col items-center rounded-[18px] bg-[#0F1824] pb-[285px] pt-6">
              <p className="mb-4 font-bold">
                {t("Повезёт в следующий раз...")}
              </p>
              <p className="mb-3 w-[283px] text-center text-sm font-semibold text-white">
                {t("💪 Готовьтесь принять участие в следующей кампании!")}
              </p>
            </div>
            <img
              src={FailurePNG}
              alt="Nutcracker image"
              className="absolute bottom-0 left-1/2 h-[300px] w-[305px] -translate-x-1/2"
            />
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default BitgetModal
