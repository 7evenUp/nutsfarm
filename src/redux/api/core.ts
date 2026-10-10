import { createApi } from "@reduxjs/toolkit/query/react"
import { demoBaseQuery } from "@/demo/backend"

export const api = createApi({
  reducerPath: "api",
  baseQuery: demoBaseQuery,
  refetchOnReconnect: true,
  // refetchOnFocus: true,
  tagTypes: [
    "DEMO",
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
