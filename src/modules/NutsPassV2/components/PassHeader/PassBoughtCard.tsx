import { useTranslation } from "react-i18next"

import PremiumIcon from "@/assets/passV2/icons/premium.svg?react"

import { cn } from "@/lib/cn"

const PassBoughtCard = ({ className }: { className?: string }) => {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        "mx-auto flex h-7 w-fit items-center gap-1 rounded-md border border-[#121A2A]/20 bg-[#F2DD22]/10 px-3.5 backdrop-blur",
        className,
      )}
    >
      <PremiumIcon />
      <span className="bg-gradient-to-r from-[#FEEB1D] to-[#E7C412] bg-clip-text font-tt-hoves-expanded text-[10px]/[13px] font-semibold uppercase text-transparent">
        {t("Premium-пользователь")}
      </span>
    </div>
  )
}

export default PassBoughtCard
