import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

export interface HealthState {
  healthPoints: number | null
}

const initialState = {
  healthPoints: 0,
} as HealthState

const health = createSlice({
  name: "health",
  initialState,
  reducers: {
    setHealthPoints: (state, action: PayloadAction<number | null>) => {
      state.healthPoints = action.payload
    },
    loseHealth: (state) => {
      if (state.healthPoints && state.healthPoints > 0) {
        state.healthPoints -= 1
      }
    },
  },
})

export const { setHealthPoints, loseHealth } = health.actions
export default health.reducer
