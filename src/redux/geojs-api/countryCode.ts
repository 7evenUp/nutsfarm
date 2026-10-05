import { geojsApi } from "./core"

interface Response {
  country: string
  country_3: string
  ip: string
  name: string
}

const countryCode = geojsApi.injectEndpoints({
  endpoints: (build) => ({
    getCountryCode: build.query<Response, void>({
      query: () => ({
        url: "ip/country.json",
        method: "GET",
      }),
    }),
  }),
  overrideExisting: false,
})

export const { useGetCountryCodeQuery } = countryCode
