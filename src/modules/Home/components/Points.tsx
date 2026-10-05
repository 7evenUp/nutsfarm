import { Fragment, useMemo } from "react"
import SlotCounter from "react-slot-counter"

import CoinPng from "@/assets/images/coin.png"
import FireImage from "@/assets/images/fire.png"
import NutIcon from "@/assets/icons/nut.svg?react"
import HourglassIcon from "@/assets/icons/hourglass.svg?react"

import { useGetCurrentUserQuery } from "@/redux/api/user"
import { useGetFarmingStatusQuery } from "@/redux/api/farming"

import { numberWithSpaces } from "@/utils/numberWithSpaces"
import { cn } from "@/lib/cn"
import { useTranslation } from "react-i18next"

const Points = () => {
  const { data: currentUser } = useGetCurrentUserQuery()
  const { data: farmingStatus } = useGetFarmingStatusQuery()
  const { t } = useTranslation()

  // Вычисляем бонус в часах: (разница в часах между finish и start) - 8.
  // Если бонус отрицательный или равен нулю, то его не показываем.
  const bonusHours =
    farmingStatus?.lastFarmingFinishAt && farmingStatus?.lastFarmingStartAt
      ? Math.round(
          Math.max(
            0,
            (new Date(farmingStatus.lastFarmingFinishAt).getTime() -
              new Date(farmingStatus.lastFarmingStartAt).getTime()) /
              (1000 * 60 * 60) -
              8,
          ),
        ) || null
      : null

  // Для оптимизации анимации для либы react-slot-counter
  // У либы есть проблема с анимированием строковых значений с разделителем:
  // 1,234.00 -> после анимации может превратиться в -> 1,,348.00
  // Когда числа около ляма - там ваще жесть
  // Идея: разбить число на массив по разделителю, и отдельно анимировать каждый из разрядов
  const balanceArray = useMemo(() => {
    if (currentUser) {
      const balance =
        currentUser.balance +
        (currentUser.balance * currentUser.balanceBonusPercentage) / 100
      const formatedBalance = numberWithSpaces(balance)
      const splitedBalance = formatedBalance.split(/[.,]/)
      return splitedBalance
    }
    return []
  }, [currentUser])

  if (!currentUser) return null

  return (
    <>
      <div
        className={cn(
          "relative z-50 flex items-center justify-center gap-3",
          Telegram.WebApp.platform === "tdesktop" ||
            Telegram.WebApp.platform === "macos"
            ? "mt-1"
            : "mt-2 phone-sm:mt-6",
        )}
      >
        <img
          src={CoinPng}
          alt="Nuts coin icon"
          className="h-9 w-9 shrink-0 phone-sm-fix:h-10 phone-sm-fix:w-10"
        />
        {balanceArray.length > 0 && (
          <div className="flex -translate-y-0.5 items-center font-tt-hoves-expanded text-[28px] font-bold tracking-tight phone-sm-fix:h-14 phone-sm-fix:text-[32px]">
            {balanceArray.map((num, i) => (
              <Fragment key={i}>
                <SlotCounter
                  charClassName="drop-shadow-[0_0_1px_rgba(0,0,0,0.8)]"
                  autoAnimationStart={false}
                  value={num}
                />
                {i === balanceArray.length - 2 ? (
                  balanceArray[balanceArray.length - 1].length > 2 ? (
                    <span className="mx-px">,</span>
                  ) : (
                    <span className="mx-px">.</span>
                  )
                ) : i === balanceArray.length - 1 ? null : (
                  <span className="mx-px">,</span>
                )}
              </Fragment>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center justify-center gap-2">
        {currentUser.balanceBonusPercentage && (
          <div className="relative z-50 flex items-center justify-center">
            <div className="relative z-50 flex h-6 w-fit items-center justify-center gap-1 rounded-full bg-[#BA34C6] pl-1.5 pr-[3px] text-xs font-bold text-white">
              <span>+{currentUser.balanceBonusPercentage}%</span>
              <div className="flex h-[18px] items-center justify-center gap-1 rounded-full bg-[#050D12]/20 px-1">
                <img src={FireImage} className="h-3.5 w-3.5" alt="Fire icon" />
                <span>{currentUser.balanceBonusPercentageLvl || 1} LVL</span>
              </div>
            </div>
          </div>
        )}
        {bonusHours != null && bonusHours > 0 && (
          <div className="relative z-50 flex h-6 w-fit items-center justify-center gap-0.5 rounded-full bg-gradient-to-r from-[#99F696] to-[#7FDA57] px-2 py-1 text-xs font-bold text-white">
            <HourglassIcon className="text-[#050D12]" />
            <span className="text-xs font-bold leading-[16px] text-[#050D12]">
              +{bonusHours} {t("h")}
            </span>
          </div>
        )}
        {farmingStatus?.nutcrackerBonusInHour != null && (
          <div className="relative z-50 flex h-6 w-fit items-center justify-center gap-0.5 rounded-full bg-gradient-to-r from-[#FAD00B] to-[#FEEB1D] px-1.5 py-1 text-xs font-bold text-white">
            <NutIcon className="fill-current-[#17202D]" />
            <span className="text-xs font-bold leading-[16px] text-[#050D12]">
              +{numberWithSpaces(farmingStatus.nutcrackerBonusInHour)}/{t("h")}
            </span>
          </div>
        )}
      </div>
    </>
  )
}

export default Points
