import { api } from "./core"

import {
  DropCriteria,
  UserDropCriteriaProgress,
  CriteriaType,
  UserCahorta,
} from "@/types/drop"

export const dropApi = api.injectEndpoints({
  endpoints: (build) => ({
    getDropCriteria: build.query<Record<CriteriaType, DropCriteria[]>, void>({
      query: () => ({
        url: "drop/criteria",
        method: "GET",
      }),
    }),
    getDropProgress: build.query<UserDropCriteriaProgress[], void>({
      query: () => ({
        url: "drop/progress",
        method: "GET",
      }),
    }),
    getCriteriaDiscounts: build.query<UserCahorta, void>({
      query: () => ({
        url: "drop/discount",
        method: "GET",
      }),
    }),
    makeTemplate: build.mutation<
      number,
      {
        buyNutPass: boolean
        buyCourse: boolean
        buyPassLevel: boolean
        buyGames: boolean
        buyWheels: boolean
        buyNftMints: boolean
      }
    >({
      query: (body) => ({
        url: "drop/discount/template",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetDropCriteriaQuery,
  useGetDropProgressQuery,
  useGetCriteriaDiscountsQuery,
  useMakeTemplateMutation,
} = dropApi
