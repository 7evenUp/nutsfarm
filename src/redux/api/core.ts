import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react"
import { initCloudStorage } from "@telegram-apps/sdk"
import { Mutex } from "async-mutex"

import { AuthTokensResponse } from "./auth"

// @ts-expect-error Not-in-telegram-environment
let cloudStorage

if (Telegram.WebApp.initData) {
  try {
    cloudStorage = initCloudStorage()
  } catch {
    /* empty */
  }
}

// Ендпоинты, которым не нужны access токены
const PUBLIC_ENDPOINTS = ["login", "register", "token", "refresh"]

const mutex = new Mutex()
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.DEV
    ? "https://api.nutsfarm-dev.crypton.team/api/v2"
    : import.meta.env.VITE_API_BASE_URL + "/api/v2",
  prepareHeaders: async (headers, { endpoint }) => {
    if (PUBLIC_ENDPOINTS.includes(endpoint)) {
      return headers
    }

    let token

    if (!Telegram.WebApp.initData) {
      token = sessionStorage.getItem("accessToken")
    } else {
      // @ts-expect-error Not-in-telegram-environment
      token = await cloudStorage.get("accessToken")
    }

    if (token) {
      headers.set("Authorization", "Bearer " + token)
    }

    return headers
  },
})

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // wait until the mutex is available without locking it
  await mutex.waitForUnlock()
  let result = await baseQuery(args, api, extraOptions)

  if (result.error && result.error.status === 403) {
    if (result.meta?.request.url.includes("auth/token")) return result

    let refreshToken

    if (!Telegram.WebApp.initData) {
      refreshToken = sessionStorage.getItem("refreshToken")
    } else {
      // @ts-expect-error Not-in-telegram-environment
      refreshToken = await cloudStorage.get("refreshToken")
    }

    if (!refreshToken) return result
    // checking whether the mutex is locked
    if (!mutex.isLocked()) {
      const release = await mutex.acquire()

      try {
        // try to get a new tokens
        const refreshResult = await baseQuery(
          {
            url: "auth/token",
            method: "POST",
            body: { refreshToken },
          },
          { ...api, endpoint: "token" },
          extraOptions,
        )
        if (refreshResult.data) {
          const { accessToken } = refreshResult.data as AuthTokensResponse

          if (accessToken) {
            // store the new token
            if (!Telegram.WebApp.initData) {
              sessionStorage.setItem("accessToken", accessToken)
            } else {
              // @ts-expect-error Not-in-telegram-environment
              await cloudStorage.set("accessToken", accessToken)
            }

            // retry the initial query
            result = await baseQuery(args, api, extraOptions)
          } else {
            if (!Telegram.WebApp.initData) {
              sessionStorage.removeItem("accessToken")
              sessionStorage.removeItem("refreshToken")
            } else {
              // @ts-expect-error Not-in-telegram-environment
              await cloudStorage.delete("accessToken")
              // @ts-expect-error Not-in-telegram-environment
              await cloudStorage.delete("refreshToken")
            }
          }
        } else {
          if (!Telegram.WebApp.initData) {
            sessionStorage.removeItem("accessToken")
            sessionStorage.removeItem("refreshToken")
          } else {
            // @ts-expect-error Not-in-telegram-environment
            await cloudStorage.delete("accessToken")
            // @ts-expect-error Not-in-telegram-environment
            await cloudStorage.delete("refreshToken")
          }
        }
      } finally {
        // release must be called once the mutex should be released again.
        release()
      }
    } else {
      // wait until the mutex is available without locking it
      await mutex.waitForUnlock()
      result = await baseQuery(args, api, extraOptions)
    }
  }
  return result
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  refetchOnReconnect: true,
  // refetchOnFocus: true,
  tagTypes: [
    "FARMING",
    "ACTIVE_TASKS",
    "CURRENT_TASKS",
    "CURRENT_USER",
    "CURRENT_STORIES",
    "LAST_REF_CLAIM",
    "REF_POINTS",
    "ACTIVE_MODULES",
    "INVENTORY",
    "UNACTIVE_REFERRALS",
    "ACHIEVEMENTS",
    "GAME_ENERGY",
    "WHEEL_SPINS",
    "STARTED_DIFFICULTIES",
    "BOOSTERS",
    "ASSEMBLE_PARTS",
  ],
  endpoints: () => ({}),
})
