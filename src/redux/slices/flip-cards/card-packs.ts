import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

import { CardsPackBody } from "@/types/games"

interface CardPacksState {
  chosenPackId: number | null
  chosenPackTitle: string
  packBody: CardsPackBody[]
  packBonus: number
}

const initialState = {
  chosenPackId: null,
  chosenPackTitle: "",
  packBody: [],
  packBonus: 1,
} as CardPacksState

const cardPacks = createSlice({
  name: "cardPacks",
  initialState,
  reducers: {
    setPackId: (state, action: PayloadAction<number>) => {
      state.chosenPackId = action.payload
    },
    setPackBody: (state, action: PayloadAction<CardsPackBody[]>) => {
      state.packBody = action.payload
    },
    setPackTitle: (state, action: PayloadAction<string>) => {
      state.chosenPackTitle = action.payload
    },
    setPackBonus: (state, action: PayloadAction<number>) => {
      state.packBonus = action.payload
    },
  },
})

export const { setPackId, setPackBody, setPackTitle, setPackBonus } =
  cardPacks.actions
export default cardPacks.reducer
