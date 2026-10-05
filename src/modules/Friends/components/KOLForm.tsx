import { useTranslation } from "react-i18next"

import ForwardIcon from "@/assets/icons/forward.svg?react"
import SpeakerIcon from "@/assets/friends/icons/speaker.svg?react"

import { useAppSelector } from "@/redux/hooks"

import { sendMetrika } from "@/utils/sendMetrika"

const KOLForm = () => {
  const { t } = useTranslation()

  const lang = useAppSelector((state) => state.language.value)

  const onKOLFormClick = () => {
    sendMetrika("click_KOL_form")

    if (lang === "RU") {
      Telegram.WebApp.openLink(
        "https://docs.google.com/forms/d/e/1FAIpQLSeGK0Zu-Yv4N20Hn-hLV3vmawEtfL7DVpN38smj4TBN1EBqLg/viewform",
      )
    } else {
      Telegram.WebApp.openLink("https://forms.gle/7BLfgvfrDPW2z7kz5")
    }
  }

  return (
    <button
      onClick={onKOLFormClick}
      className="mt-7 flex min-h-[70px] items-center gap-3 rounded-xl bg-[#17202D] py-1.5 pl-1.5 pr-7"
    >
      <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-xl bg-[#0F1824]">
        <SpeakerIcon />
      </div>
      <p className="text-left text-sm/[19px]">
        {t("У тебя свой блог и хочешь больше бонусов? Тогда")}{" "}
        <span className="font-semibold text-[#55A3FF]">
          {t("заполни")}{" "}
          <span className="inline-block">
            {t("форму")} <ForwardIcon className="inline-block h-3.5 w-3.5" />
          </span>
        </span>
      </p>
    </button>
  )
}

export default KOLForm
