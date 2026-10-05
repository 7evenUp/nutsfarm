import React, { useMemo, useState } from "react"
import { Description } from "@radix-ui/react-dialog"
import { useTranslation } from "react-i18next"

import DurationLogo from "@/assets/boosters/duration-logo.png"
import PerSecondLogo from "@/assets/boosters/per-second-logo.png"
import XpLogo from "@/assets/boosters/xp-logo.png"
import ClockIcon from "@/assets/icons/clock.svg?react"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/shared/ui/SideSheet"

import { BoosterBonusType, BoosterDurationType } from "@/types/item"

import { getHours, getMinutes } from "@/utils/date"

const BoosterInfoModal = ({
  title,
  description,
  bonusType,
  startedAt,
  duration,
  durationType,
  farmingCyclesNow,
  children,
}: {
  title: string
  description: string
  bonusType: BoosterBonusType
  startedAt: string
  duration: number
  durationType: BoosterDurationType
  farmingCyclesNow?: number
  children: React.ReactNode
}) => {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)

  const timeRemains = useMemo(() => {
    if (durationType === "FARM_CYCLE") return null
    if (!open) return null

    const startedTime = new Date(startedAt).getTime()
    const passedTime = Date.now() - startedTime
    const timeRemains = Math.floor((duration * 1000 - passedTime) / 1000)

    if (timeRemains < 0) return null

    const hours = getHours(timeRemains)
    const minutes = getMinutes(timeRemains)

    return `${hours}${t("h")} ${minutes}${t("m")}`
  }, [duration, open, durationType, startedAt])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="items-center gap-0 pb-12">
        <Description className="sr-only">Active Farming Info Modal</Description>
        <SheetHeader />

        <div className="mb-7 flex size-[154px] items-center justify-center rounded-[18px] bg-gradient-to-b from-[#0A1218] to-[#17202D]">
          <img
            className="size-[92px]"
            src={
              bonusType === "FARMING_DURATION"
                ? DurationLogo
                : bonusType === "POINTS_PER_SECOND"
                  ? PerSecondLogo
                  : XpLogo
            }
            alt={title}
          />
        </div>

        <h2 className="text-balance text-center font-tt-hoves-expanded text-xl font-semibold text-white">
          {title}
        </h2>

        <p className="mb-10 mt-3 text-balance text-center text-sm font-medium text-white/75">
          {description}
        </p>

        {durationType === "SECONDS" && timeRemains !== null ? (
          <p className="flex items-center gap-1 text-xs font-semibold text-white">
            <ClockIcon className="size-3" />
            {t("Осталось времени")}: {timeRemains}
          </p>
        ) : (
          farmingCyclesNow !== undefined && (
            <p className="text-xs font-semibold text-white">
              {t("Осталось циклов фарма:")} {duration - farmingCyclesNow}
            </p>
          )
        )}
      </SheetContent>
    </Sheet>
  )
}

export default BoosterInfoModal
