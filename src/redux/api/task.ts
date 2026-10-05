import { api } from "./core"

import {
  UserTask,
  TaskType,
  ActiveTask,
  ClaimResponse,
  ClaimPayload,
} from "@/types/task"

interface StartPayload {
  type: TaskType
  taskId: string
  lang: string
}

export const taskApi = api.injectEndpoints({
  endpoints: (build) => ({
    getActiveTasks: build.query<
      ActiveTask[],
      { lang: string; region: string; showHomeTask: boolean }
    >({
      query: ({ lang, region, showHomeTask }) => ({
        url: `task/active?lang=${lang}&region=${region}&showHomeTask=${showHomeTask}`,
        method: "GET",
      }),
      providesTags: ["ACTIVE_TASKS"],
    }),
    getCurrentTasks: build.query<UserTask[], { lang: string }>({
      query: ({ lang }) => ({
        url: `task/current?lang=${lang}`,
        method: "GET",
      }),
      providesTags: ["CURRENT_TASKS"],
    }),
    startTask: build.mutation<UserTask, StartPayload>({
      query: (body) => ({
        url: "task/start",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ACTIVE_TASKS", "CURRENT_TASKS"],
    }),
    // verifyTask: build.mutation<UserTask, VerifyPayload>({
    //   query: (body) => ({
    //     url: "task/verify",
    //     method: "POST",
    //     body,
    //   }),
    //   invalidatesTags: ["CURRENT_TASKS"],
    // }),
    claimTask: build.mutation<ClaimResponse, ClaimPayload>({
      query: (body) => ({
        url: "task/claim",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CURRENT_TASKS", "CURRENT_USER"],
    }),
    hideNotification: build.mutation<void, void>({
      query: () => ({
        url: "task/current/notification/hide",
        method: "POST",
      }),
      invalidatesTags: ["CURRENT_USER"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetActiveTasksQuery,
  useGetCurrentTasksQuery,
  useStartTaskMutation,
  // useVerifyTaskMutation,
  useClaimTaskMutation,
  useHideNotificationMutation,
} = taskApi
