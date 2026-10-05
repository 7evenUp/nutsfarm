import { api } from "./core"

import { HealthPoints, Module } from "@/types/learn"

export const learnApi = api.injectEndpoints({
  endpoints: (build) => ({
    getActiveModules: build.query<Module[], { lang: string; region: string }>({
      query: ({ lang, region }) => ({
        url: `learn/active?lang=${lang}&region=${region}`,
        method: "GET",
      }),
      providesTags: ["ACTIVE_MODULES"],
      transformResponse: (response: Module[]) => {
        response.forEach((module) => {
          module.lessons.forEach((lesson) => {
            lesson.blocks?.sort((a, b) => a.pageNumber - b.pageNumber)
          })

          module.lessons.sort((a, b) => a.pageNumber - b.pageNumber)
        })

        return response
          .filter((module) => module.isPublished)
          .sort((a, b) => a.pageNumber - b.pageNumber)
      },
    }),
    getHealthPoints: build.query<HealthPoints, void>({
      query: () => "learn/lives",
    }),
    decreaseHealth: build.mutation<void, void>({
      query: () => ({
        url: "learn/lives/decrement",
        method: "POST",
      }),
    }),
    claimLesson: build.mutation<
      void,
      { lessonId: string; mistakes: number; duration: number }
    >({
      query: ({ lessonId, mistakes, duration }) => ({
        url: `learn/claim/${lessonId}?mistakes=${mistakes}&duration=${duration}`,
        method: "POST",
      }),
      invalidatesTags: ["ACTIVE_MODULES"],
    }),
    rateLesson: build.mutation<
      void,
      { lessonId: string; rating: 1 | 2 | 3 | 4 | 5 }
    >({
      query: ({ lessonId, rating }) => ({
        url: "learn/rate/" + lessonId + "?mark=" + rating,
        method: "POST",
      }),
      invalidatesTags: ["ACTIVE_MODULES"],
    }),
    shareLesson: build.mutation<void, { lessonId: string }>({
      query: ({ lessonId }) => ({
        url: "learn/share/" + lessonId,
        method: "POST",
      }),
      invalidatesTags: ["ACTIVE_MODULES"],
    }),
    getPremiumChatLink: build.query<string, void>({
      query: () => ({
        url: "learn/premium-chat-link",
        method: "GET",
        responseHandler: "text",
      }),
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetActiveModulesQuery,
  useGetHealthPointsQuery,
  useDecreaseHealthMutation,
  useClaimLessonMutation,
  useRateLessonMutation,
  useShareLessonMutation,
  useLazyGetPremiumChatLinkQuery,
} = learnApi
