import { useTranslation } from "react-i18next"
import { Close, Description } from "@radix-ui/react-dialog"

import CloseIcon from "@/assets/icons/close.svg?react"
import HourglassIcon from "@/assets/nutcracker-icons/hourglass.svg?react"
import NutsFarmIncreaseIcon from "@/assets/icons/nuts-farm-increase.svg?react"
import Loader from "@/assets/icons/loader.svg?react"

import { Sheet, SheetContent } from "@/shared/ui/SideSheet"

import { Nutcracker, RARITY_STYLES } from "@/types/nutcracker"

import { cn } from "@/lib/cn"

import { sendMetrika } from "@/utils/sendMetrika"
import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

const NutcrackerInfoModal = ({
  nutcracker,
  setOpen,
  onSetAvatar,
  isLoading,
  isOpen,
}: {
  nutcracker: Nutcracker | null
  isOpen: boolean
  setOpen: (e: boolean) => void
  onSetAvatar: (nutcrackerIndex: string) => Promise<void>
  isLoading?: boolean
}) => {
  const { t } = useTranslation()

  const handleSetAvatar = () => {
    if (isLoading) return
    if (!nutcracker) return

    makeHapticFeedback({ impactOccured: "soft" })
    sendMetrika("set_nutcracker_avatar")
    onSetAvatar(nutcracker.nutcrackerIndex).finally(() => {
      setOpen(false)
    })
  }

  if (!nutcracker) {
    return null
  }

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent
        className={cn(
          "gap-0 overflow-y-auto px-0 pt-6",
          Telegram.WebApp.platform === "weba"
            ? "pb-[116px]"
            : "pb-[calc(max(var(--tg-safe-area-inset-bottom,16px),16px)+100px)]",
          Telegram.WebApp.initData ? "h-screen rounded-t-none" : "h-[100svh]",
        )}
      >
        <Description className="sr-only">Nutcrackers modal</Description>

        {!Object.keys(Telegram.WebApp.initDataUnsafe).length ? (
          <div className="absolute right-4 ml-auto flex justify-between">
            <Close className="opacity-70 transition-opacity focus:outline-none active:opacity-100">
              <CloseIcon className="h-6 w-6" />
              <span className="sr-only">Close</span>
            </Close>
          </div>
        ) : null}

        <div className="px-9">
          <div className="mx-auto mb-4 flex flex-col items-center">
            <img
              src={nutcracker.imageLink}
              alt={nutcracker.name}
              className="w-56 rounded-2xl object-cover phone-sm-fix:w-[266px]"
            />
            <h2 className="mt-4 w-full text-center font-tt-hoves-expanded text-xl font-semibold phone-sm-fix:text-2xl">
              {nutcracker.name}
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-white/75">
                {t("Редкость")}:
              </span>
              <div
                className={cn(
                  "flex h-[33px] items-center justify-center rounded-full px-3 py-[7px]",
                  RARITY_STYLES[nutcracker.rarity].background,
                )}
              >
                <span
                  className={cn(
                    "rounded px-2 py-0.5 text-sm",
                    RARITY_STYLES[nutcracker.rarity].text,
                  )}
                >
                  {nutcracker.rarity.charAt(0).toLocaleUpperCase() +
                    nutcracker.rarity.slice(1)}
                </span>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-white/75">
                {t("Бонусы")}:
              </span>
              <div className="mt-2 flex items-center gap-3 rounded-[14px] bg-[#17202D] p-2.5 pr-5 phone-sm-fix:gap-4">
                <HourglassIcon className="h-7 w-7 shrink-0" />
                <p className="text-sm font-medium">
                  {t("Продлевает фарм на")}{" "}
                  {nutcracker.rarityBonus.farmMinutesTime} {t("мин")}
                </p>
              </div>
              <div className="mt-2 flex items-center gap-3 rounded-[14px] bg-[#17202D] p-2.5 pr-5 phone-sm-fix:gap-4">
                <NutsFarmIncreaseIcon className="h-7 w-7 shrink-0" />
                <span className="text-sm font-medium">
                  {t("Увеличивает фарм на")}{" "}
                  {nutcracker.rarityBonus.farmBonusPercent}%
                </span>
              </div>
            </div>
          </div>

          <div
            className={cn(
              "fixed inset-x-4 z-10",
              Telegram.WebApp.platform === "weba"
                ? "bottom-5"
                : "bottom-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
            )}
          >
            <button
              onClick={handleSetAvatar}
              disabled={isLoading}
              className="relative flex h-[50px] w-full items-center justify-center rounded-[14px] bg-[#17202D] font-tt-hoves-expanded font-medium text-white ring ring-background"
            >
              {isLoading ? (
                <Loader className="mx-auto animate-spin" />
              ) : (
                t("Поставить на аватар")
              )}
            </button>
          </div>

          <div className="fixed bottom-0 left-0 right-0 h-[109px] bg-gradient-to-b from-transparent via-[#050D12] to-[#050D12]" />
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default NutcrackerInfoModal
