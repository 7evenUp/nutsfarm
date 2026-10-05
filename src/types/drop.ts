export interface DropCriteria {
  type: CriteriaType
  level: number
  amount: number
  usersOnLevel: number
}

export interface UserDropCriteriaProgress {
  type: CriteriaType
  userLvl: number
  userAmount: number
  maxTimes: number | null
  userAmountBelow: number
  userPercentBellow: number
}

export type CriteriaType =
  | "PASSED_LESSONS"
  | "PURCHASE_MODULE"
  | "PURCHASE_NUT_PASS"
  | "NUT_PASS_LEVELS"
  | "STREAK_DAYS"
  | "PAYS_IN_STARS"
  | "ACHIEVEMENTS"
  | "XP_AMOUNT"
  | "LEVELS_PASSED"
  | "WHEEL_SPINS"
  | "NUTCRACKER"
  | "TASK_COMPLETED"
  | "MINT_NFT"
  | "CUPS_NFT"

export interface UserCahorta {
  id: number
  cohort: string

  achievementsCount: number | null
  maxNutRunDayLower: number | null
  maxNutRunDayUpper: number | null
  tasksCompleted: number | null
  userWheels: number | null
  lessonsPassedLower: number | null
  lessonsPassedUpper: number | null

  discountPercent: number

  coursePrice: number
  coursePriceTon: number
  hasCourse: boolean
  targetCourse: boolean

  nowGames: number
  gamesPrice: number
  gamesPriceTon: number
  targetGames: number | null
  totalGamesLower: number | null
  totalGamesUpper: number | null

  nowNftMints: number
  nftMints: number | null
  nftMintsPrice: number
  nftMintsPriceTon: number
  targetNftMints: number | null

  nowPassLevels: number
  passLevelLower: number | null
  passLevelUpper: number | null
  passLevelPrice: number
  passLevelPriceTon: number
  targetPassLevel: number | null

  nowWheels: number
  targetWheels: number | null
  wheelsPrice: number
  wheelsPriceTon: number

  nutPassPrice: number
  nutPassPriceTon: number
  hasNutPass: boolean
  targetNutPass: boolean

  packPrice: number
}
