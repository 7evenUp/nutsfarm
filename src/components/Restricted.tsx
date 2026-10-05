import { useTranslation } from "react-i18next"

import NutIcon from "@/assets/icons/nut-icon-square.png"

const Restricted = () => {
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
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span className="text-center font-tt-hoves-expanded text-lg font-medium text-white">
          {t(
            "Замечена подозрительная активность. В целях защиты мы временно ограничили ваш доступ к приложению",
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

export default Restricted
