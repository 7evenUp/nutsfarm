import { api } from "./core"

import { TransactionHistoryResponse, UserMainInfo } from "@/types/user"
import { ReferralResponse } from "@/types/referral-info"

interface VerifyTonPayload {
  address: string
  walletStateInit: string
  stateInit: {
    name: string
    proof: {
      timestamp: string
      signature: string
      payload: string
      domain: { lengthBytes: number; value: string }
    }
  }
  walletType: string
}

export const userApi = api.injectEndpoints({
  endpoints: (build) => ({
    verifyTon: build.mutation<void, VerifyTonPayload>({
      query: (body) => ({
        url: "user/tonWallet",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CURRENT_USER"],
      transformErrorResponse: (response) => ({
        // @ts-expect-error No-Error-Types
        message: response.data.detail,
        // @ts-expect-error No-Error-Types
        errorCode: response.data.code,
      }),
    }),
    registerUnion: build.mutation<void, void>({
      query: () => ({
        url: "user/current/registerUnion",
        method: "POST",
      }),
      invalidatesTags: ["CURRENT_USER"],
    }),
    getCurrentUser: build.query<UserMainInfo, void>({
      query: () => ({
        url: "user/current",
        method: "GET",
      }),
      providesTags: ["CURRENT_USER"],
    }),
    getReferrals: build.query<ReferralResponse, { page: number; size: number }>(
      {
        query: ({ page, size }) => ({
          url: "user/current/referrals?page=" + page + "&size=" + size,
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
      },
    ),
    getReferralPoints: build.query<number, void>({
      query: () => ({
        url: "user/current/referrals/amount",
        method: "GET",
      }),
      providesTags: ["REF_POINTS"],
    }),
    claimReferralPoints: build.mutation<number, void>({
      query: () => ({
        url: "user/current/referrals/claim",
        method: "POST",
      }),
      invalidatesTags: ["LAST_REF_CLAIM", "REF_POINTS", "CURRENT_USER"],
    }),
    getLastClaimTime: build.query<string, void>({
      query: () => ({
        url: "user/current/referrals/time",
        method: "GET",
      }),
      providesTags: ["LAST_REF_CLAIM"],
    }),
    rerollPicture: build.mutation<string, void>({
      query: () => ({
        url: "user/current/picture/roll",
        method: "POST",
        responseHandler: (response) => response.text(),
      }),
      invalidatesTags: ["CURRENT_USER"],
    }),
    getTransactions: build.infiniteQuery<
      TransactionHistoryResponse,
      void,
      number
    >({
      query: ({ pageParam }) => ({
        url: "user/current/transactions",
        method: "GET",
        params: {
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
    }),
    finishOnboarding: build.mutation<void, void>({
      query: () => ({
        url: "user/current/onboarding/update",
        method: "POST",
        params: { isCryptonOnboardingPassed: true },
      }),
    }),
    changeLanguage: build.mutation<void, { lang: "RU" | "EN" }>({
      query: ({ lang }) => ({
        url: "user/current/lang/update",
        method: "POST",
        params: { lang },
      }),
    }),
    sendUtmData: build.mutation<void, Record<string, string>>({
      query: (body) => ({
        url: "user/current/utm/update",
        method: "POST",
        body,
      }),
    }),
    sendPush: build.mutation<void, void>({
      query: () => ({
        url: "user/push/start/send",
        method: "POST",
      }),
    }),
  }),
  overrideExisting: false,
})

export const {
  useVerifyTonMutation,
  useRegisterUnionMutation,
  useGetCurrentUserQuery,
  useGetReferralsQuery,
  useGetReferralPointsQuery,
  useClaimReferralPointsMutation,
  useGetLastClaimTimeQuery,
  useRerollPictureMutation,
  useGetTransactionsInfiniteQuery,
  useFinishOnboardingMutation,
  useChangeLanguageMutation,
  useSendUtmDataMutation,
  useSendPushMutation,
} = userApi
