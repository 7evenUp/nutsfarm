import { api } from "./core"

import { PublicProfileResponse } from "@/types/public-profile"

export const profileApi = api.injectEndpoints({
  endpoints: (build) => ({
    setAvatar: build.mutation<string, string>({
      query: (nutcrackerIndex) => ({
        url: `/nutcracker/${nutcrackerIndex}/picture/set`,
        method: "POST",
        responseHandler: (response) => response.text(),
      }),
    }),
    getPublicProfile: build.query<PublicProfileResponse, { id: string }>({
      query: ({ id }) => ({
        url: `user/info/${id}`,
        method: "GET",
      }),
    }),
  }),
})

export const { useSetAvatarMutation, useGetPublicProfileQuery } = profileApi
