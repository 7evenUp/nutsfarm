import { useEffect } from "react"
import { useAnimate, AnimatePresence, motion } from "framer-motion"
import {
  Alignment,
  Fit,
  Layout,
  RiveFile,
  useRive,
} from "@rive-app/react-webgl2"
import { useTranslation } from "react-i18next"

import { LargeButton } from "@/shared/ui/LargeButton"

import { useGetHealthPointsQuery } from "@/redux/api/learn"

import { Sound } from "@/utils/Sound"
import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

import { cn } from "@/lib/cn"

const finalScreenSound = new Sound(
  "https://s3-nutsfarm.crypton.xyz/sounds/no-health.mp3",
)

const Failed = ({
  onReturn,
  riveFile,
}: {
  onReturn: () => void
  riveFile: RiveFile | undefined
}) => {
  const { t } = useTranslation()
  const [scope, animate] = useAnimate()

  const { refetch } = useGetHealthPointsQuery()

  // Настройка первой анимации
  const { RiveComponent } = useRive({
    riveFile,
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  })

  useEffect(() => {
    animate([
      [
        ".congratulation-text",
        {
          bottom: 0,
          opacity: 0,
          transform: "translate(-50%)",
        },
        { duration: 0, at: "<" },
      ],
      [
        ".congratulation-description",
        {
          bottom: 0,
          opacity: 0,
          transform: "translate(-50%)",
        },
        { duration: 0, at: "<" },
      ],
      [
        ".bottom-animation",
        {
          bottom: "-20%",
          opacity: 0,
          transform: "translateX(-50%) scale(0.8)",
        },
        { duration: 0, at: "<" },
      ],
      [
        ".claim-btn",
        {
          transform: "translateY(100px)",
          opacity: 0,
        },
        { duration: 0, at: "<" },
      ],
      // Начало анимации
      [
        ".congratulation-text",
        {
          bottom: "80%",
          opacity: 1,
          transform: "translate(-50%)",
        },
        { duration: 0.8, at: ">", ease: "easeInOut" },
      ],
      [
        ".congratulation-description",
        {
          bottom: "70%",
          opacity: 1,
        },
        { duration: 0.8, at: ">", ease: "easeInOut" },
      ],
      [
        ".bottom-animation",
        { bottom: "20%", opacity: 1, transform: "translateX(-50%) scale(1)" },
        { duration: 1, at: "-0.8", ease: "easeInOut" },
      ],
      //поялвение статов
      [
        ".claim-btn",
        {
          transform: "translateY(0)",
          opacity: 1,
        },
        { delay: 0.6, duration: 0.8, at: "<", ease: "easeInOut" },
      ],
    ])
  }, [animate])

  useEffect(() => {
    Promise.all([finalScreenSound.load()]).then(() => {
      finalScreenSound.play()
    })
  }, [])

  const onBack = () => {
    makeHapticFeedback({ impactOccured: "rigid" })
    refetch()
    onReturn()
  }

  return (
    <div className="relative h-screen w-screen" ref={scope}>
      <span className="congratulation-text absolute left-1/2 mb-8 mt-12 flex items-center gap-2 text-center font-tt-hoves-expanded text-2xl font-semibold text-white">
        {t("Неудача...")}
      </span>
      <span className="congratulation-description absolute left-1/2 mb-8 mt-12 flex w-[340px] items-center gap-2 text-center text-white">
        {t("Твои жизни закончились, возвращайся через 24ч за новыми победами!")}
      </span>
      <AnimatePresence>
        <motion.div
          key="first-animation"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="bottom-animation absolute bottom-10 left-1/2 h-[200px] w-screen max-w-[350px] phone-xsm:h-[300px]"
        >
          <RiveComponent />
        </motion.div>
      </AnimatePresence>
      <LargeButton
        appearance="white"
        className={cn(
          "claim-btn absolute inset-x-3.5 w-auto",
          Telegram.WebApp.platform === "weba"
            ? "bottom-4"
            : "bottom-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
        )}
        contentClassName="gap-2.5"
        onClick={onBack}
      >
        {t("Вернуться на главную")}
      </LargeButton>
    </div>
  )
}

export default Failed
