import { useEffect } from "react"
import * as Select from "@radix-ui/react-select"
import { useTranslation } from "react-i18next"

import LanguageIcon from "@/assets/icons/language.svg?react"
import ChevronDown from "@/assets/icons/chevron-down.svg?react"

import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { useChangeLanguageMutation } from "@/redux/api/user"
import { setLanguage } from "@/redux/slices/language"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"
import { sendMetrika } from "@/utils/sendMetrika"

const Language = () => {
  const { i18n } = useTranslation()

  const dispatch = useAppDispatch()
  const lang = useAppSelector((state) => state.language.value)

  const [mutate] = useChangeLanguageMutation()

  useEffect(() => {
    if (lang === "RU") {
      dispatch(setLanguage("RU"))
      i18n.changeLanguage("ru")
    } else {
      dispatch(setLanguage("EN"))
      i18n.changeLanguage("en")
    }
  }, [lang])

  return (
    <Select.Root
      value={lang}
      onValueChange={(val) => {
        makeHapticFeedback({ notificationOccured: "success" })

        sendMetrika("profile_language_changed")

        dispatch(setLanguage(val as "RU" | "EN"))
        i18n.changeLanguage(val.toLowerCase())

        mutate({ lang: val as "RU" | "EN" })
      }}
    >
      <Select.Trigger
        className="flex h-12 w-full items-center justify-between rounded-xl bg-[#17202D] px-4 text-sm font-medium text-white/75 hover:bg-[#202b3a]"
        onClick={() => {
          makeHapticFeedback({ impactOccured: "soft" })
        }}
      >
        <LanguageIcon />
        <span className="ml-4 mr-auto text-sm font-medium">Language</span>
        <div className="flex items-center gap-2 text-sm font-medium text-[#FFFFFFBF]">
          <Select.Value />
          <ChevronDown className="h-4 w-4" />
        </div>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          align="end"
          side="bottom"
          position="popper"
          sideOffset={4}
          className="z-50 w-max overflow-hidden rounded-xl bg-[#17202D] p-1 text-white/75 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
        >
          <Select.Viewport>
            <Select.Item
              value="RU"
              className="group relative flex w-full cursor-pointer select-none items-center gap-2 rounded-lg px-4 py-2 pr-3 text-sm outline-none data-[state=checked]:text-white data-[state=unchecked]:text-white/50"
            >
              <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full border font-medium group-data-[state=checked]:border-white group-data-[state=unchecked]:border-white/50">
                <Select.ItemIndicator>
                  <div className="h-2 w-2 rounded-full bg-white" />
                </Select.ItemIndicator>
              </span>
              <Select.ItemText className="text-left">Русский</Select.ItemText>
            </Select.Item>

            <Select.Item
              value="EN"
              className="group relative flex w-full cursor-pointer select-none items-center gap-2 rounded-lg px-4 py-2 pr-3 text-sm outline-none data-[state=checked]:text-white data-[state=unchecked]:text-white/50"
            >
              <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full border font-medium group-data-[state=checked]:border-white group-data-[state=unchecked]:border-white/50">
                <Select.ItemIndicator>
                  <div className="h-2 w-2 rounded-full bg-white" />
                </Select.ItemIndicator>
              </span>
              <Select.ItemText className="text-left">English</Select.ItemText>
            </Select.Item>
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}

export default Language
