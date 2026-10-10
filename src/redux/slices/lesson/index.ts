import { LessonProgress, LessonsProgressState } from "@/types/learn"
import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

export interface LessonState {
  openedLessonId: string | null
  lessonsProgress: LessonsProgressState
}

const initialState = {
  openedLessonId: null,
  lessonsProgress: {} as LessonsProgressState,
} as LessonState

const lesson = createSlice({
  name: "lesson",
  initialState,
  reducers: {
    setOpenedLessonId: (state, action: PayloadAction<string | null>) => {
      state.openedLessonId = action.payload
    },
    appendLessonProgress: (state, action: PayloadAction<LessonProgress>) => {
      state.lessonsProgress[action.payload.lessonId] = action.payload
    },
    removeLessonProgress: (state, action: PayloadAction<string>) => {
      const lessonId = action.payload
      delete state.lessonsProgress[lessonId]
    },
  },
})

export const { setOpenedLessonId, appendLessonProgress, removeLessonProgress } =
  lesson.actions
export default lesson.reducer
