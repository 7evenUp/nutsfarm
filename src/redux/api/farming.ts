import { api } from "./core"

import { FarmingStatus, Retrodrop } from "@/types/farming"

const DELAY_AFTER_SUCCESSFUL_CLAIM_IN_MS = 600

export const farmingApi = api.injectEndpoints({
  endpoints: (build) => ({
    claimFarming: build.mutation<void, void>({
      query: () => ({
        url: "farming/claim",
        method: "POST",
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        await queryFulfilled
        setTimeout(() => {
          dispatch(api.util.invalidateTags(["FARMING", "CURRENT_USER"]))
        }, DELAY_AFTER_SUCCESSFUL_CLAIM_IN_MS)
      },
    }),
    getFarmingStatus: build.query<FarmingStatus, void>({
      query: () => ({
        url: "farming/current",
        method: "GET",
      }),
      providesTags: ["FARMING"],
    }),
    startFarming: build.mutation<void, void>({
      query: () => ({
        url: "farming/farm",
        method: "POST",
      }),
      invalidatesTags: ["FARMING"],
    }),
    claimStartBonus: build.mutation<number, void>({
      query: () => ({
        url: "farming/startBonus",
        method: "POST",
      }),
      invalidatesTags: ["CURRENT_USER"],
    }),
    getDropInfo: build.query<Retrodrop, void>({
      query: () => ({
        url: "farming/drop/info",
        method: "GET",
      }),
    }),
    claimDrop: build.mutation<Retrodrop, void>({
      query: () => ({
        url: "farming/drop/claim",
        method: "POST",
      }),
      invalidatesTags: ["CURRENT_USER"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useClaimFarmingMutation,
  useGetFarmingStatusQuery,
  useStartFarmingMutation,
  useClaimStartBonusMutation,
  useGetDropInfoQuery,
  useClaimDropMutation,
} = farmingApi
