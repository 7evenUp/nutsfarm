import { createSlice, PayloadAction } from "@reduxjs/toolkit"

type PerformanceState = {
  telegramPerformanceClass: "LOW" | "AVERAGE" | "HIGH" | "UNKNOWN"
}

const initialState: PerformanceState = {
  telegramPerformanceClass: "UNKNOWN",
}

export const performanceSlice = createSlice({
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
