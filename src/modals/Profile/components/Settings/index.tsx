import { useTranslation } from "react-i18next"

import Language from "./Language"
import Vibrations from "./Vibrations"
import Sound from "./Sound"

const Settings = () => {
  const { t } = useTranslation()

  return (
    <div className="my-[22px] flex flex-col gap-[18px]">
      <span className="ml-4 font-tt-hoves-expanded text-lg font-semibold text-white">
        {t("Настройки")}
      </span>

      <div className="flex flex-col gap-2 px-4">
        <Language />
        <Vibrations />
        <Sound />
      </div>
    </div>
  )
}

export default Settings
