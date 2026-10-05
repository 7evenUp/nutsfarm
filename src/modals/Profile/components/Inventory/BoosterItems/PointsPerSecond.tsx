import { useTranslation } from "react-i18next"

import FarmingPerSecondPng from "@/assets/boosters/booster-farming-per-second.png"

import BoosterInfoModal from "./BoosterInfoModal"
import SelectBooster from "./SelectBooster"

import { Button } from "@/shared/ui/Button"

import { useAppSelector } from "@/redux/hooks"

import { Booster } from "@/types/item"

const PointsPerSecond = ({ boosters }: { boosters: Booster[] }) => {
  const { t } = useTranslation()

  const lang = useAppSelector((state) => state.language.value)

  if (boosters.length === 0) return null

  const boosterToOperate =
    boosters.find((booster) => booster.isActive) ||
    boosters[boosters.length - 1]

  const boosterTitle =
    lang === "RU" ? boosterToOperate.title : boosterToOperate.titleEn
  const boosterDescription =
    lang === "RU"
      ? boosterToOperate.description
      : boosterToOperate.descriptionEn

  return (
    <div className="relative flex min-h-[249px] w-[168px] shrink-0 flex-col rounded-xl bg-[#17202D] p-1">
      <p className="absolute left-2 top-2 flex h-5 min-w-8 items-center justify-center rounded-full bg-[#050D12] px-2 text-xs font-semibold text-white/75">
        {boosterToOperate.duration} {t("цикла")}
      </p>
      <p className="absolute right-2 top-2 flex h-5 min-w-8 items-center justify-center rounded-full bg-[#050D12] px-2 text-xs font-semibold text-white/75">
        x{boosters.length}
      </p>
      <div className="h-[114px] w-[160px] rounded-lg bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#2D4F78]/70 to-[#0B1528] to-[85%]">
        <img
          className="h-[114px] w-[160px]"
          src={FarmingPerSecondPng}
          alt={boosterTitle}
        />
      </div>

      <span className="ml-0.5 mt-3 pb-2 text-sm font-semibold">
        {boosterTitle}
      </span>

      <p className="mb-4 ml-0.5 text-[10px]/[12px] font-medium text-white/75">
        {boosterDescription}
      </p>

      {boosterToOperate.isActive ? (
        <BoosterInfoModal
          title={boosterTitle}
          description={boosterDescription}
          bonusType={boosterToOperate.bonusType}
          duration={boosterToOperate.duration}
          durationType={boosterToOperate.durationType}
          farmingCyclesNow={boosterToOperate.farmingCyclesNow}
          startedAt={boosterToOperate.activatedAt}
        >
          <Button
            appearance="blue-linear"
            className="mt-auto h-8"
            contentClassName="h-7 gap-1 rounded-lg px-0 text-xs font-semibold"
            shadowClassName="h-8 rounded-lg group-active:h-7"
          >
            {t("Подробнее")}
          </Button>
        </BoosterInfoModal>
      ) : (
        <SelectBooster boosters={boosters}>
          <Button
            appearance="white"
            className="mt-auto h-8"
            contentClassName="h-7 gap-1 rounded-lg px-0 text-xs font-semibold"
            shadowClassName="h-8 rounded-lg group-active:h-7"
          >
            {t("Выбрать")}
          </Button>
        </SelectBooster>
      )}
    </div>
  )
}

export default PointsPerSecond
