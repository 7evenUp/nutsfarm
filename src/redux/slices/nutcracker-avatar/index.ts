import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

interface NutcrackerAvatarState {
  nutcrackerAvatarSrc: string | null
}

const initialState = {
  nutcrackerAvatarSrc: null,
} as NutcrackerAvatarState

const nutcrackerAvatar = createSlice({
  name: "nutcrackerAvatar",
  initialState,
  reducers: {
    setNutcrackerAvatar: (state, action: PayloadAction<string | null>) => {
      state.nutcrackerAvatarSrc = action.payload
    },
  },
})

export const { setNutcrackerAvatar } = nutcrackerAvatar.actions
export default nutcrackerAvatar.reducer
