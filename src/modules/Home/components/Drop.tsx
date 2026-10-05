import { useTranslation } from "react-i18next"

import DropModal from "@/modals/Drop"

import { LargeButton } from "@/shared/ui/LargeButton"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

import { cn } from "@/lib/cn"

const Drop = () => {
  const { t } = useTranslation()

  const onButtonClick = () => {
    makeHapticFeedback({ impactOccured: "rigid" })
  }

  return (
    <div
      className={cn(
        "fixed z-[1] w-full max-w-[500px] px-4",
        Telegram.WebApp.platform === "weba"
          ? "bottom-[88px]"
          : "bottom-[calc(max(var(--tg-safe-area-inset-bottom,16px),16px)+72px)]",
      )}
    >
      <DropModal>
        <LargeButton appearance="blue-radial" onClick={onButtonClick}>
          {t("Прогресс")}
        </LargeButton>
      </DropModal>
    </div>
  )
}

export default Drop
