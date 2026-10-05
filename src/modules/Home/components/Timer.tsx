import SlotCounter from "react-slot-counter"
import { useTranslation } from "react-i18next"

import { getHours, getMinutes, getSeconds } from "@/utils/date"

const Timer = ({ timeRemains }: { timeRemains: number }) => {
  const { t } = useTranslation()

  return (
    <span className="h-6 font-tt-hoves text-base font-semibold text-white">
      {t("Осталось")}{" "}
      {timeRemains === null ? (
        "00:00:00"
      ) : (
        <>
          <SlotCounter
            key="hours"
            value={getHours(timeRemains, false, true)}
            sequentialAnimationMode
            useMonospaceWidth
            direction="top-down"
            autoAnimationStart={false}
          />
          <span className="mx-0.5">:</span>
          <SlotCounter
            key="minutes"
            value={getMinutes(timeRemains)}
            sequentialAnimationMode
            useMonospaceWidth
            direction="top-down"
            autoAnimationStart={false}
          />
          <span className="mx-0.5">:</span>
          <SlotCounter
            key="seconds"
            value={getSeconds(timeRemains)}
            sequentialAnimationMode
            useMonospaceWidth
            direction="top-down"
            autoAnimationStart={false}
          />
        </>
      )}
    </span>
  )
}

export default Timer
