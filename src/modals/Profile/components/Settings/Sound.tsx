import { useState } from "react"
import { useTranslation } from "react-i18next"
import * as Switch from "@radix-ui/react-switch"

import {
  isSoundEnabled,
  persistSoundEnabled,
} from "@/utils/makeSoundFeedback"

const Sound = () => {
  const { t } = useTranslation()

  const [soundEnabled, setSoundEnabled] = useState(isSoundEnabled())

  const onToggleSound = async () => {
    const next = !soundEnabled
    setSoundEnabled(next)
    await persistSoundEnabled(next)
  }

  return (
    <label className="flex h-12 w-full cursor-pointer items-center justify-between rounded-xl bg-[#17202D] px-4 text-sm font-medium text-white/75 hover:bg-[#202b3a]">
      <span className="text-sm font-medium text-white/75">
        {t("Разрешить звуки")}
      </span>
      <Switch.Root
        checked={soundEnabled}
        onCheckedChange={onToggleSound}
        className="relative h-[22px] w-11 rounded-full bg-[#050d12]"
      >
        <Switch.Thumb className="block h-[18px] w-[18px] translate-x-0.5 transform rounded-full bg-white/50 transition-all data-[state=checked]:translate-x-[calc(44px-18px-2px)] data-[state=checked]:bg-white" />
      </Switch.Root>
    </label>
  )
}

export default Sound 