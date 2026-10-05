import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

interface CountryCodeState {
  value: string
}

const initialState = {
  value: "",
} as CountryCodeState

const countryCode = createSlice({
  name: "countryCode",
  initialState,
  reducers: {
    setCountryCode: (state, action: PayloadAction<string>) => {
      state.value = action.payload
    },
  },
})

export const { setCountryCode } = countryCode.actions
export default countryCode.reducer
