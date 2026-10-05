import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

import { UserGameLevelDifficultyInfo } from "@/types/games"

interface FlipCardsGameplayState {
  selectedDifficulty: string | null
  selectedGameId: string | null
  startedDifficulty: UserGameLevelDifficultyInfo | null
  startedIndex: number
}

const initialState = {
  selectedDifficulty: null,
  selectedGameId: null,
  startedDifficulty: null,
  startedIndex: 0,
} as FlipCardsGameplayState

const flipCardsGameplay = createSlice({
  name: "flipCardsGameplay",
  initialState,
  reducers: {
    setDifficulty: (state, action: PayloadAction<string | null>) => {
      state.selectedDifficulty = action.payload
    },
    setSelectedGameId: (state, action: PayloadAction<string | null>) => {
      state.selectedGameId = action.payload
    },
    setStartedDifficulty: (
      state,
      action: PayloadAction<UserGameLevelDifficultyInfo | null>,
    ) => {
      state.startedDifficulty = action.payload
    },
    setStartedIndex: (state, action: PayloadAction<number>) => {
      state.startedIndex = action.payload
    },
  },
})

export const {
  setDifficulty,
  setSelectedGameId,
  setStartedDifficulty,
  setStartedIndex,
} = flipCardsGameplay.actions
export default flipCardsGameplay.reducer
