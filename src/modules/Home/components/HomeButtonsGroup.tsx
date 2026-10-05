import { Link } from "react-router-dom"

import TasksList from "@/assets/icons/tasks-list.svg?react"
import NutcrackerIcon from "@/assets/icons/nutcracker.svg?react"
import WheelIcon from "@/assets/icons/wheel.svg?react"

import TasksNotification from "@/modules/Navigation/TasksNotification"
import LuckyNuts from "@/modules/Games/components/LuckyNuts"

import NutcrackersDialog from "@/modals/Nutcrackers"

import { sendMetrika } from "@/utils/sendMetrika"
import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

import { cn } from "@/lib/cn"

const HomeButtonsGroup = () => {
  return (
    <div
      className={cn(
        "fixed left-1/2 z-[1] flex w-full max-w-[500px] -translate-x-1/2 items-end justify-between px-4",
        Telegram.WebApp.platform === "weba"
          ? "bottom-[156px]"
          : "bottom-[calc(max(var(--tg-safe-area-inset-bottom,16px),16px)+140px)]",
      )}
    >
      <div className="flex flex-col gap-2">
        {/* Кнопка "Пазл" */}
        <NutcrackersDialog className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#243B54] transition-colors focus:outline-none active:bg-[#1c242f]">
          <NutcrackerIcon />
        </NutcrackersDialog>

        <Link
          to="/tasks"
          className="group flex h-14 w-14 items-center justify-center rounded-xl bg-[#243B54] transition-colors focus:outline-none active:bg-[#1c242f]"
          onClick={() => {
            sendMetrika("tasks")
            makeHapticFeedback({ impactOccured: "rigid" })
          }}
          aria-label="Open tasks section"
        >
          <div className="relative">
            <TasksList className="h-8 w-8" />
            <TasksNotification />
          </div>
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <Link
          to="/earn?openModules=true"
          className="group flex h-14 w-14 items-center justify-center rounded-xl bg-[#243B54] drop-shadow-[0px_0px_2px_#FEED1F] border border-[#FEED1F] transition-colors focus:outline-none active:bg-[#1c242f]"
          onClick={() => {
            makeHapticFeedback({ impactOccured: "rigid" })
          }}
          aria-label="Open secret module"
        >
          <div className="relative">
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
        </Link>

        <LuckyNuts>
          <button
            className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#243B54] transition-colors focus:outline-none active:bg-[#1c242f]"
            onClick={() => {
              makeHapticFeedback({ impactOccured: "rigid" })
            }}
          >
            <WheelIcon className="h-8 w-8" />
          </button>
        </LuckyNuts>
      </div>
    </div>
  )
}

export default HomeButtonsGroup
