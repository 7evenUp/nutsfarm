import { useEffect, useState } from "react"
import SlotCounter from "react-slot-counter"
import { useTranslation } from "react-i18next"

import { getDays, getHours, getMinutes } from "@/utils/date"

import { SNAPSHOT_DATE } from "./constants"

const targetTime = new Date(SNAPSHOT_DATE).getTime()

const Countdown = () => {
  const { t } = useTranslation()

  const [timer, setTimer] = useState(
    Math.round((targetTime - Date.now()) / 1000),
  )

  useEffect(() => {
    if (Date.now() > targetTime) return

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  if (Date.now() > targetTime) {
    return (
      <div className="mx-auto my-5 flex h-[30px] items-center rounded-full bg-[#283649] px-3 text-sm font-bold uppercase text-[#5BC3FF]">
        <span className="translate-y-px">{t("СНИМОК $NUTS 20.09.2025")}</span>
      </div>
    )
  }

  return (
    <div className="mx-auto my-4 flex items-center px-3 py-1 font-tt-hoves text-xl font-bold">
      <SlotCounter
        key="days"
        value={getDays(timer, true)}
        sequentialAnimationMode
        useMonospaceWidth
        direction="top-down"
        autoAnimationStart={false}
      />
      {t("d")}
      <span className="mx-1" />
      <SlotCounter
        key="hours"
        value={getHours(timer, false, false)}
        sequentialAnimationMode
        useMonospaceWidth
        direction="top-down"
        autoAnimationStart={false}
      />
      {t("h")}
      <span className="mx-1" />
      <SlotCounter
        key="minutes"
        value={getMinutes(timer)}
        sequentialAnimationMode
        useMonospaceWidth
        direction="top-down"
        autoAnimationStart={false}
      />
      {t("m")}
      <span className="mx-1" />
    </div>
  )
}

export default Countdown
