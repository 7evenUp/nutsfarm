import { readStorage, writeStorage } from "@/demo/storage"
import {
  BackButton,
  initBackButton,
  initCloudStorage,
  RemoveEventListenerFn,
} from "@/demo/telegram-sdk"
import { Sound } from "@/utils/Sound"

import { useEffect, useLayoutEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import CryptleLogo from "@/assets/games/cryptle/icons/сryptle-logo.svg?react"
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg?react"

import LevelMap from "./level-map"
import BottomButtons from "./BottomButtons"

import {
  useGetNewLevelsInfiniteQuery,
  useGetStartedLevelsQuery,
} from "@/redux/api/games"
import { useAppDispatch } from "@/redux/hooks"
import { setSkin } from "@/redux/slices/games"

import { SkinType } from "@/types/cryptle"

import { cn } from "@/lib/cn"

const BetSound = new Sound("/sounds/games/cryptle/cryptle-select-bet.mp3")

// @ts-expect-error Not-in-telegram-environment
let cloudStorage
let backButton: BackButton

if (true) {
  try {
    const [initializedBackButton] = initBackButton()
    backButton = initializedBackButton
    cloudStorage = initCloudStorage()
  } catch {
    /* empty */
  }
}

const WordleMenu = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [, setSoundsLoaded] = useState(false)

  const { data: startedLevels } = useGetStartedLevelsQuery({ type: "WORDLY" })
  const { data: newLevelsData } = useGetNewLevelsInfiniteQuery({
    type: "WORDLY",
  })

  const newLevels = useMemo(() => {
    return newLevelsData?.pages.flat() ?? []
  }, [newLevelsData])

  useLayoutEffect(() => {
    Promise.all([BetSound.load()]).then(() => setSoundsLoaded(true))
  }, [])

  useEffect(() => {
    const loadSkin = async () => {
      try {
        let savedSkin: SkinType | null = null

        if (import.meta.env.VITE_IS_DEV_LOCAL !== undefined) {
          savedSkin = readStorage(
            "nutsfarm-demo:cryptleSkin",
          ) as SkinType | null
        } else {
          // @ts-expect-error Not-in-telegram-environment
          savedSkin = await cloudStorage.get("cryptleSkin")
        }

        dispatch(setSkin(savedSkin || "DEFAULT"))

        if (savedSkin) return
        writeStorage("nutsfarm-demo:cryptleSkin", "DEFAULT")
      } catch (error) {
        dispatch(setSkin("DEFAULT"))
      }
    }

    loadSkin()
  }, [])

  useEffect(() => {
    if (!backButton) return

    backButton.show()
    const rmListener: RemoveEventListenerFn = backButton.on("click", () => {
      navigate("/games")
    })

    return () => {
      if (rmListener) {
        rmListener()
        backButton.hide()
      }
    }
  }, [navigate])

  return (
    <>
      <div className="fixed top-0 z-[1] h-[100vh] w-full bg-gradient-to-b from-[#8D62F8] to-[#8FBCFD]" />
      <main
        className={cn(
          "no-scroll relative z-40 flex min-h-screen w-screen flex-1 flex-col items-center overflow-hidden bg-[url(/images/games/cryptle-pattern-bg-huge.svg)] bg-[center_5px] bg-repeat-y px-4", //bg-cryptle-level-map-back bg-cover bg-repeat-y
          Telegram.WebApp.platform === "tdesktop" ||
            Telegram.WebApp.platform === "macos"
            ? "pt-16"
            : "pt-16 phone-xsm:pt-[72px] phone-sm:pt-20",
        )}
      >
        {import.meta.env.VITE_IS_DEV_LOCAL !== undefined && (
          <Link
            to="/games"
            className="flex items-center gap-2 self-start text-sm font-semibold opacity-70 transition-opacity focus:outline-none active:opacity-100"
          >
            <ArrowLeftIcon />
            Назад
          </Link>
        )}

        <CryptleLogo className="absolute translate-y-2" />

        {newLevels && startedLevels && (
          <LevelMap
            newLevels={newLevels}
            startedItems={startedLevels}
            betSound={BetSound}
          />
        )}

        {/* гРАДиенТ в нижнЕй части экрана */}
        <div className="pointer-events-none fixed bottom-0 z-50 flex h-32 w-full bg-gradient-to-b from-[#8FAFFD]/0 to-[#8FAFFD]" />

        <BottomButtons />
      </main>
    </>
  )
}

export default WordleMenu
