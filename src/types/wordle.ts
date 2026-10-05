export interface GameState {
  guesses: string[]
  currentGuess: string
  gameOver: boolean
  reward?: number
  bet?: number
  betReward?: number
  isBet?: boolean
  isBetwon?: boolean
  invalidWord?: boolean
  won: boolean
}

export type CellStatus = "correct" | "present" | "absent" | "empty"
