import { api } from "./core"

import { LeaderboardResponse } from "@/types/leaderboard"

interface PaginationArgs {
  page: number
  size: number
}

export const leaderboardApi = api.injectEndpoints({
  endpoints: (build) => ({
    getRefLeaderboard: build.query<LeaderboardResponse, PaginationArgs>({
      query: ({ page, size }) => ({
        url: "top/refs?page=" + page + "&size=" + size,
        method: "GET",
      }),
      // Only have one cache entry because the arg always maps to one string
      serializeQueryArgs: ({ endpointName }) => endpointName,
      // Always merge incoming data to the cache entry
      merge: (currentCache, newItems, ...props) => {
        if (props[0].arg.page === 1) {
          return newItems
        } else {
          currentCache.items.push(...newItems.items)
        }
      },
      // Refetch when the page arg changes
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.page !== previousArg?.page,
    }),
    getDonationLeaderboard: build.infiniteQuery<
      LeaderboardResponse,
      void,
      number
    >({
      query: ({ pageParam }) => ({
        url: "top/donation",
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
    getXpLeaderboard: build.infiniteQuery<LeaderboardResponse, void, number>({
      query: ({ pageParam }) => ({
        url: "top/xp",
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
    getXpLeaderboardWithoutDonation: build.infiniteQuery<
      LeaderboardResponse,
      void,
      number
    >({
      query: ({ pageParam }) => ({
        url: "top/xp-without-donation",
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
    getRefsPosition: build.query<string, void>({
      query: () => ({
        url: "top/refs/current/position",
        method: "GET",
        responseHandler: (response) => response.text(),
      }),
    }),
    getDonationPosition: build.query<
      { donationCount: number; place: string },
      void
    >({
      query: () => ({
        url: "top/donation/current/position",
        method: "GET",
      }),
    }),
    getXpPosition: build.query<string, void>({
      query: () => ({
        url: "top/xp/current/position",
        method: "GET",
        responseHandler: (response) => response.text(),
      }),
    }),
    getXpPositionWithoutDonation: build.query<
      { donationCount: number; place: string },
      void
    >({
      query: () => ({
        url: "top/xp-without-donation/current/position",
        method: "GET",
      }),
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetRefLeaderboardQuery,
  useGetRefsPositionQuery,
  useGetDonationLeaderboardInfiniteQuery,
  useGetDonationPositionQuery,
  useGetXpLeaderboardInfiniteQuery,
  useGetXpPositionQuery,
  useGetXpLeaderboardWithoutDonationInfiniteQuery,
  useGetXpPositionWithoutDonationQuery,
} = leaderboardApi
