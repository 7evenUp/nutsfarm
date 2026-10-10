import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

export interface RefPageNumber {
  value: number
}

const initialState = {
  value: 1,
} as RefPageNumber

const refPageNumber = createSlice({
  name: "refPageNumber",
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.value = action.payload
    },
  },
})

export const { setPage } = refPageNumber.actions
export default refPageNumber.reducer
