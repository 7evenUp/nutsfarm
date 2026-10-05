import { api } from "./core"

import {
  ClaimLevelRequestArgs,
  GameEnergyResponse,
  GameInventoryItem,
  GameLevel,
  GameTypes,
  LevelsRequestArgs,
  NewLevelsResponse,
  StartedLevelsResponse,
  StartLevelRequestArgs,
  UserGameLevelDifficultyInfo,
} from "@/types/games"

export const gamesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getGameEnergy: build.query<GameEnergyResponse, void>({
      query: () => ({
        url: "game/current/energy",
        method: "GET",
      }),
      providesTags: ["GAME_ENERGY"],
    }),
    getStartedLevels: build.query<
      UserGameLevelDifficultyInfo[],
      { type: GameTypes }
    >({
      query: (args) => ({
        url: "game/current/started",
        method: "GET",
        params: {
          ...args,
          page: 1,
          size: 1,
        },
      }),
      providesTags: ["STARTED_DIFFICULTIES"],
    }),
    getStartedLevelsX: build.infiniteQuery<
      StartedLevelsResponse,
      LevelsRequestArgs & { page?: number; size?: number },
      number
    >({
      query: ({ queryArg, pageParam }) => ({
        url: "game/current/started-test",
        method: "GET",
        params: {
          type: queryArg.type,
          size: 25,
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
      providesTags: ["STARTED_DIFFICULTIES"],
    }),
    getNewLevels: build.infiniteQuery<
      NewLevelsResponse,
      LevelsRequestArgs,
      number
    >({
      query: ({ queryArg, pageParam }) => ({
        url: "game/current/active",
        method: "GET",
        params: {
          type: queryArg.type,
          size: 20,
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
    startLevel: build.mutation<
      UserGameLevelDifficultyInfo,
      StartLevelRequestArgs
    >({
      query: (body) => ({
        url: "game/start",
        method: "POST",
        body,
      }),
      invalidatesTags: ["GAME_ENERGY", "WHEEL_SPINS"],
    }),
    claimLevel: build.mutation<
      UserGameLevelDifficultyInfo,
      ClaimLevelRequestArgs
    >({
      query: (body) => ({
        url: "game/claim",
        method: "POST",
        body,
      }),
      invalidatesTags: ["STARTED_DIFFICULTIES", "CURRENT_USER"],
    }),
    getGameInventory: build.query<GameInventoryItem[], void>({
      query: () => ({
        url: "inventory/current/game",
        method: "GET",
      }),
    }),
    failLevel: build.mutation<
      UserGameLevelDifficultyInfo,
      ClaimLevelRequestArgs
    >({
      query: (body) => ({
        url: "game/fail",
        method: "POST",
        body,
      }),
      invalidatesTags: ["STARTED_DIFFICULTIES"],
    }),
    getLevelById: build.query<GameLevel, { levelId: string }>({
      query: ({ levelId }) => ({
        url: "game/" + levelId,
        method: "GET",
      }),
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetGameEnergyQuery,
  useGetStartedLevelsQuery,
  useGetStartedLevelsXInfiniteQuery,
  useGetNewLevelsInfiniteQuery,
  useStartLevelMutation,
  useClaimLevelMutation,
  useFailLevelMutation,
  useGetGameInventoryQuery,
  useGetLevelByIdQuery,
} = gamesApi
