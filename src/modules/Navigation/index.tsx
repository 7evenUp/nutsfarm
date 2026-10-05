import { NavLink, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"

import HomeIcon from "@/assets/icons/home.svg?react"
import GamesIcon from "@/assets/icons/games-navigation.svg?react"
import TicketIcon from "@/assets/icons/ticket-navigation.svg?react"
import GroupIcon from "@/assets/icons/group.svg?react"
import EarnIcon from "@/assets/icons/book-nav.svg?react"

import LearnNotification from "./LearnNotification"
import GamesNotification from "./GamesNotification"
import PassNotification from "./PassNotification"

import { useAppSelector } from "@/redux/hooks"
import { useGetCurrentUserQuery } from "@/redux/api/user"

import { sendMetrika } from "@/utils/sendMetrika"
import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

import { cn } from "@/lib/cn"

const Navigation = () => {
  const { t } = useTranslation()

  const { pathname } = useLocation()

  const lang = useAppSelector((state) => state.language.value)

  const { data: currentUser } = useGetCurrentUserQuery()

  const metrikaObject = {
    userBalance: currentUser?.balance,
  }

  if (pathname.includes("/games/")) return null

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-1/2 z-50 w-full max-w-[500px] -translate-x-1/2 px-4",
        Telegram.WebApp.platform === "weba"
          ? "pb-4"
          : "pb-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
        pathname === "/tasks" && "bg-background",
        pathname === "/friends" && "bg-background",
        // pathname === "/earn" && "bg-background",
      )}
    >
      <div
        className={cn(
          "relative grid grid-cols-5 rounded-2xl bg-[#0F1824] pb-[7px] pt-[9px] text-[13px]/4",
          "overflow-hidden",
          lang === "EN" ? "px-3 phone-sm:px-6" : "phone-sm-fix:px-4",
          pathname === "/" && "bg-[#17202D]",
          pathname === "/tasks" && "ring-4 ring-background",
          // pathname === "/earn" && "ring-4 ring-background",
        )}
      >
        <NavLink
          to="/"
          className="relative z-10 flex flex-col items-center gap-2"
          onClick={() => {
            sendMetrika("main_page", metrikaObject)
            makeHapticFeedback({ impactOccured: "light" })
          }}
        >
          {({ isActive }) => (
            <>
              <HomeIcon
                className={cn(
                  isActive ? "text-cyan" : "text-white/30",
                  "h-5 w-5",
                )}
              />
              <span
                className={cn(
                  "font-semibold",
                  isActive ? "text-white" : "text-white/30",
                )}
              >
                {t("Главная")}
              </span>
            </>
          )}
        </NavLink>
        <NavLink
          to="/games"
          className="relative z-10 flex flex-col items-center gap-2"
          onClick={() => {
            sendMetrika("games", metrikaObject)
            makeHapticFeedback({ impactOccured: "light" })
          }}
        >
          {({ isActive }) => (
            <>
              <div className="relative h-5 w-5">
                <GamesIcon
                  className={cn(
                    isActive ? "text-cyan" : "text-white/30",
                    "h-5 w-5",
                  )}
                />
                <GamesNotification />
              </div>

              <span
                className={cn(
                  "font-semibold",
                  isActive ? "text-white" : "text-white/30",
                )}
              >
                {t("Игры")}
              </span>
            </>
          )}
        </NavLink>
        <NavLink
          to="/earn"
          className="relative z-10 flex flex-col items-center gap-2"
          onClick={() => {
            sendMetrika("course", metrikaObject)
            makeHapticFeedback({ impactOccured: "light" })
          }}
        >
          {({ isActive }) => (
            <>
              <div className="relative h-5 w-5">
                <div className="absolute left-1/2 top-1 z-10 size-4 -translate-x-1/2 animate-pulse rounded-full bg-[#EED052] blur-md" />
                <EarnIcon
                  className={cn(
                    isActive ? "text-[#EED052]" : "text-[#EED052]/50",
                    "relative z-20 h-5 w-5",
                    pathname.includes("earn") &&
                      pathname.length > 15 &&
                      "text-[#EED052]",
                  )}
                />
                <LearnNotification />
              </div>

              <span
                className={cn(
                  "font-semibold",
                  isActive ? "text-[#EED052]" : "text-[#EED052]/50",
                  pathname.includes("earn") &&
                    pathname.length > 15 &&
                    "text-[#EED052]",
                )}
              >
                {t("Обучение")}
              </span>
            </>
          )}
        </NavLink>
        <NavLink
          to="/pass"
          className="relative z-10 flex flex-col items-center gap-2"
          onClick={() => {
            sendMetrika("pass", metrikaObject)
            makeHapticFeedback({ impactOccured: "light" })
          }}
        >
          {({ isActive }) => (
            <>
              <div className="relative h-5 w-5">
                <TicketIcon
                  className={cn(
                    isActive ? "text-cyan" : "text-white/30",
                    "h-5 w-5",
                  )}
                />
                <PassNotification />
              </div>
              <span
                className={cn(
                  "font-semibold",
                  isActive ? "text-white" : "text-white/30",
                )}
              >
                {t("Пропуск")}
              </span>
            </>
          )}
        </NavLink>
        <NavLink
          to="/friends"
          className="relative z-10 flex flex-col items-center gap-2"
          onClick={() => {
            sendMetrika("frens", metrikaObject)
            makeHapticFeedback({ impactOccured: "light" })
          }}
        >
          {({ isActive }) => (
            <>
              <GroupIcon
                className={cn(
                  isActive ? "text-cyan" : "text-white/30",
                  "h-5 w-5",
                )}
              />
              <span
                className={cn(
                  "font-semibold",
                  isActive ? "text-white" : "text-white/30",
                )}
              >
                {t("Друзья")}
              </span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  )
}

export default Navigation
