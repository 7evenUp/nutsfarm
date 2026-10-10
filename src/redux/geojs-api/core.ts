import { createApi } from "@reduxjs/toolkit/query/react"

export const geojsApi = createApi({
  reducerPath: "geojs-api",
  baseQuery: async () => ({ data: { country: "RU", country_3: "RUS", ip: "127.0.0.1", name: "Demo" } }),
  refetchOnReconnect: true,
  tagTypes: ["User"],
  endpoints: () => ({}),
})
