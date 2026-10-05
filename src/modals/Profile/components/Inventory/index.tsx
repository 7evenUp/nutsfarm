import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import Nfts from "./Nfts"
import Boosters from "./Boosters"
import AssembleParts from "./AssembleParts"
import OthersInventory from "./Others"

import { Skeleton } from "@/shared/ui/Skeleton"

import {
  useGetAssemblePartsQuery,
  useGetBoostersQuery,
} from "@/redux/api/items"
import { useGetInventoryQuery } from "@/redux/api/inventory"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

import { cn } from "@/lib/cn"

const Inventory = () => {
  const { t } = useTranslation()

  const { data: boosters, isLoading: isBoostersLoading } = useGetBoostersQuery()
  const { data: parts, isLoading: isPartsLoading } = useGetAssemblePartsQuery()
  const { data: inventory, isLoading: isInventoryLoading } =
    useGetInventoryQuery()

  const nftItems = useMemo(() => {
    if (!inventory) return []

    return inventory.filter(
      (item) =>
        item.type === "NFT" ||
        item.type === "STREAK_ADDITIONAL_REWARD" ||
        item.type === "UNLOCK_INVENTORY_CLAIM",
    )
  }, [inventory])

  const otherItems = useMemo(() => {
    if (!inventory) return []

    return inventory.filter(
      (item) => item.type !== "NFT" && item.type !== "STREAK_ADDITIONAL_REWARD",
    )
  }, [inventory])

  const [activeTab, setActiveTab] = useState<
    "nfts" | "others" | "parts" | "boost"
  >("nfts")

  if (
    nftItems.length === 0 &&
    otherItems.length === 0 &&
    boosters?.length === 0 &&
    parts?.length === 0
  )
    return

  return (
    <div className="mb-[22px] flex flex-col">
      <span className="mb-[18px] ml-4 font-tt-hoves-expanded text-lg font-semibold text-white">
        {t("Инвентарь")}
      </span>

      <div className="mb-3 flex items-center gap-2 px-4">
        {isBoostersLoading || isPartsLoading || isInventoryLoading ? (
          <>
            <Skeleton className="h-8 w-14 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </>
        ) : (
          <>
            {nftItems.length > 0 && (
              <button
                className={cn(
                  "flex h-8 items-center rounded-full bg-[#17202D] px-4 text-white/30 transition-colors",
                  activeTab === "nfts" && "bg-[#252E3D] text-white",
                )}
                onClick={() => {
                  makeHapticFeedback({ impactOccured: "soft" })
                  setActiveTab("nfts")
                }}
              >
                NFT
              </button>
            )}
            {boosters && boosters.length > 0 && (
              <button
                className={cn(
                  "flex h-8 items-center rounded-full bg-[#17202D] px-4 text-white/30 transition-colors",
                  activeTab === "boost" && "bg-[#252E3D] text-white",
                )}
                onClick={() => {
                  makeHapticFeedback({ impactOccured: "soft" })
                  setActiveTab("boost")
                }}
              >
                {t("Бустеры")}
              </button>
            )}
            {parts && parts.length > 0 && (
              <button
                className={cn(
                  "flex h-8 items-center rounded-full bg-[#17202D] px-4 text-white/30 transition-colors",
                  activeTab === "parts" && "bg-[#252E3D] text-white",
                )}
                onClick={() => {
                  makeHapticFeedback({ impactOccured: "soft" })
                  setActiveTab("parts")
                }}
              >
                {t("Детали")}
              </button>
            )}
            {otherItems.length > 0 && (
              <button
                className={cn(
                  "flex h-8 items-center rounded-full bg-[#17202D] px-4 text-white/30 transition-colors",
                  activeTab === "others" && "bg-[#252E3D] text-white",
                )}
                onClick={() => {
                  makeHapticFeedback({ impactOccured: "soft" })
                  setActiveTab("others")
                }}
              >
                {t("Прочее")}
              </button>
            )}
          </>
        )}
      </div>

      {activeTab === "nfts" && <Nfts />}
      {activeTab === "boost" && <Boosters />}
      {activeTab === "parts" && <AssembleParts />}
      {activeTab === "others" && <OthersInventory />}
    </div>
  )
}

export default Inventory
