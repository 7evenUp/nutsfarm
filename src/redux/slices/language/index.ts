import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

export interface LanguageState {
  value: "RU" | "EN"
}

const initialState = {
  value: "RU",
} as LanguageState

const language = createSlice({
  name: "language",
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<"RU" | "EN">) => {
      state.value = action.payload
    },
  },
})

export const { setLanguage } = language.actions
export default language.reducer
