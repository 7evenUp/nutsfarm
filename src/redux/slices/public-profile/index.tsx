import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

interface LessonState {
  openedProfileId: string | null
}

const initialState = {
  openedProfileId: null,
} as LessonState

const publicProfile = createSlice({
  name: "publicProfile",
  initialState,
  reducers: {
    setOpenedProfileId: (state, action: PayloadAction<string | null>) => {
      state.openedProfileId = action.payload
    },
  },
})

export const { setOpenedProfileId } = publicProfile.actions
export default publicProfile.reducer
