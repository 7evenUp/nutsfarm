import { useEffect, useState } from "react"
import { Description, Title } from "@radix-ui/react-dialog"
import { useTranslation } from "react-i18next"

import { Sheet, SheetContent, SheetTrigger } from "@/shared/ui/SideSheet"

import { useAppSelector } from "@/redux/hooks"

import { cn } from "@/lib/cn"

import {
  BackButton,
  initBackButton,
  RemoveEventListenerFn,
} from "@telegram-apps/sdk"

let backButton: BackButton

if (import.meta.env.VITE_IS_DEV_LOCAL === undefined) {
  try {
    const [initializedBackButton] = initBackButton()
    backButton = initializedBackButton
  } catch {
    /* empty */
  }
}

const XP_INFO_DATA = [
  {
    title: "Lucky Nuts",
    titleEn: "Lucky Nuts",
    description: "120 XP",
    descriptionEn: "120 XP",
  },
  {
    title: "Игры",
    titleEn: "Playing games",
    description: "100 XP",
    descriptionEn: "100 XP",
  },
  {
    title: "День забега",
    titleEn: "Nuts Dash Day",
    description: "75 XP",
    descriptionEn: "75 XP",
  },
  {
    title: "Сторис",
    titleEn: "Watching stories",
    description: "от 75 XP",
    descriptionEn: "from 75 XP",
  },
  {
    title: "Клеймы",
    titleEn: "Daily claim",
    description: "от 75 XP",
    descriptionEn: "from 75 XP",
  },
  {
    title: "Задания",
    titleEn: "Accomplishing tasks",
    description: "от 50 XP",
    descriptionEn: "from 50 XP",
  },
  {
    title: "Уроки",
    titleEn: "Taking lessons",
    description: "от 50 XP",
    descriptionEn: "from 50 XP",
  },
  {
    title: "Рефералы",
    titleEn: "Referral invitation",
    description: "10 XP",
    descriptionEn: "10 XP",
  },
]

const XpInfo = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)

  const lang = useAppSelector((state) => state.language.value)

  // TMA Back Button
  useEffect(() => {
    if (!backButton) return

    let rmListener: RemoveEventListenerFn
    if (open) {
      backButton.show()
      rmListener = backButton.on("click", () => {
        setOpen(false)
      })
    } else {
      backButton.hide()
    }

    return () => {
      if (rmListener) {
        rmListener()
      }
    }
  }, [open])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        className={cn(
          "items-center gap-0 overflow-hidden p-0 px-3.5 pt-6 phone-xsm:pt-9 phone-sm-fix:px-8",
          Telegram.WebApp.platform === "weba"
            ? "pb-8"
            : "pb-[max(var(--tg-safe-area-inset-bottom,32px),32px)]",
        )}
      >
        <Title className="sr-only">Xp Info Modal</Title>
        <Description className="sr-only">Xp Info Modal</Description>

        <div className="relative z-10 flex w-full flex-col items-center gap-6 phone-xsm:gap-8">
          <h2 className="text-center font-tt-hoves-expanded text-2xl font-semibold -tracking-[0.02em] text-white phone-xsm:text-[28px]/[32px]">
            {t("Распределение XP")}
          </h2>

          <div className="flex w-full max-w-2xl flex-col gap-1">
            {XP_INFO_DATA.map((el, i) => (
              <div
                key={i}
                className="flex h-[44px] w-full items-center justify-between rounded-[10px] bg-[#413577]/40 px-3.5 text-xs font-medium text-white phone-xsm:h-[51px] phone-xsm:text-sm"
              >
                <span className="text-sm phone-xsm:text-base">
                  {lang === "RU" ? el.title : el.titleEn}
                </span>
                <span>{lang === "RU" ? el.description : el.descriptionEn}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(400px_400px_at_110%_100%,_var(--tw-gradient-stops))] from-[#754DCA]/40 to-[#050D12] to-[70%]" />
      </SheetContent>
    </Sheet>
  )
}

export default XpInfo
