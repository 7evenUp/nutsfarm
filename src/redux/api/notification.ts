import { api } from "./core"

export const notificationApi = api.injectEndpoints({
  endpoints: (build) => ({
    notifyFriend: build.mutation<void, { userId: string }>({
      query: ({ userId }) => ({
        url: "notification/send/" + userId,
        method: "POST",
      }),
    }),
    notifyUnactiveFriends: build.mutation<void, void>({
      query: () => ({
        url: "notification/send",
        method: "POST",
      }),
      invalidatesTags: ["UNACTIVE_REFERRALS"],
    }),
    getNextUnactiveNotifyTime: build.query<string | null, void>({
      query: () => ({
        url: "notification/time",
        method: "GET",
      }),
      providesTags: ["UNACTIVE_REFERRALS"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useNotifyFriendMutation,
  useNotifyUnactiveFriendsMutation,
  useGetNextUnactiveNotifyTimeQuery,
} = notificationApi
