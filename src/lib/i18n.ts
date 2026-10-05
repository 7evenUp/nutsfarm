import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import enTranslate from "@/assets/locales/en/translation.json"
import ruTranslate from "@/assets/locales/ru/translation.json"

export const defaultNS = "translation"
export const resources = {
  en: {
    translation: { ...enTranslate },
  },
  ru: {
    translation: { ...ruTranslate },
  },
} as const

i18n.use(initReactI18next).init({
  lng: "ru",
  resources,
  ns: ["translation"],
  fallbackLng: "ru",
})

export default i18n
