import { useTranslation } from "react-i18next"

import NutIcon from "@/assets/icons/nut-icon-square.png"

const TechnicalWorks = () => {
  const { t } = useTranslation()

  const redirectToChannel = () => {
    Telegram.WebApp.openTelegramLink("https://t.me/nutsfarm")
  }

  return (
    <div className="relative flex h-screen w-screen flex-col items-center justify-between bg-background p-4 pb-8 text-xl text-white">
      <div className="flex items-center gap-2.5 self-start">
        <img src={NutIcon} className="h-7 w-7" alt="Nut coin icon" />
        <span className="font-tt-hoves text-base font-semibold text-white">
          Nuts Farm
        </span>
      </div>
      <div className="flex flex-col items-center gap-6">
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
          className="h-12 w-12"
        >
          <path d="M9.3 6.2a4.55 4.55 0 0 0 5.4 0" />
          <path d="M7.9 10.7c.9.8 2.4 1.3 4.1 1.3s3.2-.5 4.1-1.3" />
          <path d="M13.9 3.5a1.93 1.93 0 0 0-3.8-.1l-3 10c-.1.2-.1.4-.1.6 0 1.7 2.2 3 5 3s5-1.3 5-3c0-.2 0-.4-.1-.5Z" />
          <path d="m7.5 12.2-4.7 2.7c-.5.3-.8.7-.8 1.1s.3.8.8 1.1l7.6 4.5c.9.5 2.1.5 3 0l7.6-4.5c.7-.3 1-.7 1-1.1s-.3-.8-.8-1.1l-4.7-2.8" />
        </svg>
        <span className="text-center font-tt-hoves-expanded text-lg font-medium text-white">
          {t(
            "В данный момент ведутся технические работы. Пожалуйста, зайдите позже :)",
          )}
        </span>
      </div>
      <button
        onClick={redirectToChannel}
        className="flex h-14 w-full items-center justify-center gap-4 rounded-[14px] bg-[#17202D] font-tt-hoves-expanded text-base font-semibold text-white transition-colors active:bg-[#202936]"
      >
        {t("Перейти в телеграм канал")}
      </button>
    </div>
  )
}

export default TechnicalWorks
