export type GameTypes = "PUZZLES" | "WORDLY" | "CARDS"
export type GameStatuses = "PENDING" | "COMPLETED" | "FAILED"
export type GameTheme =
  | "default"
  | "flip-cards"
  | "puzzles"
  | "cryptle"
  | "puzzles-gameplay"

export interface GameEnergyResponse {
  gameEnergy: number
  energyFullRecoverTime: string
}

export interface LevelsRequestArgs {
  type: GameTypes
  page?: number
  size?: number
}

export interface StartedLevelsResponse {
  items: UserGameLevelDifficultyInfo[]
  page: number
  size: number
  total: number
}

export interface NewLevelsResponse {
  items: GameLevel[]
  page: number
  size: number
  total: number
}

export interface StartLevelRequestArgs {
  gameType: GameTypes
  gameLevelDifficultyId: string
  bet?: number
  betRatio?: number
  token: string
  gameCardsPackId?: number
}

export interface ClaimLevelRequestArgs {
  id: string
  gameType: GameTypes
  isBetWin?: boolean
  token: string
  gameStats?: {
    moves: number
    timePassed: number
    betNutsAmount?: number
    betTriesAmount?: number
  }
}

export interface UserGameLevelDifficultyInfo {
  id: string
  status: GameStatuses
  gameType: GameTypes
  level: number
  bet: number
  betRatio: number
  gameLevelDifficultyId: string
  gameLevelId: string
  gameLevelTitle: string
  gameLevelDescription: string
  gameLevelImage: string
  gameLevelBody: string
  gameStats?: {
    moves: number
    timePassed: number
    betNutsAmount?: number
    betTriesAmount?: number
  }
  difficulty: string
  gameLevelDifficultyBody: string
  price: number
  energyPrice: number
  reward: number
  nutPassXp: number
}

export interface GameLevel {
  id: number
  status?: GameStatuses
  gameType: GameTypes
  title: string
  description: string
  image: string
  level: number
  body: string
  createdAt: string
  updatedAt: string
  difficulties: GameDifficulty[]
}

export interface GameDifficulty {
  id: string
  difficulty: string
  body: string
  price: number
  energyPrice: number
  reward: number
  nutPassXp: number
  createdAt: string
  updatedAt: string
  gameLevelId: number
}

export interface GameInventoryItem {
  id: number
  userId: number
  objectId: number
  title: string
  titleEn: string
  image: string
  imageEn: string
  description: string
  descriptionEn: string
  type: "WORDLY_COLOUR" | "CARDS_PACK"
  pack: {
    id: string
    isDefault: true
    title: string
    titleEn: string
    image: string
    imageEn: string
    description: string
    descriptionEn: string
    rarity: string
    body: string
    bonus: number
  } | null
}

export interface CardsPackBody {
  img: string
  title: string
  titleEn: string
  description: string
  descriptionEn: string
  link: string
}

export interface PuzzlesDifficultiesBody {
  difficulty_timer?: number
}
