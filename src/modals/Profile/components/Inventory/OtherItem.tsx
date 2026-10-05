import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import Loader from "@/assets/icons/loader.svg?react"

import { Button } from "@/shared/ui/Button"

import { useClaimInventoryItemMutation } from "@/redux/api/inventory"

import { cn } from "@/lib/cn"

const OtherItem = ({
  itemId,
  imgSrc,
  title,
  isClaimed,
  isMintActive,
}: {
  itemId: string
  imgSrc: string
  title: string
  isClaimed: boolean
  isMintActive: boolean
}) => {
  const { t } = useTranslation()

  const [claimLocked, setClaimLocked] = useState(false)

  const [mutate] = useClaimInventoryItemMutation()

  const activate = async () => {
    if (claimLocked) return

    setClaimLocked(true)

    try {
      await mutate({ inventoryId: itemId }).unwrap()
    } catch {
      toast.error(t("Ошибка"), {
        description: t("Упс, что-то пошло не так"),
      })
    } finally {
      setClaimLocked(false)
    }
  }

  return (
    <div className="flex h-[249px] w-[168px] shrink-0 flex-col gap-2.5 rounded-xl bg-[#17202D] p-1">
      <img
        className="h-[160px] w-[160px] rounded-lg bg-[#050D12] object-cover"
        src={imgSrc}
        alt={title}
      />

      <span className="ml-0.5 text-sm font-semibold capitalize">{title}</span>

      <Button
        appearance="white"
        disabled={isClaimed || claimLocked || isMintActive === false}
        className="mt-auto h-8"
        contentClassName={cn(
          "h-7 gap-1 rounded-lg px-0 text-xs font-semibold",
          (isClaimed || claimLocked || isMintActive === false) && "h-8",
        )}
        shadowClassName="h-8 rounded-lg group-active:h-7"
        onClick={activate}
      >
        {isMintActive === false ? (
          t("Скоро.инвентарь")
        ) : isClaimed ? (
          t("Активировано")
        ) : claimLocked ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          t("Активировать")
        )}
      </Button>
    </div>
  )
}

export default OtherItem
