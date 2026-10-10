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
        "fixed left-1/2 z-[1] w-[calc(100%-176px)] max-w-[324px] -translate-x-1/2",
        Telegram.WebApp.platform === "weba"
          ? "bottom-[156px]"
          : "bottom-[calc(max(var(--tg-safe-area-inset-bottom,16px),16px)+140px)]",
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
