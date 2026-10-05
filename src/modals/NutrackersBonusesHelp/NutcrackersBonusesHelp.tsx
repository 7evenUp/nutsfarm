import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { AnimatePresence, motion } from "framer-motion"

import ChevronDown from "@/assets/icons/chevron-down.svg?react"
import NutsFarmIncreaseIcon from "@/assets/icons/nuts-farm-increase.svg?react"
import HourglassIcon from "@/assets/nutcracker-icons/hourglass.svg?react"

import { Sheet, SheetContent, SheetTrigger } from "@/shared/ui/SideSheet"

import { cn } from "@/lib/cn"

interface BonusItem {
  rarity: string
  value: string
}

interface CollapsibleSectionProps {
  title: string
  isOpen: boolean
  onToggle: () => void
  data: BonusItem[]
  headerRight: string
  icon: JSX.Element
}

const CollapsibleSection = ({
  title,
  isOpen,
  onToggle,
  data,
  headerRight,
  icon,
}: CollapsibleSectionProps) => {
  const { t } = useTranslation()
  return (
    <div className="rounded-lg bg-[#17202D]">
      <div
        className="flex h-12 w-full cursor-pointer items-center justify-between rounded-xl bg-[#17202D] p-1.5 text-sm font-medium text-white/75"
        onClick={onToggle}
      >
        <div className="flex h-[38px] w-[38px] items-center justify-center rounded-lg bg-[#050D12]">
          {icon}
        </div>
        <span className="ml-3 mr-auto font-tt-hoves-expanded font-medium text-white">
          {title}
        </span>
        <ChevronDown
          className={cn("ml-auto mr-2.5 h-4 w-4 transition-transform", {
            "rotate-180": isOpen,
          })}
        />
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3.5 overflow-hidden"
          >
            <ul className="w-full p-1 px-4 pb-2">
              <li className="flex h-8 w-full items-center justify-between py-2 text-xs text-white/50">
                <span>{t("Редкость")}</span>
                <span>{headerRight}</span>
              </li>
              {data.map(({ rarity, value }) => (
                <li
                  key={rarity}
                  className="flex h-8 w-full items-center justify-between border-t border-[#ffffff]/10 py-2 text-xs"
                >
                  <span>{rarity}</span>
                  <span>{value}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const NutcrackersBonusesDialog = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [farmOpen, setFarmOpen] = useState(false)
  const [timeOpen, setTimeOpen] = useState(false)

  const farmData: BonusItem[] = [
    { rarity: "Common", value: "+100%" },
    { rarity: "Uncommon", value: "+125%" },
    { rarity: "Rare", value: "+150%" },
    { rarity: "Mythical", value: "+175%" },
    { rarity: "Epic", value: "+200%" },
    { rarity: "Legendary", value: "+250%" },
  ]

  const timeData: BonusItem[] = [
    { rarity: "Common", value: `30 ${t("мин")}` },
    { rarity: "Uncommon", value: `1 ${t("h")}` },
    { rarity: "Rare", value: `2 ${t("h")}` },
    { rarity: "Mythical", value: `4 ${t("h")}` },
    { rarity: "Epic", value: `8 ${t("h")}` },
    { rarity: "Legendary", value: `16 ${t("h")}` },
  ]

  useEffect(() => {
    if (!open) {
      setFarmOpen(false)
      setTimeOpen(false)
    }
  }, [open])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className={className}>{children}</SheetTrigger>
      <SheetContent
        className={cn(
          "max-h-full gap-4 overflow-hidden rounded-t-2xl px-4 py-5",
          Telegram.WebApp.platform === "weba"
            ? "pb-8"
            : "pb-[max(var(--tg-safe-area-inset-bottom,16px),32px)]",
        )}
      >
        <div className="no-scroll flex flex-col gap-4 overflow-auto">
          <CollapsibleSection
            title={t("Бонус к фарму")}
            isOpen={farmOpen}
            onToggle={() => setFarmOpen((prev) => !prev)}
            data={farmData}
            headerRight={t("Бонус к базовому фарму в сек")}
            icon={<NutsFarmIncreaseIcon className="h-7 w-6 pr-0.5" />}
          />
          <p className="mb-5 text-sm font-medium text-white/50">
            {t(
              "Увеличивает фарм на N% в час и зависит от максимальной редкости имеющегося щелкунчика.",
            )}
          </p>

          <CollapsibleSection
            title={t("Бонус ко времени фарма")}
            isOpen={timeOpen}
            onToggle={() => setTimeOpen((prev) => !prev)}
            data={timeData}
            headerRight={t("Бонус ко времени фарма")}
            icon={<HourglassIcon className="h-[23px] w-[18px] shrink-0" />}
          />
          <p className="text-sm font-medium text-white/50">
            {t(
              "Увеличивает время фарма NUTS и суммируется с бонусов всех щелкунчиков, но не более 16 часов.",
            )}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default NutcrackersBonusesDialog
