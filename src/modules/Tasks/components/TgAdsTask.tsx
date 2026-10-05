import { useEffect, useRef, useState } from "react"
import { JSX } from "react/jsx-runtime"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

import Coin from "@/assets/icons/coin.svg?react"
import Loader from "@/assets/icons/loader.svg?react"
import CoinPng from "@/assets/images/coin.png"

import { Button } from "@/shared/ui/Button"

import { useClaimTaskMutation } from "@/redux/api/task"

import { numberWithSpaces } from "@/utils/numberWithSpaces"
import { getHours, getMinutes } from "@/utils/date"

import { TaskType } from "@/types/task"

import styles from "./tgAds.module.css"

interface TaskProps {
  debug: boolean
  blockId: string
}

export const TgAdsTask = ({
  debug,
  blockId,
  reward,
  nutPassXp,
  // lang,
  id: taskId,
  type,
  executionIntervalHours,
  lastExecutionDateTime,
}: TaskProps & {
  lang: "RU" | "EN"
  type: TaskType
  id: string
  reward: number
  nutPassXp: number | null
  executionIntervalHours: number | null
  lastExecutionDateTime: string | null
}) => {
  const { t } = useTranslation()

  const taskRef = useRef<JSX.IntrinsicElements["adsgram-task"]>(null)

  const [isClaimLocked, setIsClaimLocked] = useState(false)

  const [claimTask] = useClaimTaskMutation()

  const makeToast = (points: number) => {
    toast(
      <div className="flex flex-wrap items-center font-bold">
        <img src={CoinPng} alt="Nuts coin icon" className="mr-2.5 h-10 w-10" />
        <span className="text-[#FED900]">+{numberWithSpaces(points)} NUTS</span>
      </div>,
      {
        className: "justify-center",
      },
    )
  }

  useEffect(() => {
    const handler = async () => {
      const payload = {
        userTaskId: taskId,
        type,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }

      setIsClaimLocked(true)

      setTimeout(async () => {
        const task = await claimTask(payload).unwrap()

        if (task.status === "CLAIMED") {
          setTimeout(() => {
            makeToast(task.task.reward)
          }, 500)
        }

        setIsClaimLocked(false)
      }, 2500)
    }

    const onErrorHandler = (event: CustomEvent) => {
      toast.error(t("Ошибка"), {
        description: `Error during loading or render for block ${event.detail}`,
      })
    }
    const onBannerNotFoundHandler = () => {
      toast.error(t("Ошибка"), {
        description: t("Не удалось загрузить баннер"),
      })
    }
    const onTooLongSessionHandler = () => {
      toast.error(t("Ошибка"), {
        description:
          "The session is too long. Please restart the app to get ads",
      })
    }

    const task = taskRef.current

    if (task) {
      task.addEventListener("reward", handler)
      task.addEventListener("onError", onErrorHandler)
      task.addEventListener("onBannerNotFound", onBannerNotFoundHandler)
      task.addEventListener("onTooLongSession", onTooLongSessionHandler)
    }

    return () => {
      if (task) {
        task.removeEventListener("reward", handler)
        task.removeEventListener("onError", onErrorHandler)
        task.removeEventListener("onBannerNotFound", onBannerNotFoundHandler)
        task.removeEventListener("onTooLongSession", onTooLongSessionHandler)
      }
    }
  }, [])

  if (!customElements.get("adsgram-task")) {
    return null
  }

  if (executionIntervalHours === null) return null

  const intervalMillis = executionIntervalHours * 60 * 60 * 1000
  const isDisabled = lastExecutionDateTime
    ? +new Date(lastExecutionDateTime) + intervalMillis > new Date().getTime()
    : false

  if (isDisabled && lastExecutionDateTime) {
    const nextClaim = +new Date(lastExecutionDateTime) + intervalMillis
    const timeToNextClaim = (nextClaim - new Date().getTime()) / 1000

    return (
      <div className="flex h-[76px] flex-col items-center justify-center gap-1 rounded-2xl bg-[#0F1824]">
        <span className="text-sm text-white/75">
          {t("Повторный просмотр через")}
        </span>
        <span>{`${getHours(timeToNextClaim)}${t("h")} ${getMinutes(timeToNextClaim)}${t("m")}`}</span>
      </div>
    )
  }

  return (
    <adsgram-task
      className={styles.task}
      data-block-id={blockId}
      data-debug={debug}
      ref={taskRef}
    >
      <span slot="reward" className="flex flex-wrap gap-1">
        <div className="flex h-[22px] min-w-max items-center gap-1 rounded-full bg-[#1C2430] pl-1 pr-1.5">
          <Coin className="h-3 w-3 shrink-0" />
          <span className="text-left text-xs/none font-bold text-[#FEED1E]">
            {numberWithSpaces(reward)}
          </span>
        </div>
        {nutPassXp !== null && nutPassXp > 0 && (
          <div className="flex h-[22px] min-w-max items-center justify-center gap-1 rounded-full bg-[#1C2430] px-1.5 text-xs/none font-bold text-[#F68DF1]">
            {numberWithSpaces(nutPassXp)} XP
          </div>
        )}
      </span>
      <div slot="button" className="ml-auto">
        <Button appearance="yellow-linear" className="text-nowrap">
          {isClaimLocked ? (
            <Loader className="h-3.5 w-3.5 animate-spin" />
          ) : (
            "Check"
          )}
        </Button>
      </div>
      <div slot="claim" className="ml-auto">
        <Button appearance="yellow-linear" className="text-nowrap">
          {isClaimLocked ? (
            <Loader className="h-3.5 w-3.5 animate-spin" />
          ) : (
            "Claim"
          )}
        </Button>
      </div>
      <div slot="done" className="ml-auto">
        <Button appearance="yellow-linear" className="text-nowrap" disabled>
          {isClaimLocked ? (
            <Loader className="h-3.5 w-3.5 animate-spin" />
          ) : (
            "Done"
          )}
        </Button>
      </div>
    </adsgram-task>
  )
}
