import FireIcon from "@/assets/public-profile/icons/fire.svg?react"
import FireWingIcon from "@/assets/public-profile/icons/fire-wing.svg?react"
import { useTranslation } from "react-i18next"

const StreakBlock = ({
  currentStreak,
  bestStreak,
}: {
  currentStreak: number
  bestStreak: number
}) => {
  const { t } = useTranslation()

  return (
    <div className="mt-[30px] flex gap-2 px-3.5">
      {/* Current streak */}
      <div className="flex w-full items-center justify-start gap-3 rounded-xl bg-[#17202D] px-3.5 py-[15px]">
        <FireIcon className="h-9 w-9 shrink-0 px-[4px] py-[2px]" />
        <div className="flex flex-col gap-1">
          <span className="font-bold">
            {t("дней", { count: currentStreak })}
          </span>
          <span className="text-xs/[13px] font-medium text-white/50">
            {t("Текущий стрик")}
          </span>
        </div>
      </div>
      {/* Best streak */}
      <div className="flex w-full items-center justify-start gap-3 rounded-xl bg-[#17202D] px-3.5 py-[15px]">
        <FireWingIcon className="h-9 w-9 shrink-0" />
        <div className="flex flex-col gap-1">
          <span className="font-bold">{t("дней", { count: bestStreak })}</span>
          <span className="text-xs/[13px] font-medium text-white/50">
            {t("Лучший стрик")}
          </span>
        </div>
      </div>
    </div>
  )
}

export default StreakBlock
