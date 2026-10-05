import { useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

import Loader from "@/assets/icons/loader.svg?react"
import NutsOncePng from "@/assets/assembles/points-once.png"
import FarmingDurationPng from "@/assets/assembles/farming-duration.png"
import FarmingPerSecondPng from "@/assets/assembles/farming-per-second.png"
import XpPng from "@/assets/assembles/xp.png"

import { useAppSelector } from "@/redux/hooks"
import { useAssemblePartMutation, useGetBoostersQuery } from "@/redux/api/items"
import { useGetInventoryQuery } from "@/redux/api/inventory"

import { Button } from "@/shared/ui/Button"

import { AssemblePart } from "@/types/assembled-parts"

import { getHours } from "@/utils/date"

import { cn } from "@/lib/cn"

const AssemblePartItem = ({
  part,
  disabled,
}: {
  part: AssemblePart
  disabled: boolean
}) => {
  const { t } = useTranslation()

  const [busy, setBusy] = useState(false)

  const lang = useAppSelector((state) => state.language.value)

  const [assemble] = useAssemblePartMutation()
  const { refetch: refetchInventory } = useGetInventoryQuery()
  const { refetch: refetchBoosters } = useGetBoostersQuery()

  const handleAssemble = async () => {
    if (disabled || busy) return

    setBusy(true)

    try {
      await assemble({ id: part.id.toString() }).unwrap()
      if (part.type === "BOOSTER") {
        refetchBoosters()
      } else if (part.type === "NFT") {
        refetchInventory()
      }

      toast(
        t(
          part.type === "NFT"
            ? "NFT успешно собран!"
            : "Бустер успешно собран!",
        ),
        {
          className: "justify-center",
        },
      )
    } catch {
      toast.error(t("Ошибка"), {
        description: t(
          part.type === "NFT"
            ? "Не удалось собрать NFT"
            : "Не удалось собрать бустер",
        ),
      })
    } finally {
      setBusy(false)
    }
  }

  const getBonus = () => {
    if (part.type === "BOOSTER" && part.boost) {
      const currentBoost = part.boost
      if (currentBoost.bonusType === "FARMING_DURATION") {
        return `${getHours(currentBoost.duration, true, true)} ${t("h")}`
      } else if (currentBoost.bonusType === "XP_BONUS") {
        return `${getHours(currentBoost.duration, true, true)} ${t("h")}`
      } else if (currentBoost.bonusType === "POINTS_PER_SECOND") {
        return `${currentBoost.value} %`
      } else {
        return
      }
    }
  }

  const title = lang === "RU" ? part.title : part.titleEn
  const description =
    lang === "RU"
      ? part.description
      : part.titleEn ||
        `Collect all parts to assemble the ${part.type === "NFT" ? "NFT" : "booster"}}`
  const bonus = getBonus()

  return (
    <div className="relative flex h-[249px] w-[168px] shrink-0 flex-col rounded-xl bg-[#17202D] p-1">
      {part.type === "BOOSTER" ? (
        <img
          className="mb-3 h-[114px] w-[160px] rounded-lg bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#2D4F78]/70 to-[#0B1528] to-[85%] object-cover"
          src={
            part.boost?.bonusType === "FARMING_DURATION"
              ? FarmingDurationPng
              : part.boost?.bonusType === "POINTS_ONCE_BONUS"
                ? NutsOncePng
                : part.boost?.bonusType === "POINTS_PER_SECOND"
                  ? FarmingPerSecondPng
                  : part.boost?.bonusType === "XP_BONUS"
                    ? XpPng
                    : part.image || ""
          }
          alt={title}
        />
      ) : (
        <img
          className="mb-3 h-[114px] w-[160px] rounded-lg bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#2D4F78]/70 to-[#0B1528] to-[85%] object-cover"
          src={part.image || ""}
          alt={title}
        />
      )}
      {bonus ? (
        <p className="absolute left-2 top-2 flex h-5 min-w-8 items-center justify-center rounded-full bg-[#050D12] px-2 text-xs font-semibold text-white/75">
          {bonus}
        </p>
      ) : (
        ""
      )}

      <div className="absolute right-2 top-2 flex h-5 min-w-8 items-center justify-center rounded-full bg-[#050D12] px-2 text-xs font-semibold text-white/75">
        {part.userAmount} / {part.assemblePartsAmount}
      </div>
      <div className="flex flex-1 flex-col gap-2 text-left">
        <p className="px-[7px] text-left text-sm font-semibold leading-[17px]">
          {title}
        </p>
        <p className="px-1.5 text-left text-[10px] font-medium leading-[12px] text-white/75">
          {description}
        </p>
      </div>

      <Button
        appearance="white"
        disabled={disabled || busy}
        className="mt-auto h-8"
        contentClassName={cn(
          "h-7 gap-1 rounded-lg px-0 text-xs font-semibold",
          (disabled || busy) && "h-8",
        )}
        shadowClassName="h-8 rounded-lg group-active:h-7"
        onClick={handleAssemble}
      >
        {busy ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          t("Собрать детали")
        )}
      </Button>
    </div>
  )
}

export default AssemblePartItem
