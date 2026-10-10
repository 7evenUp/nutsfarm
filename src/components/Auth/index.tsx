import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { initCloudStorage } from "@/demo/telegram-sdk"
import { useTranslation } from "react-i18next"

// @ts-expect-error Not-in-telegram-environment
let cloudStorage

if (true) {
  try {
    cloudStorage = initCloudStorage()
  } catch {
    /* empty */
  }
}

// import NoRefCode from "@/assets/images/no-ref-code-page.png"
// import NoRefCodeEn from "@/assets/images/no-ref-code-page_en.png"

import NutIcon from "@/assets/icons/nut-icon-square.png"
import AuthStep1Icon from "@/assets/icons/auth-step-1.svg?react"
import AuthStep2Icon from "@/assets/icons/auth-step-2.svg?react"
import AuthStep3Icon from "@/assets/icons/auth-step-3.svg?react"
import AuthRegisterIcon from "@/assets/icons/auth-register.svg?react"

import Restricted from "../Restricted"

import LoadingScreen from "@/modules/LoadingScreen"

import { useLoginMutation, useRegisterMutation } from "@/redux/api/auth"
import { useAppSelector } from "@/redux/hooks"

import { LargeButton } from "@/shared/ui/LargeButton"
import { TextEffect } from "@/shared/ui/TextEffect"

import styles from "./styles.module.css"

import { cn } from "@/lib/cn"

