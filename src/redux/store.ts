import { combineReducers, configureStore } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"

import languageReducer from "./slices/language"
import storyReducer from "./slices/story"
import selectedModuleReducer from "./slices/module"
import lessonReducer from "./slices/lesson"
import gameReducer from "./slices/games"
import healthReducer from "./slices/health"
import refPageNumberReducer from "./slices/refPageNumber"
import countryCodeReducer from "./slices/countryCode"
import publicProfileReducer from "./slices/public-profile"
import nutcrackerAvatarReducer from "./slices/nutcracker-avatar"
import performanceReducer from "./slices/performance"
import cardPacksReducer from "./slices/flip-cards/card-packs"
import flipCardsGameplayReducer from "./slices/flip-cards/gameplay"
import puzzleReducer from "./slices/puzzles"
import passv2Reducer from "./slices/passv2"
import wheelModalReducer from "./slices/wheelModal"

import { api } from "./api/core"
import { geojsApi } from "./geojs-api/core"

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  [geojsApi.reducerPath]: geojsApi.reducer,
  language: languageReducer,
  story: storyReducer,
  lesson: lessonReducer,
  game: gameReducer,
  refPageNumber: refPageNumberReducer,
  countryCode: countryCodeReducer,
  performance: performanceReducer,
  health: healthReducer,
  selectedModule: selectedModuleReducer,
  publicProfile: publicProfileReducer,
  nutcrackerAvatar: nutcrackerAvatarReducer,
  cardPacks: cardPacksReducer,
  flipCardsGameplay: flipCardsGameplayReducer,
  puzzles: puzzleReducer,
  passv2: passv2Reducer,
  wheelModal: wheelModalReducer,
})

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware).concat(geojsApi.middleware),
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
