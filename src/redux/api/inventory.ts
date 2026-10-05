import { api } from "./core"

import { InventoryItem } from "@/types/inventory"
import { Nutcracker } from "@/types/nutcracker"

export const inventoryApi = api.injectEndpoints({
  endpoints: (build) => ({
    getInventory: build.query<InventoryItem[], void>({
      query: () => ({
        url: "inventory/current",
        method: "GET",
      }),
      transformResponse: (response: InventoryItem[]) => {
        return response.sort((a) => (a.status === "READY_TO_CLAIM" ? -1 : 1))
      },
      providesTags: ["INVENTORY"],
    }),
    claimInventoryItem: build.mutation<void, { inventoryId: string }>({
      query: ({ inventoryId }) => ({
        url: "inventory/claim/" + inventoryId,
        method: "POST",
      }),
      invalidatesTags: ["INVENTORY"],
    }),
    hideInventoryNotification: build.mutation<void, void>({
      query: () => ({
        url: "inventory/current/notification/hide",
        method: "POST",
      }),
      invalidatesTags: ["CURRENT_USER"],
    }),
    getNutcrackers: build.query<Nutcracker[], void>({
      query: () => ({
        url: "nutcracker/current",
        method: "GET",
      }),
      // providesTags: ["NUTCRACKER"],
    }),
    mintFreeNFT: build.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `inventory/mint/${id}`,
        method: "POST",
      }),
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetInventoryQuery,
  useClaimInventoryItemMutation,
  useHideInventoryNotificationMutation,
  useGetNutcrackersQuery,
  useMintFreeNFTMutation,
} = inventoryApi
