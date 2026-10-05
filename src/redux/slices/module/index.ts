import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

interface SelectedModuleState {
  selectedModuleId: string | null
}

const initialState = {
  selectedModuleId: null,
} as SelectedModuleState

const selectedModule = createSlice({
  name: "selectedModule",
  initialState,
  reducers: {
    setSelectedModuleId: (state, action: PayloadAction<string | null>) => {
      state.selectedModuleId = action.payload
    },
  },
})

export const { setSelectedModuleId } = selectedModule.actions
export default selectedModule.reducer
