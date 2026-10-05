import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

interface WheelModalState {
  wasOpened: boolean
}

const initialState = {
  wasOpened: false,
} as WheelModalState

const wheelModal = createSlice({
  name: "wheelModal",
  initialState,
  reducers: {
    setWheelModalOpened: (state, action: PayloadAction<boolean>) => {
      state.wasOpened = action.payload
    },
  },
})

export const { setWheelModalOpened } = wheelModal.actions
export default wheelModal.reducer
