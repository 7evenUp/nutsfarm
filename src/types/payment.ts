export type PaymentItem =
  | "NUT_PASS"
  | "DEFAULT"
  | "DONATION"
  | "LEVELS"
  | "INVENTORY_ITEM"
  | "GAME_ENERGY"
  | "GAME_INVENTORY_ITEM"
  | "UNLOCK_INVENTORY_CLAIM"

export type GameInventoryType = "WORDLY_COLOUR" | "CARDS_PACK"

export interface DonationGift {
  id: number
  type: "NFT" | "OTHER"
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  image: string
  imageEn: string
  cryptonId: number
  minDonationAmount: number
  maxDonationAmount: number
  isActive: boolean
}

export interface PurchaseItem {
  id: number
  amount: number | null
  discount: number | null
  title: string
  titleEn: string
  type: PurschaseItemType
  image: string
  imageEn: string
  description: string
  descriptionEn: string
  isActive: boolean
  objectId: number
  usdPrice: number
  nutsPrice: number
  starsPrice: number
  tonPrice: number
  tonPriceFull: number
  gameInventoryType: GameInventoryType
  cardsPack: {
    id: string
    isDefault: boolean
    title: string
    titleEn: string
    image: string
    imageEn: string
    description: string
    descriptionEn: string
    rarity: "COMMON" | "RARE"
    body: string
    bonus: number
  } | null
  personalDiscountStarsPrice: number | null
  personalDiscountTonPrice: number | null
  personalDiscountPercent: number | null
  personalDiscountEndTime: string | null
}

export interface CommitPaymentResponse {
  transactionId: string
  paymentFormUrl: string
}

export interface CommitPaymentRequest {
  id: number
  lang: string
  quantity?: number
  quantityDouble?: number // For payments with TON only
  objectId?: number
}

export type PurschaseItemType =
  | "NUT_PASS"
  | "DEFAULT"
  | "DONATION"
  | "LEVELS"
  | "INVENTORY_ITEM"
  | "GAME_ENERGY"
  | "GAME_INVENTORY_ITEM"
  | "GAME_HELP"
  | "UNLOCK_LESSON"
  | "UNLOCK_MODULE"
  | "PAID_SPIN_WHEEL"
  | "DROP_DISCOUNT"
