export interface InventoryItem {
  id: string
  userId: number
  objectId: number
  link: string
  icon: string
  title: string
  titleEn: string
  image: string
  imageEn: string
  description: string
  descriptionEn: string
  isMintActive: boolean
  mintPriceStars: number
  mintPriceTon: number
  mintPriceTonFull: number
  mintPrizeAmount: number
  mintPrizeXpAmount: number
  type:
    | "STREAK_ADDITIONAL_REWARD"
    | "NUT_PASS_REWARD"
    | "PURCHASE_ITEM"
    | "DONATION_GIFT"
    | "NFT"
    | "UNLOCK_INVENTORY_CLAIM"
  status: "CLAIMED" | "READY_TO_CLAIM"
}
