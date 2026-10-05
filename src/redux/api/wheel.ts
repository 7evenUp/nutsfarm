import { api } from "./core"

import { SpinsResponse, WheelReward } from "@/types/wheel"

export const wheelApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAvailableSpins: build.query<SpinsResponse, void>({
      query: () => ({
        url: "wheel/current/spins",
        method: "GET",
      }),
      providesTags: ["WHEEL_SPINS"],
    }),
    getWheelRewards: build.query<WheelReward[], void>({
      query: () => ({
        url: "wheel/rewards",
        method: "GET",
      }),
    }),
    spinWheel: build.mutation<WheelReward[], { amount?: number }>({
      query: ({ amount }) => ({
        url: "wheel/spin",
        method: "POST",
        params: { amount },
      }),
      invalidatesTags: ["WHEEL_SPINS"],
    }),
    spinPremiumWheel: build.mutation<WheelReward[], { amount?: number }>({
      query: ({ amount }) => ({
        url: "wheel/spin/paid",
        method: "POST",
        params: { amount },
      }),
      invalidatesTags: ["WHEEL_SPINS"],
    }),
    getJackpot: build.query<number, void>({
      query: () => ({
        url: "wheel/jackpot",
        method: "GET",
      }),
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetAvailableSpinsQuery,
  useGetWheelRewardsQuery,
  useSpinWheelMutation,
  useSpinPremiumWheelMutation,
  useGetJackpotQuery,
} = wheelApi
