import { api } from "./core"

import {
  CommitPaymentRequest,
  CommitPaymentResponse,
  DonationGift,
  PaymentItem,
  PurchaseItem,
} from "@/types/payment"

export const paymentApi = api.injectEndpoints({
  endpoints: (build) => ({
    getDonationGifts: build.query<DonationGift[], void>({
      query: () => ({
        url: "payment/donations/gifts",
        method: "GET",
      }),
    }),
    getPaymentItems: build.query<
      PurchaseItem[],
      { type?: PaymentItem } | undefined
    >({
      query: (type) => ({
        url: "payment/items",
        params: type,
        method: "GET",
      }),
      transformResponse: (response: PurchaseItem[]) => {
        return response.filter((item) => item.isActive)
      },
    }),
    commitPayment: build.mutation<CommitPaymentResponse, CommitPaymentRequest>({
      query: ({ id, lang, quantity, objectId }) => ({
        url: "payment/item/" + id + "/stars",
        method: "POST",
        params: { lang, quantity, objectId },
      }),
    }),
    commitNutsPayment: build.mutation<
      CommitPaymentResponse,
      Pick<CommitPaymentRequest, "id">
    >({
      query: ({ id }) => ({
        url: "payment/item/" + id + "/nuts",
        method: "POST",
      }),
    }),
    commitTonPayment: build.mutation<
      CommitPaymentResponse,
      CommitPaymentRequest
    >({
      query: ({ id, lang, quantity, objectId, quantityDouble }) => ({
        url: "payment/item/" + id + "/ton",
        method: "POST",
        params: { lang, quantity, objectId, quantityDouble },
      }),
    }),
    getTransactionStatus: build.query<
      "CREATED" | "FAILED" | "SUCCESS",
      { id: string }
    >({
      query: ({ id }) => ({
        url: "payment/transaction/" + id + "/status",
        method: "GET",
      }),
    }),
    connectDonationWithLesson: build.mutation<
      void,
      { transactionId: string; lessonId?: string }
    >({
      query: ({ transactionId, lessonId }) => ({
        url: "payment/donations/lesson",
        method: "POST",
        params: { transactionId, lessonId },
      }),
    }),
  }),
})

export const {
  useGetDonationGiftsQuery,
  useGetPaymentItemsQuery,
  useCommitPaymentMutation,
  useCommitNutsPaymentMutation,
  useGetTransactionStatusQuery,
  useConnectDonationWithLessonMutation,
  useCommitTonPaymentMutation,
} = paymentApi
