import { useTranslation } from "react-i18next"

import Loader from "@/assets/icons/loader.svg?react"

import { useAppSelector } from "@/redux/hooks"

import { cn } from "@/lib/cn"

const LoadingScreen = ({
  hasToHideText = true,
}: {
  hasToHideText?: boolean
}) => {
  const { t } = useTranslation()

  const lang = useAppSelector((state) => state.language.value)

  return (
    <main className="fixed left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-10 font-nunito text-white">
      <Loader className="h-20 w-20 animate-spin" />
      {!hasToHideText && (
        <p
          className={cn(
            "text-center text-base",
            lang === "RU" ? "w-72" : "w-64",
          )}
        >
          {t("Высокая нагрузка на приложение, подождите 10-20 секунд ⏳")}
        </p>
      )}
    </main>
  )
}

export default LoadingScreen
