import {
  BackButton,
  initBackButton,
  RemoveEventListenerFn,
} from "@/demo/telegram-sdk"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useWordle } from "./hooks/useWordle"
import { Board } from "./components/Board"
import { Keyboard } from "./components/KeyBoard"
import { SELECTED_LANGUAGE } from "./constants"

import WinLevelModal from "../modals/win-level"
import GameRulesModal from "../modals/game-rules"
import SkinsSelectModal from "../modals/skin-select"
import FailedLevelModal from "../modals/failed-level"

import LevelBadge from "@/modules/Games/components/level-badge"

import { useAppSelector } from "@/redux/hooks"
import {
  useClaimLevelMutation,
  useFailLevelMutation,
  useGetNewLevelsInfiniteQuery,
  useGetStartedLevelsQuery,
} from "@/redux/api/games"

import { cn } from "@/lib/cn"
import { encryptToken } from "@/utils/encrypt"
import { useGetCurrentUserQuery } from "@/redux/api/user"

let backButton: BackButton

if (true) {
  try {
    const [initializedBackButton] = initBackButton()
    backButton = initializedBackButton
  } catch {
    /* empty */
  }
}

const Wordle = () => {
  const navigate = useNavigate()

  const [rulesOpen, setRulesOpen] = useState(false)
  const [selectOpen, setSelectOpen] = useState(false)

  const { value } = useAppSelector((state) => state.language)
  const { gameData, skin } = useAppSelector((state) => state.game)
  const {
    gameState,
    handleKeyPress,
    getCellStatus,
    getKeyStatus,
    getKeyboardLayout,
  } = useWordle({
    gameData,
    lang: value,
  })

  const [failLevel] = useFailLevelMutation()
  const { data: currentUser } = useGetCurrentUserQuery()
  const { refetch: refetchStarted } = useGetStartedLevelsQuery({
    type: "WORDLY",
  })
  const [, { data: claimData, isLoading: isStartClaimLoading }] =
    useClaimLevelMutation({ fixedCacheKey: "claimCryptle" })
  const { refetch: refetchNew } = useGetNewLevelsInfiniteQuery({
    type: "WORDLY",
  })

  useEffect(() => {
    const failOnBackbutton = async (difficultyId: string) => {
      if (!currentUser) return
      if (!gameData) return

      // Блокировка fail уровня если он уже клеймится или был зайклеймлен
      if (claimData) return
      if (isStartClaimLoading) return

      try {
        const token = encryptToken(
          difficultyId,
          currentUser.telegramId.toString(),
          "1970.01.01 00:00",
        )

        failLevel({
          token,
          gameType: "WORDLY",
          id: gameData.id,
        }).unwrap()
      } catch (error) {
        console.log("error")
      }
    }

    if (!backButton) return

    backButton.show()
    const rmListener: RemoveEventListenerFn = backButton.on("click", () => {
      if (gameData) {
        failOnBackbutton(gameData.gameLevelDifficultyId)
      }
      refetchStarted()
      refetchNew()

      navigate("/games/cryptle")
    })

    return () => {
      if (rmListener) {
        rmListener()
        backButton.hide()
      }
    }
  }, [navigate, claimData, isStartClaimLoading])

  useEffect(() => {
    if (!gameData) navigate("/games/cryptle")
  }, [gameData, navigate])

  return (
    <main
      className={cn(
        "no-scroll flex min-h-screen w-screen flex-1 flex-col items-center overflow-y-auto bg-cryptle-game-back bg-cover bg-center pt-24 text-white phone-xsm:pt-28 phone-sm-fix:pt-32",
        skin === "GREEN" && "bg-cryptle-game-back-green-skin",
        skin === "PURPLE" && "bg-cryptle-game-back-purple-skin",
      )}
    >
      <button
        className="absolute left-4 top-16 z-20 rounded-lg bg-black/30 px-3 py-2 text-sm"
        onClick={async () => {
          if (gameData && !claimData && !isStartClaimLoading)
            await failLevel({
              id: gameData.id,
              gameType: "WORDLY",
              token: encryptToken(
                gameData.gameLevelDifficultyId,
                "1337",
                "1970.01.01 00:00",
              ),
            })
          navigate("/games/cryptle")
        }}
      >
        {value === "RU" ? "Назад" : "Back"}
      </button>
      <div className="absolute top-0">
        <LevelBadge
          level={gameData?.levelNumber}
          primaryColor="#23543A"
          secondaryColor="#90AD66"
          theme={skin}
        />
      </div>

      <Board
        guesses={gameState.guesses}
        currentGuess={gameState.currentGuess}
        getCellStatus={getCellStatus}
        skin={skin}
        shouldShake={gameState.invalidWord}
      />

      <Keyboard
        onKeyPress={handleKeyPress}
        getKeyStatus={getKeyStatus}
        keyboardLayout={getKeyboardLayout()}
        language={SELECTED_LANGUAGE}
        skin={skin}
      />

      <WinLevelModal
        isBet={gameState.isBet}
        isBetWin={gameState.isBetwon}
        isBetLose={!gameState.isBetwon}
        reward={gameState.reward}
        betReward={gameState.betReward}
        bet={gameState.bet}
        open={gameState.won}
        onOpenChange={() => undefined}
      />
      <FailedLevelModal
        open={gameState.gameOver}
        onOpenChange={() => undefined}
      />
      <GameRulesModal open={rulesOpen} onOpenChange={setRulesOpen} />
      <SkinsSelectModal
        open={selectOpen}
        onOpenChange={setSelectOpen}
        handlePremiumSkin={() => {
          setSelectOpen(false)
        }}
      />
    </main>
  )
}

export default Wordle
