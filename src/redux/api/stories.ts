import { api } from "./core"

import { Story, UserStory } from "@/types/stories"

export const storiesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getStories: build.query<Story[], void>({
      query: () => ({
        url: "story/active",
        method: "GET",
      }),
    }),
    getStoryById: build.query<Story, { storyId: string }>({
      query: ({ storyId }) => ({
        url: "story/" + storyId,
        method: "GET",
      }),
    }),
    getCurrentStories: build.query<UserStory[], void>({
      query: () => ({
        url: "story/current",
        method: "GET",
      }),
      providesTags: ["CURRENT_STORIES"],
    }),
    readStory: build.mutation<number, { storyId: string }>({
      query: ({ storyId }) => ({
        url: "story/read/" + storyId,
        method: "POST",
      }),
      invalidatesTags: ["CURRENT_STORIES"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetStoriesQuery,
  useGetStoryByIdQuery,
  useGetCurrentStoriesQuery,
  useReadStoryMutation,
} = storiesApi
