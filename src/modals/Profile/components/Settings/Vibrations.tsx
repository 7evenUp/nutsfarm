import { useState } from "react"
import { useTranslation } from "react-i18next"
import * as Switch from "@radix-ui/react-switch"

import {
  isVibrationEnabled,
  makeHapticFeedback,
  persistVibrationEnabled,
} from "@/utils/makeHapticFeedback"

const Vibrations = () => {
  const { t } = useTranslation()

  const [vibrationEnabled, setVibrationEnabled] = useState(isVibrationEnabled())

  const onToggleVibration = async () => {
    const next = !vibrationEnabled
    setVibrationEnabled(next)
    await persistVibrationEnabled(next)
    makeHapticFeedback({ impactOccured: "light" })
  }

  return (
    <label className="flex h-12 w-full cursor-pointer items-center justify-between rounded-xl bg-[#17202D] px-4 text-sm font-medium text-white/75 hover:bg-[#202b3a]">
      <span className="text-sm font-medium text-white/75">
        {t("Разрешить вибрации")}
      </span>
      <Switch.Root
        checked={vibrationEnabled}
        onCheckedChange={onToggleVibration}
        className="relative h-[22px] w-11 rounded-full bg-[#050d12]"
      >
        <Switch.Thumb className="block h-[18px] w-[18px] translate-x-0.5 transform rounded-full bg-white/50 transition-all data-[state=checked]:translate-x-[calc(44px-18px-2px)] data-[state=checked]:bg-white" />
      </Switch.Root>
    </label>
  )
}

export default Vibrations
