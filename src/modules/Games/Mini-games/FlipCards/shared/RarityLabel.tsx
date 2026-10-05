import { useTranslation } from "react-i18next"

import { cn } from "@/lib/cn"

const RarityLabel = ({
  className,
  rarity,
}: {
  rarity: string
  className?: string
}) => {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        "flex h-5 items-center rounded bg-gradient-to-b from-[#7587DE] to-[#6B7CCF] px-[5px] drop-shadow-[0px_1px_1px_rgba(52,12,81,0.2)]",
        rarity === "LEGENDARY" && "from-[#FEEB1D] to-[#EAA910]",
        className,
      )}
    >
      <span
        className={cn(
          "translate-y-px text-[10px]/[150%] font-bold uppercase tracking-[0.02em] text-[#DDDDF5]",
          rarity === "LEGENDARY" && "text-[#51327D]",
        )}
      >
        {rarity === "RARE"
          ? t("Редкий")
          : rarity === "LEGENDARY"
            ? t("Легендарный")
            : t("Необычный")}
      </span>
    </div>
  )
}

export default RarityLabel
