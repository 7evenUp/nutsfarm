import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { UserGameLevelDifficultyInfo } from "@/types/games"
import { SkinType } from "@/types/cryptle"

export interface GameData extends UserGameLevelDifficultyInfo {
  levelNumber: number
}

export interface GameState {
  gameData: GameData | null
  skin: SkinType
}

const initialState = {
  gameData: null,
  skin: "DEFAULT",
} as GameState

const game = createSlice({
  name: "game",
  initialState,
  reducers: {
    setGameData: (
      state,
      action: PayloadAction<GameData | null>,
    ) => {
      state.gameData = action.payload
    },
    setSkin: (state, action: PayloadAction<SkinType>) => {
      state.skin = action.payload
    },
  },
})

export const { setGameData, setSkin } = game.actions
export default game.reducer
