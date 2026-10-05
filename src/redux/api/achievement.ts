import { api } from "./core"

import { Achievement } from "@/types/achievements"

export const achievementsApi = api.injectEndpoints({
  endpoints: (build) => ({
    claimAchievement: build.mutation<void, { achievementId: number }>({
      query: ({ achievementId }) => ({
        url: `achievement/${achievementId}/claim`,
        method: "POST",
      }),
      invalidatesTags: ["ACHIEVEMENTS"],
    }),
    getAchievements: build.query<Achievement[], void>({
      query: () => ({
        url: "achievement/current",
        method: "GET",
      }),
      providesTags: ["ACHIEVEMENTS"],
    }),
    hideAchievementNotification: build.mutation<void, void>({
      query: () => ({
        url: "achievement/current/notification/hide",
        method: "POST",
      }),
      invalidatesTags: ["CURRENT_USER"],
    }),
    clickEasterEgg: build.mutation<void, void>({
      query: () => ({
        url: "achievement/easter/egg/click",
        method: "POST",
      }),
      invalidatesTags: ["ACHIEVEMENTS", "CURRENT_USER"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useClaimAchievementMutation,
  useGetAchievementsQuery,
  useHideAchievementNotificationMutation,
  useClickEasterEggMutation,
} = achievementsApi
