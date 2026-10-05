import { useTranslation } from "react-i18next"
import { RiveFile, useRive } from "@rive-app/react-webgl2"

import { LargeButton } from "@/shared/ui/LargeButton"

import { cn } from "@/lib/cn"

const ClaimedLessonPreview = ({
  selectVariant,
  riveFile,
}: {
  selectVariant: (variant: "full" | "easy") => void
  riveFile: RiveFile | undefined
}) => {
  const { t } = useTranslation()

  const { RiveComponent } = useRive({
    riveFile,
    autoplay: true,
  })

  return (
    <>
      <span className="mb-6 mt-12 px-3.5 text-center font-tt-hoves-expanded text-2xl font-semibold">
        {t("Учимся или повторяем")}
      </span>
      <p className="mb-5 px-4 text-center text-sm phone-xsm:px-9 phone-sm-fix:text-base">
        {t(
          "Вы уже прошли ранее этот урок, и теперь вы можете пройти этот урок заново, в облегченном режиме",
        )}
      </p>
      <p className="mb-4 px-4 text-center text-sm phone-xsm:px-9 phone-sm-fix:text-base">
        {t("Выберите подходящий для вас режим.")}
      </p>

      <RiveComponent className="h-[200px] w-screen max-w-[350px] phone-xsm:h-[300px]" />

      <div
        className={cn(
          "absolute inset-x-3.5 flex gap-2",
          Telegram.WebApp.platform === "weba"
            ? "bottom-4"
            : "bottom-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
        )}
      >
        <LargeButton
          appearance="white"
          onClick={() => {
            selectVariant("easy")
          }}
        >
          {t("Без тестов")}
        </LargeButton>
        <LargeButton appearance="white" onClick={() => selectVariant("full")}>
          {t("С тестами")}
        </LargeButton>
      </div>
    </>
  )
}

export default ClaimedLessonPreview
