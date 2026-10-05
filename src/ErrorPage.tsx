import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useRouteError } from "react-router-dom"

import NutIcon from "@/assets/icons/nut-icon-square.png"
import ChevronDown from "@/assets/icons/chevron-down.svg?react"

import { LargeButton } from "./shared/ui/LargeButton"

import { cn } from "./lib/cn"

export const ErrorPage = () => {
  const { t } = useTranslation()

  const navigate = useNavigate()
  const error = useRouteError()

  const [isMessageVisible, setIsMessageVisible] = useState(false)

  const errorMessage = (error: unknown): string => {
    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof error.message === "string"
    ) {
      return error.message
    }
    return "An unexpected error occurred."
  }

  const fullErrorMessage = errorMessage(error)

  const briefErrorMessage =
    fullErrorMessage.length > 100
      ? `${fullErrorMessage.slice(0, 100)}...`
      : fullErrorMessage

  return (
    <main
      className={cn(
        "flex h-screen w-screen flex-1 flex-col items-center bg-background p-4 text-white",
        Telegram.WebApp.platform === "weba"
          ? "pb-[174px]"
          : "pb-[calc(max(var(--tg-safe-area-inset-bottom,16px),16px)+158px)]",
      )}
    >
      <div className="flex items-center gap-2.5 self-start">
        <img src={NutIcon} className="h-7 w-7" alt="Nut coin icon" />
        <span className="font-tt-hoves text-base font-semibold text-white">
          Nuts Farm
        </span>
      </div>

      <div className="mt-14 w-full font-tt-hoves-expanded">
        <div className="from-blue-600 rounded-2xl bg-gradient-to-r to-purple-600 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h1 className="mb-2 text-2xl font-bold">{t("Произошла ошибка")}</h1>
            {fullErrorMessage.length > 100 && (
              <button
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black transition-colors active:bg-white/80"
                onClick={() => setIsMessageVisible(!isMessageVisible)}
                aria-label={
                  isMessageVisible ? "Hide error details" : "Show error details"
                }
              >
                <ChevronDown
                  className={cn(
                    "h-5 w-5 transition-transform",
                    isMessageVisible && "rotate-180",
                  )}
                />
              </button>
            )}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm text-gray-200">
              {isMessageVisible ? fullErrorMessage : briefErrorMessage}
            </p>
          </div>
        </div>
      </div>
      <LargeButton
        appearance="yellow-linear"
        hasRing
        className={cn(
          "absolute inset-x-3.5 w-auto",
          Telegram.WebApp.platform === "weba"
            ? "bottom-4"
            : "bottom-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
        )}
        contentClassName="gap-2.5"
        onClick={() => navigate("/")}
      >
        {t("Обновите страницу")}
      </LargeButton>
    </main>
  )
}
