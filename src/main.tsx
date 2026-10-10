import "./demo/environment"
import React from "react"
import ReactDOM from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"

import Providers from "./components/Providers.tsx"
import { ErrorPage } from "./ErrorPage.tsx"
import Layout from "./components/Layout.tsx"
import DemoControls from "./demo/DemoControls"
import { api } from "./redux/api/core"
import { store } from "./redux/store"

// const Home = lazy(() => import("./modules/Home"))
// const Tasks = lazy(() => import("./modules/Tasks"))
// const Earn = lazy(() => import("./modules/Earn"))
// const NutsPass = lazy(() => import("./modules/NutsPass"))
// const Friends = lazy(() => import("./modules/Friends"))
import Home from "./modules/Home"
import Tasks from "./modules/Tasks"
import Earn from "./modules/Earn"
import NutsPass from "./modules/NutsPassV2"
import Friends from "./modules/Friends"
import Games from "./modules/Games"
import PuzzlesMenu from "./modules/Games/Mini-games/Puzzles"
import PuzzlesGameplay from "./modules/Games/Mini-games/Puzzles/core/index.tsx"
import FlipCardsMenu from "./modules/Games/Mini-games/FlipCards"
import FlipCardsGameplay from "./modules/Games/Mini-games/FlipCards/core"
import WordleMenu from "./modules/Games/Mini-games/Wordle/index.tsx"
import WordleGameplay from "./modules/Games/Mini-games/Wordle/core/index.tsx"

import "./lib/i18n.ts"
import "./index.css"

// Refresh all local data after a demo action, including untagged legacy queries.
api.enhanceEndpoints({
  endpoints: Object.fromEntries(
    Object.keys(api.endpoints).map((name) => [
      name,
      (definition: { type?: string; providesTags?: string[] }) => {
        if (definition.type !== "mutation") definition.providesTags = ["DEMO"]
      },
    ]),
  ),
})
window.addEventListener("nutsfarm:demo-updated", () => {
  setTimeout(() => store.dispatch(api.util.invalidateTags(["DEMO"])), 0)
})

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      {
        path: "earn",
        element: <Earn />,
      },
      {
        path: "earn/:lessonId",
        element: <Earn />,
      },
      {
        path: "tasks",
        element: <Tasks />,
      },
      {
        path: "pass",
        element: <NutsPass />,
      },
      {
        path: "friends",
        element: <Friends />,
      },
      {
        path: "games",
        element: <Games />,
      },
      {
        path: "games/puzzles",
        element: <PuzzlesMenu />,
      },
      {
        path: "games/puzzles/gameplay",
        element: <PuzzlesGameplay />,
      },
      {
        path: "games/flip-cards",
        element: <FlipCardsMenu />,
      },
      {
        path: "games/flip-cards/gameplay",
        element: <FlipCardsGameplay />,
      },
      {
        path: "games/cryptle",
        element: <WordleMenu />,
      },
      {
        path: "games/cryptle/gameplay",
        element: <WordleGameplay />,
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Providers>
      <RouterProvider router={router} />
      <DemoControls />
    </Providers>
  </React.StrictMode>,
)
