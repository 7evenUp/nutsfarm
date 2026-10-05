import { AssemblePart } from "./assembled-parts"
import { Booster } from "./item"

export interface Reward {
  id: string
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  image: string
  imageEn: string
  rarity: string
  amount: number
  cryptonPrizeId: string
  boxBody: Reward[] | null
  type: RewardType
  boxChance: number
  assemblePart: AssemblePart
  boost: Booster
}

export interface LevelRewards {
  items: LevelRewardItem[]
  page: number
  size: number
  total: number
}

export interface LevelRewardItem {
  id: string
  level: number
  isNutPassRequired: boolean
  reward: Reward
  status: "NOT_ACHIEVED" | "READY_FOR_CLAIM" | "CLAIMED"
  boxClaimReward?: Reward
  userNutPassRequired: true
}

export type RewardType =
  | "BOX"
  | "TOKENS"
  | "NFT"
  | "ASSEMBLE_PART"
  | "BOOSTER"
  | "ENERGY"
