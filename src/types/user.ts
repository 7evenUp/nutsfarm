import { Boost } from "./boosts"

export interface UserRefInfo {
  availableInvites: number
  balance: number
  createdAt: string | null
  cryptonGlobalId: number
  deepReferralPercentCoefficient: number
  // gameEnergy: number
  isInfluencer: boolean
  isPreSybil: boolean
  isSybil: boolean
  isTelegramPremium: boolean
  isVerified: boolean
  lang: "RU" | "EN"
  refererId: number
  referralCode: string
  referralRewardPercent: number
  telegramPicture: string | null
  timezone: string | null
  tonWallet: string | null
  updatedAt: string | null
  username: string | null
}

export interface UserMainInfo {
  id: string
  balance: number
  balanceBonusPercentage: number
  balanceBonusPercentageLvl: number
  boosts: Boost[]
  cryptonGlobalId: number
  cryptonProfileUsername: string | null
  firstname: string | null
  freeNftMints: number | null
  // gameEnergy: number
  invitesLockedBefore: null | string
  isCryptonOnboardingPassed: boolean
  isCryptonRetroDropClaimed: boolean
  isInventoryNotificationReceived: boolean | null
  isKols: boolean
  isNewTaskNotificationReceived: boolean
  isNutPassActive: boolean
  isStartBonusClaimed: boolean
  lang: "RU" | "EN"
  lastname: string
  nutPassXpBalance: number
  pictureReRollLockedBefore: null | string
  referralCode: string
  telegramId: number
  telegramPicture: string
  tonWallet: string
  username: string
  isNewAchievementReceived: boolean
  basePointsPerSecond: number
  isNutPassStartPushReceived: boolean
  isNewNutPassReward: boolean
}

export interface TransactionHistoryResponse {
  items: UserTransaction[]
  page: number
  size: number
  total: number
}

export interface UserTransaction {
  amount: number
  createdAt: string
  type: "WITHDRAW" | "DEPOSIT"
  action: UserTransactionAction
}

export type UserTransactionAction =
  | "FARM"
  | "TASK"
  | "SKIN"
  | "REFERRAL"
  | "STORY"
  | "START_BONUS"
  | "TON_WALLET_BONUS"
  | "RETRO_DROP_BONUS"
  | "DAILY_STREAK_REWARD"
  | "FREEZE_PAYMENT"
  | "LEARN"
  | "RETRO_DROP_BALANCE_BONUS"
  | "NUT_PASS_REWARD"
  | "LEVELS_BUYING"
  | "NUTCRACKER_BONUS"
  | "ACHIEVEMENT"
  | "GAME"
  | "BOOST"
  | "NUTS_PURCHASE"
  | "WHEEL_REWARD"
  | "RETRO_DROP_2_BONUS"
  | "OTHER"
