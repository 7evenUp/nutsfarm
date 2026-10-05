import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import Loader from "@/assets/icons/loader.svg?react"
import NutsOncePng from "@/assets/boosters/booster-nuts-once.png"

import { Button } from "@/shared/ui/Button"

import { useAppSelector } from "@/redux/hooks"
import { useActivateBoosterMutation } from "@/redux/api/items"

import { Booster } from "@/types/item"

import { cn } from "@/lib/cn"

const PointsOnce = ({ boosters }: { boosters: Booster[] }) => {
  const { t } = useTranslation()

  const [claimLocked, setClaimLocked] = useState(false)

  const lang = useAppSelector((state) => state.language.value)

  const [mutate] = useActivateBoosterMutation()

  if (boosters.length === 0) return null

  const activate = async () => {
    if (claimLocked) return

    setClaimLocked(true)

    try {
      await mutate({ userBoostId: boosters[0].userBoostId }).unwrap()
      toast(t("Бустер активирован"), {
        className: "justify-center",
      })
    } catch {
      toast.error(t("Ошибка"), {
        description: t("Упс, что-то пошло не так"),
      })
    } finally {
      setClaimLocked(false)
    }
  }

  const boosterTitle = lang === "RU" ? boosters[0].title : boosters[0].titleEn
  const boosterDescription =
    lang === "RU" ? boosters[0].description : boosters[0].descriptionEn

  return (
    <div className="relative flex min-h-[249px] w-[168px] shrink-0 flex-col rounded-xl bg-[#17202D] p-1">
      <p className="absolute right-2 top-2 flex h-5 min-w-8 items-center justify-center rounded-full bg-[#050D12] px-2 text-xs font-semibold text-white/75">
        x{boosters.length}
      </p>
      <div className="h-[114px] w-[160px] rounded-lg bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#2D4F78]/70 to-[#0B1528] to-[85%]">
        <img
          className="h-[114px] w-[160px]"
          src={NutsOncePng}
          alt={boosterTitle}
        />
      </div>

      <span className="ml-0.5 mt-3 pb-2 text-sm font-semibold">
        {boosterTitle}
      </span>

      <p className="mb-4 ml-0.5 text-[10px]/[12px] font-medium text-white/75">
        {boosterDescription}
      </p>

      <Button
        appearance="white"
        disabled={claimLocked}
        className="mt-auto h-8"
        contentClassName={cn(
          "h-7 gap-1 rounded-lg px-0 text-xs font-semibold",
          claimLocked && "h-8",
        )}
        shadowClassName="h-8 rounded-lg group-active:h-7"
        onClick={activate}
      >
        {claimLocked ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          t("Активировать")
        )}
      </Button>
    </div>
  )
}

export default PointsOnce
