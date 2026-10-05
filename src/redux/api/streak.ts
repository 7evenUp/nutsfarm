import { api } from "./core"

import { CurrentStreakInfo, StreakMap, UserStreakReward } from "@/types/streak"

export const streakApi = api.injectEndpoints({
  endpoints: (build) => ({
    claimStreak: build.mutation<
      CurrentStreakInfo,
      { timezone: string; payForFreeze: boolean }
    >({
      query: ({ timezone, payForFreeze }) => ({
        url:
          "streak/current/claim?timezone=" +
          timezone +
          "&payForFreeze=" +
          payForFreeze,
        method: "POST",
      }),
    }),
    getStreakMap: build.query<StreakMap, void>({
      query: () => ({
        url: "streak/map",
        method: "GET",
      }),
    }),
    getCurrentStreak: build.query<CurrentStreakInfo, { timezone: string }>({
      query: ({ timezone }) => ({
        url: "streak/current/info?timezone=" + timezone,
        method: "GET",
      }),
    }),
    getRewardList: build.query<UserStreakReward[], void>({
      query: () => ({
        url: "streak/current/reward/list",
        method: "GET",
      }),
    }),
    claimReward: build.mutation<void, { rewardId: string }>({
      query: ({ rewardId }) => ({
        url: "streak/current/reward/claim/" + rewardId,
        method: "POST",
      }),
    }),
  }),
  overrideExisting: false,
})

export const {
  useClaimStreakMutation,
  useGetStreakMapQuery,
  useGetCurrentStreakQuery,
  useGetRewardListQuery,
  useClaimRewardMutation,
} = streakApi
