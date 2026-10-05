export interface Booster {
  id: number
  title: string
  titleEn: string
  description: string
  descriptionEn: string
  image: string
  imageEn: string
  value: number
  howReceive: string
  durationType: BoosterDurationType
  duration: number
  price: number
  bonusType: BoosterBonusType
  userBoostId: number
  activatedAt: string
  farmingCyclesNow: number
  isActive: boolean
}

export type BoosterBonusType =
  | "FARMING_DURATION"
  | "POINTS_PER_SECOND"
  | "POINTS_ONCE_BONUS"
  | "XP_BONUS"

export type BoosterDurationType = "SECONDS" | "FARM_CYCLE"
