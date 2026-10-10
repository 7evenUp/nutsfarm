import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export type PerformanceState = {
  telegramPerformanceClass: "LOW" | "AVERAGE" | "HIGH" | "UNKNOWN"
}

const initialState: PerformanceState = {
  telegramPerformanceClass: "UNKNOWN",
}

const performanceSlice = createSlice({
  name: "performance",
  initialState,
  reducers: {
    setTelegramPerformanceClass(
      state,
      action: PayloadAction<PerformanceState["telegramPerformanceClass"]>,
    ) {
      state.telegramPerformanceClass = action.payload
    },
  },
})

export const { setTelegramPerformanceClass } = performanceSlice.actions
export default performanceSlice.reducer
