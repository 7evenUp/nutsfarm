import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Description } from "@radix-ui/react-dialog"

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

import DonationTop from "./DonationTop"
// import RefTop from "./RefTop"
import XpTop from "./XpTop"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/Tabs"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/shared/ui/SideSheet"

import { sendMetrika } from "@/utils/sendMetrika"

import { cn } from "@/lib/cn"

const LeaderboardDialog = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)

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
      <SheetTrigger
        className={className}
        onClick={() => {
          sendMetrika("leaderboard")
        }}
      >
        {children}
      </SheetTrigger>
      <SheetContent
        className={cn(
          "gap-0 overflow-y-auto px-0 pb-4 pt-6",
          Telegram.WebApp.initData ? "h-screen rounded-t-none" : "h-[100svh]",
        )}
      >
        <Description className="sr-only">Leaderboard modal</Description>

        <SheetHeader>
          <span className="text-xl">{t("Лидерборд")}</span>
        </SheetHeader>

        <Tabs className="mt-3 flex flex-1 flex-col" defaultValue="by-xp">
          <TabsList className="mb-8 px-4">
            {/* <TabsTrigger
              value="by-referrals"
              className="gap-1.5 rounded-l-[10px]"
            >
              {t("Рефералы")}
            </TabsTrigger> */}
            <TabsTrigger value="by-xp" className="rounded-l-[10px]">
              {t("Опыт")}
            </TabsTrigger>
            <TabsTrigger
              value="by-donations"
              className="gap-1.5 rounded-r-[10px]"
              onClick={() => {
                sendMetrika("donations_global_leaderboard_click")
              }}
            >
              {t("Донаты")}
            </TabsTrigger>
          </TabsList>
          {/* <TabsContent value="by-referrals">
            <RefTop />
          </TabsContent> */}
          <TabsContent value="by-xp">
            <XpTop />
          </TabsContent>
          <TabsContent value="by-donations">
            <DonationTop />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

export default LeaderboardDialog
