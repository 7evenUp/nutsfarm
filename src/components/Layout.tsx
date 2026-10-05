import { useEffect, useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { Toaster } from "sonner"
import Lottie from "lottie-react"

import ToastErrorIcon from "@/assets/icons/toast-error.svg?react"

import AnimationV1 from "@/assets/animations/nutcracker_1.json"
import AnimationV2 from "@/assets/animations/nutcracker_2.json"
import AnimationV3 from "@/assets/animations/nutcracker_3.json"
import AnimationV4 from "@/assets/animations/nutcracker_4.json"
import AnimationV5 from "@/assets/animations/nutcracker_5.json"

import Header from "@/modules/Header"
import Navigation from "@/modules/Navigation"

import DailyStreakDialog from "@/modals/DailyStreak"
import Frozen1Day from "@/modals/DailyStreak/Frozen1Day"
import Frozen2Days from "@/modals/DailyStreak/Frozen2Days"
import Onboarding from "@/modals/Onboarding"

import { useAppDispatch } from "@/redux/hooks"
import { setTelegramPerformanceClass } from "@/redux/slices/performance"
import { useGetCurrentStreakQuery } from "@/redux/api/streak"
import {
  useGetCurrentUserQuery,
  useSendUtmDataMutation,
} from "@/redux/api/user"

import { getUtmData } from "@/utils/getUtmData"
import { getTelegramPerformanceClass } from "@/utils/perforamnce"
import { initVibration } from "@/utils/makeHapticFeedback"
import { initSound } from "@/utils/makeSoundFeedback"

import { cn } from "@/lib/cn"

const OPEN_ONBOARDING_DELAY = 1500

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

const Layout = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { pathname } = useLocation()

  const [open, setOpen] = useState(false)

  const { data: currentUser } = useGetCurrentUserQuery()
  const { data: streak } = useGetCurrentStreakQuery({
    timezone,
  })
  const [sendUtm, { isLoading }] = useSendUtmDataMutation()

  //detection on performance class for android devices
  useEffect(() => {
    const performanceClass = getTelegramPerformanceClass(navigator.userAgent)
    dispatch(setTelegramPerformanceClass(performanceClass))
  }, [])

  useEffect(() => {
    if (isLoading) return

    const utmData = getUtmData()
    if (utmData) {
      sendUtm(utmData)
    }
  }, [])

  // Парсим start параметры
  // Если есть параметр вида `to_{destination}`
  // То меняем pathname на {destination}
  useEffect(() => {
    const { start_param } = Telegram.WebApp.initDataUnsafe
    if (!start_param) return
    const toPageParam = start_param
      .split("-")
      .find((param) => param.startsWith("to_"))
    if (!toPageParam) return
    const pathToRedirect = toPageParam.split("_")[1]
    navigate(pathToRedirect)
  }, [])

  useEffect(() => {
    const parseIfFirstVisit = async () => {
      let storageValue: string | null

      if (!Telegram.WebApp.initData) {
        storageValue = localStorage.getItem("first-visit")
      } else {
        // @ts-expect-error Not-in-telegram-environment
        storageValue = await cloudStorage.get("first-visit")
      }

      if (!storageValue) {
        if (!Telegram.WebApp.initData) {
          localStorage.setItem("first-visit", "false")
        } else {
          // @ts-expect-error Not-in-telegram-environment
          await cloudStorage.set("first-visit", "false")
        }
      } else {
        if (storageValue === "false") {
          if (!Telegram.WebApp.initData) {
            localStorage.setItem("first-visit", "true")
          } else {
            // @ts-expect-error Not-in-telegram-environment
            await cloudStorage.set("first-visit", "true")
          }
        }
      }
    }

    parseIfFirstVisit()
  }, [])

  useEffect(() => {
    initVibration()
    initSound()
  }, [])

  useEffect(() => {
    if (!currentUser) return

    if (!currentUser.isCryptonOnboardingPassed) {
      navigate("earn")
    }

    if (!currentUser.isStartBonusClaimed) {
      setTimeout(() => setOpen(true), OPEN_ONBOARDING_DELAY)
    }
  }, [currentUser])

  useEffect(() => {
    if (pathname === "/") {
      document.body.classList.add("overflow-hidden")
    } else {
      document.body.classList.remove("overflow-hidden")
    }
  }, [pathname])

  return (
    <>
      <div
        className={cn(
          "relative mx-auto flex max-w-[500px] flex-col bg-background font-nunito font-normal text-white",
          !pathname.includes("pass") && "overflow-hidden",
          pathname.includes("puzzles") && "mx-0 max-w-none",
          pathname.includes("cryptle") && "mx-0 max-w-none",
          pathname.includes("flip-cards") && "mx-0 max-w-none",
        )}
      >
        <Header />
        <Outlet />
        <Navigation />
      </div>

      <Onboarding open={open} setOpen={setOpen} />

      {streak &&
      !streak.streakRewardReceivedToday &&
      currentUser &&
      currentUser.isStartBonusClaimed ? (
        streak.daysMissed === 0 ? (
          <DailyStreakDialog />
        ) : streak.daysMissed === 1 ? (
          <Frozen1Day />
        ) : (
          streak.daysMissed === 2 && <Frozen2Days />
        )
      ) : null}

      <Toaster
        position="top-center"
        visibleToasts={1}
        toastOptions={{
          className:
            "font-nunito font-bold text-base bg-[#374962]/50 text-white pl-5 pr-4 rounded-[18px] border-none shadow-sm shadow-black/70 backdrop-blur-3xl",
        }}
        icons={{
          error: <ToastErrorIcon />,
        }}
        duration={3000}
      />

      <div className="sr-only">
        <Lottie
          animationData={AnimationV1}
          loop={false}
          autoPlay={false}
          className="sr-only"
        />
        <Lottie
          animationData={AnimationV2}
          loop={false}
          autoPlay={false}
          className="sr-only"
        />
        <Lottie
          animationData={AnimationV3}
          loop={false}
          autoPlay={false}
          className="sr-only"
        />
        <Lottie
          animationData={AnimationV4}
          loop={false}
          autoPlay={false}
          className="sr-only"
        />
        <Lottie
          animationData={AnimationV5}
          loop={false}
          autoPlay={false}
          className="sr-only"
        />
      </div>
    </>
  )
}

export default Layout
