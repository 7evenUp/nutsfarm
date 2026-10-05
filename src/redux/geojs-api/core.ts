import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const geojsApi = createApi({
  reducerPath: "geojs-api",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://get.geojs.io/v1",
  }),
  refetchOnReconnect: true,
  tagTypes: ["User"],
  endpoints: () => ({}),
})
