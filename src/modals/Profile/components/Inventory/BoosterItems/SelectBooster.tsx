import { Dispatch, SetStateAction, useState } from "react"
import { Description } from "@radix-ui/react-dialog"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import Loader from "@/assets/icons/loader.svg?react"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/shared/ui/SideSheet"
import { Button } from "@/shared/ui/Button"

import { useAppSelector } from "@/redux/hooks"
import { useActivateBoosterMutation } from "@/redux/api/items"

import { Booster } from "@/types/item"

import { cn } from "@/lib/cn"

const SelectBooster = ({
  children,
  boosters,
}: {
  children: React.ReactNode
  boosters: Booster[]
}) => {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)
  const [claimLocked, setClaimLocked] = useState(false)

  const groupedBoosters = boosters.reduce<Record<number, Booster[]>>(
    (acc, item) => {
      if (!acc[item.id]) {
        acc[item.id] = []
      }
      acc[item.id].push(item)
      return acc
    },
    {},
  )

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        className={cn(
          "gap-0 overflow-hidden overflow-y-scroll px-0 pb-[max(var(--tg-safe-area-inset-bottom,24px),24px)] pt-6",
          Telegram.WebApp.initData ? "max-h-screen" : "max-h-[100svh]",
        )}
      >
        <Description className="sr-only">Select Booster modal</Description>
        <SheetHeader></SheetHeader>
        <p className="mb-6 mt-4 text-balance px-4 text-center text-sm text-white/75">
          {t(
            "Одновременно может быть активирован только один бустер этого типа",
          )}
        </p>

        <div className="flex w-full flex-col gap-2 px-3.5">
          {Object.values(groupedBoosters).map((boosterGroup) => (
            <SelectBoosterGroup
              boosters={boosterGroup}
              claimLocked={claimLocked}
              setClaimLocked={setClaimLocked}
              closeModal={() => setOpen(false)}
            />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default SelectBooster

const SelectBoosterGroup = ({
  boosters,
  claimLocked,
  setClaimLocked,
  closeModal,
}: {
  boosters: Booster[]
  claimLocked: boolean
  setClaimLocked: Dispatch<SetStateAction<boolean>>
  closeModal: VoidFunction
}) => {
  const { userBoostId, title, titleEn, description, descriptionEn } =
    boosters[boosters.length - 1]

  const { t } = useTranslation()

  const [localClaimLocked, setLocalClaimLocked] = useState(false)

  const lang = useAppSelector((state) => state.language.value)

  const [mutate] = useActivateBoosterMutation()

  const activate = async () => {
    if (claimLocked) return

    setClaimLocked(true)
    setLocalClaimLocked(true)

    try {
      await mutate({
        userBoostId: userBoostId,
      }).unwrap()
      closeModal()
      toast(t("Бустер активирован"), {
        className: "justify-center",
      })
    } catch {
      toast.error(t("Ошибка"), {
        description: t("Упс, что-то пошло не так"),
      })
    } finally {
      setClaimLocked(false)
      setLocalClaimLocked(false)
    }
  }

  return (
    <div className="relative flex items-center justify-between gap-2 rounded-lg border border-[#0d131b] bg-[#17202D] py-2 pl-3 pr-1.5">
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-medium">
          {lang === "RU" ? title : titleEn}{" "}
          {boosters.length > 1 && `(${boosters.length} ${t("шт")})`}
        </p>
        <p className="text-xs text-white/60">
          {lang === "RU" ? description : descriptionEn}
        </p>
      </div>

      <Button
        appearance="white"
        disabled={localClaimLocked}
        className="h-8"
        contentClassName={cn(
          "h-7 gap-1 rounded-lg px-0 px-3 text-xs font-semibold",
          localClaimLocked && "h-8",
        )}
        shadowClassName="h-8 rounded-lg group-active:h-7"
        onClick={activate}
      >
        {localClaimLocked ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          t("Активировать")
        )}
      </Button>
    </div>
  )
}
