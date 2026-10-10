import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { UserGameLevelDifficultyInfo } from "@/types/games"

export interface ExtendedGameLevelInfo extends UserGameLevelDifficultyInfo {
  imageUrl?: string
  timeLimit?: number
}

export interface GameState {
  gameData: ExtendedGameLevelInfo | null
  notEnoughEnergyModalOpen: boolean
}

const initialState: GameState = {
  gameData: null,
  notEnoughEnergyModalOpen: false,
}

const puzzles = createSlice({
  name: "puzzles",
  initialState,
  reducers: {
    setGameData: (
      state,
      action: PayloadAction<ExtendedGameLevelInfo | null>,
    ) => {
      state.gameData = action.payload
    },
    setNotEnoughEnergyModalOpen: (state, action: PayloadAction<boolean>) => {
      state.notEnoughEnergyModalOpen = action.payload
    },
  },
})

export const { setGameData, setNotEnoughEnergyModalOpen } = puzzles.actions
export default puzzles.reducer
