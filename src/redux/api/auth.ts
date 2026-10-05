import { api } from "./core"

interface RegisterParams {
  authData: string
  language: "RU" | "EN"
  referralCode?: string
}

export interface AuthTokensResponse {
  accessToken: string
  refreshToken: string
  type: string
}

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<AuthTokensResponse, string>({
      query: (queryString) => ({
        url: "auth/login",
        method: "POST",
        body: queryString,
      }),
    }),
    register: build.mutation<AuthTokensResponse, RegisterParams>({
      query: (body) => ({
        url: "auth/register",
        method: "POST",
        body,
      }),
    }),
    refreshAccess: build.mutation<AuthTokensResponse, { refreshToken: string }>(
      {
        query: (body) => ({
          url: "auth/token",
          method: "POST",
          body,
        }),
      },
    ),
    refreshAll: build.mutation<AuthTokensResponse, { refreshToken: string }>({
      query: (body) => ({
        url: "auth/refresh",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: false,
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshAccessMutation,
  useRefreshAllMutation,
} = authApi
