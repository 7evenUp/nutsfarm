export interface Nutcracker {
  id: number
  ownerTelegramId: string | null
  name: string
  imageLink: string
  nutcrackerIndex: string
  rarity: NutcrackerRarity
  createdAt: string
  updatedAt: string
  rarityBonus: RarityBonus
}

export type NutcrackerRarity =
  | "common"
  | "uncommon"
  | "rare"
  | "mythical"
  | "epic"
  | "legendary"

export interface RarityBonus {
  rarity: string
  farmMinutesTime: number
  farmBonusPercent: number
}

export const RARITY_STYLES = {
  legendary: {
    border: "border border-[#FDEA13]",
    text: "text-[#FDEA13]",
    background: "bg-gradient-to-r from-[#FEEB1D33] to-[#FAD00B33]",
  },
  epic: {
    border: "border border-[#A3FF47]",
    text: "text-[#A3FF47]",
    background: "bg-[#A3FF4733]",
  },
  mythical: {
    border: "border border-[#F799FF]",
    text: "text-[#F799FF]",
    background: "bg-[#F799FF33]",
  },
  rare: {
    border: "border border-[#7B60FF]",
    text: "text-[#7B60FF]",
    background: "bg-[#7B60FF33]",
  },
  uncommon: {
    border: "border border-[#55A3FF]",
    text: "text-[#55A3FF]",
    background: "bg-[#55A3FF33]",
  },
  common: {
    border: "border border-[#FFFFFF]",
    text: "text-[#FFFFFF]",
    background: "bg-[#FFFFFF33]",
  },
}
