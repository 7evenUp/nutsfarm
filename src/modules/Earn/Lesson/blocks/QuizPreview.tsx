import { useTranslation } from "react-i18next"
import { RiveFile, useRive } from "@rive-app/react-webgl2"

import ArrowRight from "../components/ArrowRight"

import { LargeButton } from "@/shared/ui/LargeButton"

import { cn } from "@/lib/cn"

const QuizPreview = ({
  onClick,
  riveFile,
}: {
  onClick: () => void
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
        {t("Квиз")}
      </span>
      <p className="mb-5 px-4 text-center text-sm phone-xsm:px-9 phone-sm-fix:text-base">
        {t(
          "Правильно ответь на вопрос, чтобы пройти дальше и забрать награду!",
        )}
      </p>
      <p className="mb-4 px-4 text-center text-sm phone-xsm:px-9 phone-sm-fix:text-base">
        {t("Кол-во жизней ограничено!")}
      </p>

      <RiveComponent className="h-[200px] w-screen max-w-[350px] phone-xsm:h-[300px]" />

      <LargeButton
        className={cn(
          "absolute inset-x-3.5 w-auto",
          Telegram.WebApp.platform === "weba"
            ? "bottom-4"
            : "bottom-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
        )}
        appearance="white"
        hasRing
        contentClassName="gap-2.5"
        onClick={onClick}
      >
        {t("Ответить")} <ArrowRight />
      </LargeButton>
    </>
  )
}

export default QuizPreview
