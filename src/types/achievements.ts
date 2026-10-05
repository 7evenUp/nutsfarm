export interface Achievement {
  id: number
  type: AchievementType
  title: string
  titleEn: string
  description: string
  descriptionEn: string
  image: string
  imageEn: string
  isActive: boolean
  reward: number
  nutPassXp: number
  isHidden: boolean
  userStatus: "RECEIVED" | "CLAIMED" | null
}

export type AchievementType =
  | "LESSON"
  | "STREAK"
  | "FARM_ClAIM"
  | "TASK_COMPLETED"
  | "TOP_PLACE"
  | "NUT_PASS_PURCHASED"
  | "DONATE_STARS"
  | "REFERRAL_COUNT"
  | "TON_WALLET"
  | "NOTIFY_FRIENDS_WEEKS"
