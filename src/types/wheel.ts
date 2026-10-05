import { AssemblePart } from "./assembled-parts"
import { Booster } from "./item"
import { Reward } from "./nutspass"

export interface SpinsResponse {
  spinsCount: number
  energyForNextSpin: number
  paidSpins: number
}

export interface WheelReward {
  id: string
  title: string
  titleEn: string
  description: string
  descriptionEn: string
  image: string
  imageEn: string
  type: WheelRewardType
  amount: number
  objectId: string
  isPaidWheel: boolean
  createdAt: string
  updatedAt: string
  nft: WheelNFT | null
  boost: Booster | null
  assembleItemPart: AssemblePart | null
  boxReward: Reward
}

export interface WheelNFT {
  id: number
  title: string
  titleEn: string
  description: string
  descriptionEn: string
  image: string
  imageEn: string
  isMintActive: boolean
  cryptonId: number
  createdAt: string
  updatedAt: string
}

export type WheelRewardType =
  | "NFT"
  | "NUTS"
  | "GAME_ENERGY"
  | "BOOSTER"
  | "NUT_PASS_XP"
  | "JACKPOT"
  | "ASSEMBLE_PART"
  | "LEVELS"
  | "PAID_WHEEL_SPIN"
  | "NUT_PASS"
  | "BOX"
