import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

export interface StoryState {
  openedStoryId: string | null
}

const initialState = {
  openedStoryId: null,
} as StoryState

const story = createSlice({
  name: "story",
  initialState,
  reducers: {
    setOpenedStoryId: (state, action: PayloadAction<string | null>) => {
      state.openedStoryId = action.payload
    },
  },
})

export const { setOpenedStoryId } = story.actions
export default story.reducer
