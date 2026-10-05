import { useEffect, useMemo, useState } from "react"
import SlotCounter from "react-slot-counter"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { TConductorInstance } from "react-canvas-confetti/dist/types"
import Fireworks from "react-canvas-confetti/dist/presets/fireworks"

import FarmStartIcon from "@/assets/icons/farm_start.svg?react"
import ClockIcon from "@/assets/icons/clock.svg?react"
import GiftIcon from "@/assets/icons/farm_claim.svg?react"

import Timer from "./Timer"

import { LargeButton } from "@/shared/ui/LargeButton"

import {
  useClaimFarmingMutation,
  useGetFarmingStatusQuery,
  useStartFarmingMutation,
} from "@/redux/api/farming"

import { useHasFocus } from "@/hooks/useHasFocus"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

import { cn } from "@/lib/cn"

const EXTRA_SEC_FOR_FIX = 1

const FarmButtons = ({
  setIsClaimed,
  setIsStarted,
}: {
  setIsClaimed: React.Dispatch<React.SetStateAction<boolean>>
  setIsStarted: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const { t } = useTranslation()

  const [timer, setTimer] = useState(0)
  const [counterValue, setCounterValue] = useState<number | null>(null)
  const [isClaimLocked, setIsClaimLocked] = useState(false)
  const [isStartLocked, setIsStartLocked] = useState(false)

  const [conductor, setConductor] = useState<TConductorInstance>()
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Для ререндера таймера и нафармленного, когда страница снова попадает в фокус
  const hasFocus = useHasFocus()

  const { data, refetch, isFetching } = useGetFarmingStatusQuery()
  const [claimFarming, { isLoading: isClaimLoading }] =
    useClaimFarmingMutation()
  const [startFarming, { isLoading: isStartLoading }] =
    useStartFarmingMutation()

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPrefersReducedMotion(true)
    }
  }, [])

  // Всё время на фарм
  // При каждом ререндере содержит одно и то же значение
  const totalTimeToFarm = useMemo(() => {
    if (data && data.lastFarmingFinishAt && data.lastFarmingStartAt) {
      return (
        (new Date(data.lastFarmingFinishAt).getTime() -
          new Date(data.lastFarmingStartAt).getTime()) /
          1000 +
        EXTRA_SEC_FOR_FIX
      )
    }

    return null
  }, [data, hasFocus])

  useEffect(() => {
    if (!data) return
    if (!data.lastFarmingFinishAt) return
    if (totalTimeToFarm === null) return
    if (data.status !== "FARMING") return

    let intervalId: NodeJS.Timeout | null = null

    // Оставшееся время на фарм
    // При каждом ререндере является разных значений
    let remainedTimeToFarm = Math.round(
      (new Date(data.lastFarmingFinishAt).getTime() - Date.now()) / 1000,
    )

    // Если осталось фармить меньше 0, то фарм закончен
    if (remainedTimeToFarm <= 0) {
      setTimer(0)
      refetch()
      if (intervalId !== null) clearInterval(intervalId)
      return
    }

    // Если вдруг рассинхрон по времени, и оставшееся время высчитывается больше,
    // Чем нам посчитал бек, то просто делаем переменные одинаковыми
    if (remainedTimeToFarm > totalTimeToFarm) {
      remainedTimeToFarm = totalTimeToFarm
    }

    const pointsPerSecond = data.claimAmount / totalTimeToFarm

    setTimer(remainedTimeToFarm)
    setCounterValue(
      (totalTimeToFarm - remainedTimeToFarm + 0.01) * pointsPerSecond,
    )

    intervalId = setInterval(() => {
      setCounterValue((prev) => {
        if (!prev) return null

        if (prev + pointsPerSecond > data.claimAmount) return data.claimAmount
        else return prev + pointsPerSecond
      })

      if (remainedTimeToFarm - 1 <= 0) {
        setTimer(0)
        setTimeout(() => {
          refetch()
        }, 200)
      } else {
        setTimer(remainedTimeToFarm - 1)
      }
    }, 1000)

    if (counterValue && counterValue > data.claimAmount)
      clearInterval(intervalId)

    return () => clearInterval(intervalId)
  }, [data, timer, hasFocus])

  const onStartClick = async () => {
    if (isStartLoading || isFetching || isStartLocked) return

    makeHapticFeedback({ impactOccured: "rigid" })

    setIsStartLocked(true)

    try {
      await startFarming().unwrap()
      setCounterValue(0)
      setIsStarted(true)
    } catch (err) {
      toast.error(t("Ошибка"), {
        description: t("Не удалось начать фарм"),
      })
    } finally {
      setTimeout(() => setIsStartLocked(false), 1000)
    }
  }

  const onClaimClick = async () => {
    if (isClaimLoading || isFetching || isClaimLocked) return

    makeHapticFeedback({ impactOccured: "rigid" })

    setIsClaimLocked(true)

    try {
      await claimFarming().unwrap()
      // Запускаем фейерверк
      if (!prefersReducedMotion) {
        conductor?.run({ speed: 2, duration: 750 })
      }
      setCounterValue(null)
      setIsClaimed(true)
    } catch (err) {
      toast.error(t("Ошибка"), {
        description: t("Не удалось заклеймить"),
      })
    } finally {
      setTimeout(() => setIsClaimLocked(false), 1000)
    }
  }

  const onInit = ({ conductor }: { conductor: TConductorInstance }) => {
    setConductor(conductor)
  }

  if (!data)
    return (
      <div
        className={cn(
          "fixed z-[1] w-full max-w-[500px] px-4",
          Telegram.WebApp.platform === "weba"
            ? "bottom-[88px]"
            : "bottom-[calc(max(var(--tg-safe-area-inset-bottom,16px),16px)+72px)]",
        )}
      >
        <button
          disabled
          className="flex h-[50px] w-full items-center justify-center gap-3 rounded-xl bg-[#17202D] font-tt-hoves text-base font-semibold text-white/50"
        >
          {t("Технические работы")}
        </button>
      </div>
    )

  return (
    <div
      className={cn(
        "fixed z-[1] w-full max-w-[500px] px-4",
        Telegram.WebApp.platform === "weba"
          ? "bottom-[88px]"
          : "bottom-[calc(max(var(--tg-safe-area-inset-bottom,16px),16px)+72px)]",
      )}
    >
      <Fireworks onInit={onInit} />

      {/* Кнопка для старта фарма */}
      {data.status === "READY_TO_FARM" && (
        <LargeButton
          appearance="yellow-radial"
          onClick={onStartClick}
          contentClassName="pt-0.5"
        >
          {isStartLoading || isFetching || isStartLocked ? (
            <Loader />
          ) : (
            <>
              <FarmStartIcon />
              {t("Начать фармить")}
            </>
          )}
        </LargeButton>
      )}

      {data.status === "FARMING" &&
        (timer > 0 ? (
          // Рендерим таймер и нафармленный балик
          <div className="flex items-center gap-1">
            <div className="flex h-[50px] flex-1 items-center justify-center gap-2.5 rounded-xl border border-cyan bg-background">
              <ClockIcon className="h-[18px] w-[18px] text-cyan" />
              <Timer timeRemains={timer} />
            </div>
            {counterValue && (
              <div className="flex h-[50px] w-20 items-center justify-center rounded-xl bg-gradient-to-br from-cyan to-blue font-tt-hoves text-base font-semibold text-black phone-sm:w-32 phone-sm:text-xl">
                <SlotCounter
                  value={counterValue.toFixed(2).split(".")[0]}
                  sequentialAnimationMode
                  useMonospaceWidth
                  autoAnimationStart={false}
                />
                .
                <SlotCounter
                  value={counterValue.toFixed(2).split(".")[1]}
                  sequentialAnimationMode
                  useMonospaceWidth
                  autoAnimationStart={false}
                />
                <svg
                  width="16"
                  height="22"
                  viewBox="0 0 16 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-1 h-4 w-auto phone-sm:ml-1.5 phone-sm:h-[22px]"
                >
                  <path
                    d="M15.076 9.16602C14.7049 9.21582 14.3339 9.26563 14.0159 9.26563V9.66408C14.0159 11.3575 13.5919 13.0509 12.7968 14.4952C11.8958 16.1388 10.4117 17.3342 8.98057 18.4299C8.87456 18.4797 8.76855 18.5793 8.71555 18.6291V12.3287C8.50353 12.4283 8.23852 12.4532 8.0265 12.4532C7.81449 12.4532 7.50177 12.4532 7.28445 12.3287V18.5793C7.28445 18.5793 7.23145 18.5295 7.17845 18.5295L6.91343 18.3303C5.42933 17.1349 4.05124 16.0392 3.15018 14.3956C2.34982 12.9413 1.9258 11.233 1.9311 9.5296L1.61837 9.21582C1.40636 9.21582 1.18905 9.20088 0.977032 9.16602C0.818021 9.16602 0.659011 9.11621 0.5 9.06641V9.56446C0.5 11.5069 0.977032 13.3995 1.87809 15.0431C2.66784 16.4875 3.86572 17.643 5.14841 18.7088C5.69435 19.162 6.24028 19.675 6.88693 19.9988C7.24205 20.1731 7.63428 20.2926 8.0371 20.2827C8.44523 20.2777 8.84276 20.1432 9.20318 19.954C9.80742 19.6352 10.3375 19.182 10.8516 18.7536C12.0442 17.7625 13.2368 16.5921 14.0689 15.1427C15.023 13.4991 15.5 11.6065 15.5 9.66408V9.06641C15.5 9.06641 15.3092 9.12617 15.076 9.16602Z"
                    fill="#060E13"
                  />
                  <path
                    d="M1.13622 7.91414C1.49664 7.97391 1.91537 7.91414 2.27579 7.88426C3.04435 7.83446 3.8659 7.78465 4.53375 7.39118C4.62915 7.3364 4.72456 7.27663 4.83587 7.26667C4.97898 7.25173 5.15919 7.32146 5.15919 7.47087C5.17509 7.56052 5.20159 7.65017 5.22279 7.73982C5.3977 8.56162 5.75813 9.33859 6.30936 10.006C6.42067 10.1405 6.54788 10.27 6.68039 10.3895C6.8023 10.4991 6.92951 10.6037 7.05671 10.7033C7.18392 10.8029 7.32703 10.8876 7.46484 10.9722C7.58675 11.0469 7.71926 11.1117 7.86237 11.1316C8.00548 11.1515 8.16449 11.1316 8.3076 11.0818C8.55672 10.9971 8.78463 10.8477 8.99134 10.6933C9.27226 10.4841 9.52668 10.25 9.75459 9.99105C10.3376 9.32863 10.6981 8.53174 10.8783 7.69998C10.8942 7.62029 10.8942 7.49578 10.9313 7.42107C10.979 7.33142 11.0691 7.24675 11.1645 7.22682C11.2334 7.22682 11.297 7.2318 11.3553 7.27165C11.8853 7.62029 12.7864 8.16815 14.9065 7.81951C15.3306 7.76971 15.5956 7.27165 15.3306 6.92301C14.0585 4.98058 11.7263 3.83505 8.70512 3.73544V1.99223C8.70512 1.59379 9.07615 1.24515 9.50018 1.24515H10.4012C10.7723 1.24515 11.0373 0.996116 11.0373 0.647476C11.0373 0.458214 10.9578 0.303815 10.8253 0.199223C10.714 0.0796893 10.5496 0 10.3482 0H9.44717C8.3341 0 7.38004 0.896505 7.38004 1.94243V3.73544C4.30583 3.88485 1.97367 5.03039 0.701589 7.02262C0.505476 7.32644 0.659186 7.72986 0.987808 7.8743C1.03021 7.89422 1.07791 7.90418 1.12562 7.91414H1.13622Z"
                    fill="#060E13"
                  />
                </svg>
              </div>
            )}
          </div>
        ) : (
          // Рендерим заглушку пока выполняется refetch для статуса фарма
          <div className="flex items-center gap-1">
            <div className="flex h-[50px] flex-1 items-center justify-center gap-2.5 rounded-xl border border-cyan bg-background">
              <ClockIcon className="h-[18px] w-[18px] text-cyan" />
              <span className="h-6 font-tt-hoves text-base font-semibold text-white">
                {t("Осталось")} 00<span className="mx-0.5">:</span>00
                <span className="mx-0.5">:</span>00
              </span>
            </div>
            {counterValue && (
              <div className="flex h-[50px] w-20 items-center justify-center rounded-xl bg-gradient-to-br from-cyan to-blue font-tt-hoves text-base font-semibold text-black phone-sm:w-32 phone-sm:text-xl">
                <SlotCounter
                  value={counterValue.toFixed(2).split(".")[0]}
                  sequentialAnimationMode
                  useMonospaceWidth
                  autoAnimationStart={false}
                />
                .
                <SlotCounter
                  value={counterValue.toFixed(2).split(".")[1]}
                  sequentialAnimationMode
                  useMonospaceWidth
                  autoAnimationStart={false}
                />
              </div>
            )}
          </div>
        ))}

      {/* Кнопка для клейма */}
      {data.status === "READY_TO_CLAIM" && (
        <LargeButton
          appearance="blue-radial"
          onClick={onClaimClick}
          contentClassName="pt-0.5"
        >
          {isClaimLocked || isFetching || isClaimLoading ? (
            <Loader />
          ) : (
            <>
              <GiftIcon />
              {t("Собрать")} + {Math.ceil(data.claimAmount)} {t("очков")}
            </>
          )}
        </LargeButton>
      )}
    </div>
  )
}

export default FarmButtons

const Loader = () => (
  <div className="flex items-center gap-1.5">
    <div className="h-2 w-2 animate-bounce rounded-full bg-background" />
    <div className="h-2 w-2 animate-bounce rounded-full bg-background delay-75" />
    <div className="h-2 w-2 animate-bounce rounded-full bg-background delay-150" />
    <div className="h-2 w-2 animate-bounce rounded-full bg-background [animation-delay:225ms;]" />
    <div className="h-2 w-2 animate-bounce rounded-full bg-background delay-300" />
  </div>
)
