import { Reward } from "@/types/nutspass"
import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

type RewardStatus = "NOT_ACHIEVED" | "READY_FOR_CLAIM" | "CLAIMED"

interface PassV2State {
  passLevel: number
  currentLevelXp: number
  boxRewards: Reward[]
  openedBoxType: "free" | "premium"
  openedBoxStatus?: RewardStatus | null
  isBuyLevelOpened: boolean
  rewardAbout: (Reward & { status?: RewardStatus }) | null
  isClaimRewardLocked: boolean
}

const initialState = {
  passLevel: 1,
  currentLevelXp: 0,
  boxRewards: [],
  openedBoxType: "free",
  openedBoxStatus: null,
  isBuyLevelOpened: false,
  rewardAbout: null,
  isClaimRewardLocked: false,
} as PassV2State

const passv2 = createSlice({
  name: "passv2",
  initialState,
  reducers: {
    setPassLevel: (state, action: PayloadAction<number>) => {
      state.passLevel = action.payload
    },
    setCurrentLevelXp: (state, action: PayloadAction<number>) => {
      state.currentLevelXp = action.payload
    },
    setBoxRewards: (state, action: PayloadAction<Reward[]>) => {
      state.boxRewards = action.payload
    },
    setIsBuyLevelOpened: (state, action: PayloadAction<boolean>) => {
      state.isBuyLevelOpened = action.payload
    },
    setOpenedBoxType: (state, action: PayloadAction<"free" | "premium">) => {
      state.openedBoxType = action.payload
    },
    setOpenedBoxStatus: (
      state,
      action: PayloadAction<RewardStatus | null | undefined>,
    ) => {
      state.openedBoxStatus = action.payload
    },
    setRewardAbout: (
      state,
      action: PayloadAction<Reward & { status?: RewardStatus }>,
    ) => {
      state.rewardAbout = action.payload
    },
    setIsClaimRewardLocked: (state, action: PayloadAction<boolean>) => {
      state.isClaimRewardLocked = action.payload
    },
  },
})

export const {
  setPassLevel,
  setCurrentLevelXp,
  setBoxRewards,
  setOpenedBoxType,
  setOpenedBoxStatus,
  setIsBuyLevelOpened,
  setRewardAbout,
  setIsClaimRewardLocked,
} = passv2.actions
export default passv2.reducer
