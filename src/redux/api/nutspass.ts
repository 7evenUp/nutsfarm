import { api } from "./core"

import { Reward, LevelRewards } from "@/types/nutspass"

export const nutsPassApi = api.injectEndpoints({
  endpoints: (build) => ({
    getLevelReward: build.query<LevelRewards, { page: number; size: number }>({
      query: ({ page, size }) => {
        return `nutpass/rewards?page=${page}&size=${size}`
      },
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          return newItems
        } else {
          return {
            ...currentCache,
            items: [...currentCache.items, ...newItems.items],
          }
        }
      },
      forceRefetch: ({ currentArg, previousArg }) => {
        return (
          currentArg?.page !== previousArg?.page ||
          currentArg?.size !== previousArg?.size
        )
      },
    }),
    getLevelRewards: build.infiniteQuery<LevelRewards, undefined, number>({
      query: ({ pageParam }) => ({
        url: "nutpass/rewards",
        method: "GET",
        params: {
          size: 50,
          page: pageParam,
        },
      }),
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: (lastPage, _, lastPageParam) =>
          lastPage && lastPage.page * lastPage.size < lastPage.total
            ? lastPageParam + 1
            : undefined,
      },
    }),
    claimPassReward: build.mutation<Reward[], { rewardId: string }>({
      query: ({ rewardId }) => ({
        url: `nutpass/rewards/claim?rewardId=${rewardId}`,
        method: "POST",
      }),
    }),
    hidePassNotification: build.mutation<void, void>({
      query: () => ({
        url: "nutpass/notification/hide",
        method: "POST",
      }),
      invalidatesTags: ["CURRENT_USER"],
    }),
  }),
})

export const {
  useGetLevelRewardQuery,
  useGetLevelRewardsInfiniteQuery,
  useClaimPassRewardMutation,
  useHidePassNotificationMutation,
} = nutsPassApi