const Auth = ({
  setState,
  refetchUser,
}: {
  setState: React.Dispatch<React.SetStateAction<boolean>>
  refetchUser: VoidFunction
}) => {
  const { t } = useTranslation()

  const [step, setStep] = useState(1)
  const [is429LoginError, setIs429LoginError] = useState(false)

  const [login, { isLoading: isLoginLoading, isError: isLoginError }] =
    useLoginMutation()
  const [register, { isLoading: isRegisterLoading, isError: isRegisterError }] =
    useRegisterMutation()

  const language = useAppSelector((state) => state.language.value)

  // Анимация заполнения шагов регистрации
  useEffect(() => {
    if (isLoginError) {
      setTimeout(() => {
        setStep(2)

        setTimeout(() => {
          setStep(3)
        }, 1700)
      }, 1300)
    }
  }, [isLoginError])

  // Берём рефку из startapp параметра
  useEffect(() => {
    const { start_param } = Telegram.WebApp.initDataUnsafe

    let ref = ""

    if (start_param) {
      const refParam = start_param
        .split("-")
        .find((param) => param.startsWith("ref_"))

      if (refParam) {
        ref = refParam.slice(4)
      }
    }

    const authenticate = async () => {
      if (!Telegram.WebApp.initData) return

      try {
        const tokens = await login(Telegram.WebApp.initData).unwrap()

        // @ts-expect-error Not-in-telegram-environment
        await cloudStorage.set("accessToken", tokens.accessToken)
        // @ts-expect-error Not-in-telegram-environment
        await cloudStorage.set("refreshToken", tokens.refreshToken)

        refetchUser()
        setState(true)
        return
      } catch (e) {
        // @ts-expect-error No RTKQ error types
        if (e.status === 429) {
          setIs429LoginError(true)
          return
        }
      }

      try {
        const tokens = await register({
          authData: Telegram.WebApp.initData,
          language,
          referralCode: ref ? ref : import.meta.env.VITE_DEFAULT_REF_CODE,
        }).unwrap()

        // @ts-expect-error Not-in-telegram-environment
        await cloudStorage.set("accessToken", tokens.accessToken)
        // @ts-expect-error Not-in-telegram-environment
        await cloudStorage.set("refreshToken", tokens.refreshToken)
      } catch (e) {
        console.error(e)
      }
    }

    authenticate()
  }, [])

  const onRegisterClick = async () => {
    if (step !== 3 || isRegisterLoading) return

    refetchUser()
    setState(true)
  }

  const redirectToChannel = () => {
    Telegram.WebApp.openTelegramLink("https://t.me/nutsfarm")
  }

  if (isLoginLoading || isRegisterLoading) return <LoadingScreen />

  if (is429LoginError) return <Restricted />

  if (isRegisterError) {
    return (
      <div className="relative flex h-screen w-screen flex-col items-center justify-between bg-background p-4 pb-8 text-xl text-white">
        <div className="flex items-center gap-2.5 self-start">
          <img src={NutIcon} className="h-7 w-7" alt="Nut coin icon" />
          <span className="font-tt-hoves text-base font-semibold text-white">
            Nuts Farm
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-center font-tt-hoves text-lg font-semibold text-white">
            {t(
              "Не удалось создать аккаунт. Пожалуйста, попробуйте перезагрузить мини-приложение",
            )}
          </span>
        </div>
        <button
          onClick={redirectToChannel}
          className="flex h-14 w-full items-center justify-center gap-4 rounded-[14px] bg-[#17202D] font-tt-hoves text-base font-semibold text-white transition-colors active:bg-[#202936]"
        >
          {t("Официальный телеграм канал")}
        </button>
      </div>
    )
  }

  if (isLoginError)
    return (
      <div
        className={cn(
          "flex h-screen w-screen flex-col items-center justify-between bg-background p-4 text-xl text-white",
          Telegram.WebApp.platform === "weba"
            ? "pb-4"
            : "pb-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
        )}
      >
        <div className="flex items-center gap-2.5 self-start">
          <img src={NutIcon} className="h-7 w-7" alt="Nut coin icon" />
          <span className="font-tt-hoves text-base font-semibold text-white">
            Nuts Farm
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-center font-tt-hoves text-[28px] font-semibold text-white">
            {t("Подготавливаем ваш аккаунт")}
          </span>
          {step === 1 && (
            <TextEffect
              per="word"
              as="span"
              preset="slide"
              className="mt-12 text-center text-base font-semibold text-white/50"
            >
              {t("Собираем орехи...")}
            </TextEffect>
          )}
          {step === 2 && (
            <TextEffect
              per="word"
              as="span"
              preset="slide"
              className="mt-12 text-center text-base font-semibold text-white/50"
            >
              {t("Чистим зубы Щелкунчикам...")}
            </TextEffect>
          )}
          {step === 3 && (
            <TextEffect
              per="word"
              as="span"
              preset="slide"
              className="mt-12 text-center text-base font-semibold text-white/50"
            >
              {t("Готово!")}
            </TextEffect>
          )}
          <div className="relative mt-5 flex h-16 w-full items-center justify-between">
            <div className="absolute left-4 top-1/2 h-4 w-[calc(100%-32px)] -translate-y-1/2 rounded-lg bg-[#172039]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 4 }}
                className={cn("h-4 rounded-lg", styles.gradient_1)}
              />
            </div>

            <div className="flex h-16 w-16 items-center justify-center">
              <div
                className={cn(
                  "relative flex items-center justify-center rounded-full transition-all duration-300",
                  styles.gradient_1,
                  step === 1 ? "h-16 w-16" : "h-12 w-12",
                )}
              >
                <AuthStep1Icon
                  className={cn(
                    "transition-all duration-300",
                    step === 1 ? "h-8 w-8" : "h-6 w-6",
                  )}
                />
              </div>
            </div>
            <div className="flex h-16 w-16 items-center justify-center">
              <div
                className={cn(
                  "relative flex items-center justify-center rounded-full transition-all duration-300",
                  step === 2 || step === 3 ? styles.gradient_2 : "bg-[#172039]",
                  step === 1 && "h-8 w-8",
                  step === 2 && "h-16 w-16",
                  step === 3 && "h-12 w-12",
                )}
              >
                <AuthStep2Icon
                  className={cn(
                    "transition-all duration-300",
                    step === 1 && "h-0 w-0",
                    step === 2 && "h-8 w-8",
                    step === 3 && "h-6 w-6",
                  )}
                />
              </div>
            </div>
            <div className="flex h-16 w-16 items-center justify-center">
              <div
                className={cn(
                  "relative flex items-center justify-center rounded-full transition-all duration-300",
                  step === 3 ? styles.gradient_3 : "bg-[#172039]",
                  step === 3 ? "h-16 w-16" : "h-8 w-8",
                )}
              >
                <AuthStep3Icon
                  className={cn(
                    "transition-all duration-300",
                    step === 3 ? "h-8 w-8" : "h-0 w-0",
                  )}
                />
              </div>
            </div>
          </div>
        </div>
        <LargeButton
          appearance="blue-radial"
          onClick={onRegisterClick}
          disabled={step !== 3 || isRegisterLoading}
        >
          <AuthRegisterIcon />
          {t("Щёлкай скорее")}
        </LargeButton>
      </div>
    )
}

export default Auth
