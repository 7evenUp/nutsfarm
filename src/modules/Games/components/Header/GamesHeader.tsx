import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"

import Energy from "./components/Energy"
import Coins from "./components/Coins"
import Wheel from "./components/Wheel"
import Music from "./components/Music"
import Info from "./components/Info"

// import CryptleLuckyWheel from "../../Mini-games/Wordle/modals/LuckyWheel"
// import FlipCardsLuckyWheel from "../../Mini-games/FlipCards/modals/LuckyWheel"
// import PuzzlesLuckyWheel from "../../Mini-games/Puzzles/modals/LuckyWheel"

import FlipCardsHowToPlay from "../../Mini-games/FlipCards/modals/HowToPlay"
import PuzzlesHowToPlay from "../../Mini-games/Puzzles/modals/HowToPlay"
import CryptleHowToPlay from "../../Mini-games/Wordle/modals/game-rules"

import HintModal from "../../Mini-games/Wordle/modals/hint-modal"
import LuckyNuts from "../LuckyNuts"

import { useAppSelector } from "@/redux/hooks"

import { decryptWord } from "@/utils/encrypt"

import { GameTheme } from "@/types/games"

import { cn } from "@/lib/cn"

const GamesHeader = () => {
  const { pathname } = useLocation()

  const lang = useAppSelector((state) => state.language.value)
  const { skin, gameData } = useAppSelector((state) => state.game)

  const [hintData, setHintData] = useState<{
    description: string
    targetWord: string
  } | null>(null)

  const isGameplayMode = pathname.includes("gameplay")

  const isCryptleGameplayMode = pathname.includes("cryptle/gameplay")

  const correctTheme: GameTheme = pathname.includes("puzzles")
    ? isGameplayMode
      ? "puzzles-gameplay"
      : "puzzles"
    : pathname.includes("flip-cards")
      ? "flip-cards"
      : pathname.includes("cryptle")
        ? "cryptle"
        : "default"

  const CorrectWheelModal = LuckyNuts
  // const CorrectWheelModal = pathname.includes("puzzles")
  //   ? PuzzlesLuckyWheel
  //   : pathname.includes("flip-cards")
  //     ? FlipCardsLuckyWheel
  //     : pathname.includes("cryptle")
  //       ? CryptleLuckyWheel
  //       : LuckyNuts

  const CorrectHowToPlayModal = pathname.includes("puzzles")
    ? PuzzlesHowToPlay
    : pathname.includes("flip-cards")
      ? FlipCardsHowToPlay
      : CryptleHowToPlay

  useEffect(() => {
    if (!gameData) return

    const decryptedData = decryptWord(
      gameData.gameLevelDifficultyBody,
      "1970.01.01 00:00",
    )

    const config = JSON.parse(decryptedData)
    setHintData({
      description: lang === "EN" ? config.descriptionEn : config.descriptionRu,
      targetWord:
        lang === "EN"
          ? config.wordEn.toUpperCase()
          : config.wordRu.toUpperCase(),
    })
  }, [gameData])

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 flex items-center",
        pathname === "/games" && "bg-black/50 backdrop-blur-sm",
        Telegram.WebApp.platform === "tdesktop" ||
          Telegram.WebApp.platform === "macos"
          ? "h-16 px-3.5"
          : "h-14 px-4 phone-xsm:h-[62px] phone-sm:h-[68px]",
      )}
    >
      <div className="flex w-full items-center gap-6">
        <div className="flex gap-1.5">
          <Energy theme={correctTheme} />

          {isCryptleGameplayMode && hintData && Telegram.WebApp.initData && (
            <HintModal
              description={hintData.description}
              targetWord={hintData.targetWord}
              theme={skin}
            />
          )}
        </div>
        {!isGameplayMode && <Coins theme={correctTheme} />}

        <div className="ml-auto flex items-center gap-1.5">
          {/* Иконка с колесом */}
          {/* Активна только на картах уровней */}
          {!isGameplayMode && (
            <CorrectWheelModal>
              <Wheel isGamePlay={isCryptleGameplayMode} theme={correctTheme} />
            </CorrectWheelModal>
          )}

          {/* Иконка с музыкой */}
          <Music isGamePlay={isCryptleGameplayMode} theme={correctTheme} />

          {/* Иконка с инфой о том, как играть */}
          {/* На странице пазлов активна всегда */}
          {/* На других страницах только тогда, когда игра запущена */}
          {pathname.includes("puzzles") ? (
            <CorrectHowToPlayModal
              showCloseButton={isGameplayMode ? false : true}
            >
              <Info isGamePlay={isCryptleGameplayMode} theme={correctTheme} />
            </CorrectHowToPlayModal>
          ) : (
            isGameplayMode && (
              <CorrectHowToPlayModal showCloseButton={false}>
                <Info isGamePlay={isCryptleGameplayMode} theme={correctTheme} />
              </CorrectHowToPlayModal>
            )
          )}
        </div>
      </div>
    </header>
  )
}

export default GamesHeader
