import { api } from "./core"

export const influencerApi = api.injectEndpoints({
  endpoints: (build) => ({
    // Получение списка бирж, для которых можно создать реферальные ссылки
    getRefExchanges: build.query<string[], void>({
      query: () => ({
        url: "influencer/ref/exchanges",
        method: "GET",
      }),
    }),

    // Получение текущих реферальных ссылок
    getRefLinks: build.query<Record<string, string>, { isGifts: boolean }>({
      query: ({ isGifts }) => ({
        url: "influencer/ref/links",
        method: "GET",
        params: { isGifts },
      }),
    }),

    // Создание или обновление реферальных ссылок
    updateRefLinks: build.mutation<
      void,
      { body: Record<string, string>; isGifts: boolean }
    >({
      query: ({ body, isGifts }) => ({
        url: "influencer/ref/links",
        method: "POST",
        body,
        params: { isGifts },
      }),
    }),
  }),
})

// Экспортируем хуки для использования в компонентах
export const {
  useGetRefExchangesQuery,
  useGetRefLinksQuery,
  useUpdateRefLinksMutation,
} = influencerApi
