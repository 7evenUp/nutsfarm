import { Booster } from "./item"

export interface AssemblePart {
  id: number
  title: string
  titleEn: string
  description: string
  descriptionEn: string
  image: string | null
  imageEn: string | null
  assemblePartsAmount: number
  type: AssembleType
  boost: Booster | null
  boostId: number | null
  nft: {
    description: string | null
    descriptionEn: string | null
    id: number
    image: string | null
    imageEn: string | null
    title: string | null
    titleEn: string | null
  } | null
  nftId: number | null
  createdAt: string | null
  updatedAt: string | null
  userAmount: number
}

export interface AssembledResult {
  id: number
  type: AssembleType
  nftId?: number
  boostId?: number
  title: string
  image: string | null
}

export type AssembleType = "NFT" | "BOOSTER"
