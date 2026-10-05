import { useTranslation } from "react-i18next"

import ZipIcon from "@/assets/icons/zip.svg?react"

import { cn } from "@/lib/cn"

const StreakBooster = ({
  percentageLvl,
  bonusPercentage,
  className,
}: {
  percentageLvl: number
  bonusPercentage: number
  className?: string
}) => {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        "flex h-[77px] w-[158px] flex-col gap-1 rounded-[14px] bg-gradient-to-br pl-2 pr-1 pt-2.5 text-white phone-sm-fix:h-[84px] phone-sm-fix:w-[187px] phone-sm-fix:pl-3",
        className,
        percentageLvl === 1 && "from-[#7ED853] to-[#9EFCA1] text-black",
        percentageLvl === 2 && "from-[#3FA9E6] to-[#9AFDC7] text-black",
        percentageLvl === 3 && "from-[#428DFE] to-[#9FE4FF] text-black",
        percentageLvl === 4 && "from-[#4655ED] to-[#5446A9]",
        percentageLvl === 5 && "from-[#533C95] to-[#533C95]",
        percentageLvl === 6 && "from-[#9B43B6] to-[#9461ED]",
        percentageLvl === 7 && "from-[#C141CC] to-[#F47EC5]",
        percentageLvl === 8 && "from-[#D73737] to-[#F06969]",
        percentageLvl === 9 && "from-[#FCA72C] to-[#F06969] text-black",
        percentageLvl === 10 && "from-[#FBC62B] to-[#FFF8AF] text-black",
      )}
    >
      <div className="flex items-center gap-1.5">
        <ZipIcon className="h-4 w-4 phone-sm-fix:h-5 phone-sm-fix:w-5" />
        <span className="font-tt-hoves-expanded text-base font-medium phone-sm-fix:text-lg">
          {t("Бустер")} {percentageLvl} LVL
        </span>
      </div>
      <p className="text-[10px]/[14px] font-medium phone-sm-fix:text-sm/4">
        {t("Увеличивает весь баланс NUTS на")} {bonusPercentage}%
      </p>
    </div>
  )
}

export default StreakBooster
