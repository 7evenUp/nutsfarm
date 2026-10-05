export interface CurrentStreakInfo {
  daysMissed: number
  missedDaysFreezeCost: number
  todayStreakInfo: StreakDay
  lastUserStreakDay: UserStreakDay
  streakDays: { day: string; hasEnter: boolean; freezing: boolean }[]
  streakRewardReceivedToday: boolean
}

export interface StreakDay {
  dayNumber: number
  nutsReward: number
  bonusPercentage: number
  showBonusPercentage: boolean
  percentageLvl: number
  isMilestone: boolean
  mileStoneType: string
  nutDashRank: string
  additionalReward: StreakDayAdditionalReward | null
}

export interface StreakDayAdditionalReward {
  id: string
  cryptonPrizeId: number
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  img: string
  imgEn: string
}

export interface UserStreakDay {
  id: number
  userId: number
  dropStreakAfter: string
  createdAt: string
  currentStreak: number
}

export interface StreakMap {
  [key: string]: StreakDay
}

export interface UserStreakReward {
  id: string
  isPrizeClaimed: boolean
  streakDay: StreakDay
}
