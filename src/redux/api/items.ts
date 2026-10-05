import { api } from "./core"

import { AssembledResult, AssemblePart } from "@/types/assembled-parts"
import { Booster } from "@/types/item"

export const itemsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAssembleParts: build.query<AssemblePart[], void>({
      query: () => ({
        url: "items/assemble/current",
        method: "GET",
      }),
      providesTags: ["ASSEMBLE_PARTS"],
    }),
    assemblePart: build.mutation<AssembledResult, { id: string }>({
      query: ({ id }) => ({
        url: `items/assemble/${id}`,
        method: "POST",
      }),
      invalidatesTags: ["ASSEMBLE_PARTS"],
    }),
    getBoosters: build.query<Booster[], void>({
      query: () => ({
        url: "items/boost/current",
        method: "GET",
      }),
      providesTags: ["BOOSTERS"],
    }),
    activateBooster: build.mutation<void, Pick<Booster, "userBoostId">>({
      query: ({ userBoostId }) => ({
        url: `items/boost/${userBoostId}/activate`,
        method: "POST",
      }),
      invalidatesTags: ["BOOSTERS"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetAssemblePartsQuery,
  useAssemblePartMutation,
  useGetBoostersQuery,
  useActivateBoosterMutation,
} = itemsApi
