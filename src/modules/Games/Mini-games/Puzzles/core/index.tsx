import fallbackImage from "@/assets/images/home-image.png"
import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import Fireworks from "react-canvas-confetti/dist/presets/fireworks"
import { TConductorInstance } from "react-canvas-confetti/dist/types"

import ArrowLeftIcon from "@/assets/icons/arrow-left.svg?react"
import LevelBadge from "@/assets/games/puzzles/icons/level-badge.svg?react"
import Hourglass from "@/modules/Games/Mini-games/Puzzles/assets/images/hourglass.png"

import CanvasPuzzle from "./CorePuzzle"

import Defeat from "../modals/Defeat"
import Victory from "../modals/Victory"

import {
  useClaimLevelMutation,
  useFailLevelMutation,
  useGetNewLevelsInfiniteQuery,
  useGetStartedLevelsQuery,
} from "@/redux/api/games"
import { useGetCurrentUserQuery } from "@/redux/api/user"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { setGameData } from "@/redux/slices/puzzles"

import { getMinutes, getSeconds } from "@/utils/date"

import { encryptToken } from "@/utils/encrypt"
import { Sound } from "@/utils/Sound"

import { BackButton, initBackButton } from "@/demo/telegram-sdk"

let backButton: BackButton

if (true) {
  try {
    const [initializedBackButton] = initBackButton()
    backButton = initializedBackButton
  } catch {
    /* empty */
  }
}

const S3CloudUrl =
  import.meta.env.VITE_IS_DEV_LOCAL === undefined
    ? ""
    : ""

const winSound = new Sound(
  `${S3CloudUrl}/sounds/games/puzzles/puzzles-victory.mp3`,
)
const defeatSound = new Sound(
  `${S3CloudUrl}/sounds/games/puzzles/puzzles-defeat.mp3`,
)

const DELAY_OPEN_VICTORY_MODAL = 1000
const DELAY_OPEN_DEFEAT_MODAL = 250

const validDifficulties = ["EASY", "MEDIUM", "HARD"]

const PuzzlesGameplay = () => {
  const { t } = useTranslation()

  const navigate = useNavigate()

  const timerRef = useRef(0)
  const movesRef = useRef(0)

  const [startTime, setStartTime] = useState<number>(0)
  const [ellapsedTime, setEllapsedTime] = useState<number>(0)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [isTimeOver, setIsTimeOver] = useState(false)
  const [isGameFinished, setIsGameFinished] = useState(false)
  const [isWin, setIsWin] = useState(false)
  const [isLost, setIsLost] = useState(false)
  const [conductor, setConductor] = useState<TConductorInstance>()
  const [difficulty, setDifficulty] = useState<
    "EASY" | "MEDIUM" | "HARD" | null
  >(null)

  const dispatch = useAppDispatch()
  const { gameData } = useAppSelector((state) => state.puzzles)

  const { data: currentUser } = useGetCurrentUserQuery()
  const { refetch: refetchStarted } = useGetStartedLevelsQuery({
    type: "PUZZLES",
  })
  const { refetch: refetchNew } = useGetNewLevelsInfiniteQuery({
    type: "PUZZLES",
  })
  const [claimLevel] = useClaimLevelMutation()
  const [failLevel] = useFailLevelMutation()

  const onInit = ({ conductor }: { conductor: TConductorInstance }) => {
    setConductor(conductor)
  }

  const handleVictory = () => {
    if (gameData === null) return
    if (!currentUser) return

    conductor?.run({ speed: 2 })

    const timePassed = Date.now() - startTime

    if (!isGameFinished && gameData.status !== "COMPLETED") {
      const token = encryptToken(
        gameData.id,
        currentUser.telegramId.toString(),
        "1970.01.01 00:00",
      )

      claimLevel({
        token,
        gameType: "PUZZLES",
        id: gameData.id,
        gameStats: {
          moves: movesRef.current,
          timePassed: Math.floor(timePassed / 1000),
        },
      })
    }

    winSound.play(false, 0.5)
    setIsGameFinished(true)

    setTimeout(() => {
      setIsWin(true)
      setTimeLeft(0)
      conductor?.pause()
    }, DELAY_OPEN_VICTORY_MODAL)
  }

  const handleNextLvlClick = () => {
    reset()
    navigate("/games/puzzles")
  }

  const reset = () => {
    dispatch(setGameData(null))
    setStartTime(0)
    setTimeLeft(0)
    setIsTimeOver(false)
    setIsWin(false)
    setIsLost(false)
    setIsGameFinished(false)
    conductor?.stop()
  }

  const difficultyConfigs = {
    EASY: { rows: 3, columns: 3 },
    MEDIUM: { rows: 4, columns: 4 },
    HARD: { rows: 5, columns: 5 },
  }

  useEffect(() => {
    if (gameData) {
      const difficulty = gameData.difficulty.toUpperCase()

      const levelDuration = gameData.timeLimit || 0

      if (!isNaN(levelDuration)) {
        setTimeLeft(levelDuration)
      }
      setDifficulty(
        validDifficulties.includes(difficulty)
          ? (difficulty as "EASY" | "MEDIUM" | "HARD")
          : "EASY",
      )
    } else {
      setDifficulty(null)
      conductor?.stop()
    }
  }, [gameData])

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    if (startTime > 0 && !isWin && !isGameFinished) {
      intervalId = setInterval(() => {
        setEllapsedTime(Date.now() - startTime)
      }, 1000)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [startTime, isWin, isGameFinished])

  // Кнопка ТМА "Назад"
  useEffect(() => {
    if (!backButton) return

    backButton.show()
    const rmListener = backButton.on("click", () => {
      refetchStarted()
      refetchNew()
      navigate("/games/puzzles")
    })

    return () => {
      if (rmListener) {
        backButton.hide()
        rmListener()
      }
    }
  }, [])

  // Отсчёт времени игры
  useEffect(() => {
    const intervalId = setInterval(() => {
      timerRef.current = timerRef.current + 1
    }, 1000)

    return () => {
      clearInterval(intervalId)
    }
  }, [])

  // Timer
  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null

    // Only start the timer if gameData exists AND startTime is not 0
    if (
      gameData &&
      timeLeft > 0 &&
      !isWin &&
      !isGameFinished &&
      startTime !== 0
    ) {
      timerId = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setIsTimeOver(true)
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    }

    return () => {
      if (timerId) clearInterval(timerId)
    }
  }, [gameData, timeLeft, isWin, isGameFinished, startTime]) // Add startTime to dependencies

  // Defeat
  useEffect(() => {
    if (isTimeOver && !isGameFinished) {
      if (!gameData?.id) return
      if (!currentUser) return

      if (gameData.status !== "COMPLETED") {
        const token = encryptToken(
          gameData.id,
          currentUser.telegramId.toString(),
          "1970.01.01 00:00",
        )

        failLevel({
          token,
          gameType: "PUZZLES",
          id: gameData.id,
        })
      }

      defeatSound.play()

      setTimeout(() => {
        setIsLost(true)
      }, DELAY_OPEN_DEFEAT_MODAL)
    }
  }, [isTimeOver])

  // Загрузка звуков
  useEffect(() => {
    winSound.load()
    defeatSound.load()
  }, [])

  useEffect(() => {
    let timeoutId: number = 0

    if (difficulty === null || gameData === null) {
      timeoutId = window.setTimeout(() => navigate("/games/puzzles"), 1000)
    }

    return () => {
      clearTimeout(timeoutId)
    }
  }, [difficulty, gameData])

  if (difficulty === null || gameData === null) return

  return (
    <>
      <div className="fixed inset-0 bg-puzzle-game-back bg-cover bg-center bg-no-repeat h-screen-740:bg-puzzle-game-back-large" />
      <div className="fixed bottom-0 h-[35%] w-full bg-gradient-to-b from-[rgba(186,107,41,0)] via-[rgba(89,42,0,0.435)] via-[45.63%] to-[#432300]" />
      <main className="no-scroll relative flex min-h-screen w-screen flex-1 flex-col items-center overflow-hidden pt-16">
        {import.meta.env.VITE_IS_DEV_LOCAL !== undefined && (
          <Link
            to="/games/puzzles"
            className="flex items-center gap-2 self-start text-sm font-semibold opacity-70 transition-opacity focus:outline-none active:opacity-100"
          >
            <ArrowLeftIcon />
            {t("Назад")}
          </Link>
        )}

        <div className="absolute left-1/2 top-0 flex -translate-x-1/2 flex-col items-center font-extrabold">
          <LevelBadge className="-z-2 absolute left-1/2 top-0 h-[74px] w-[67px] -translate-x-1/2 drop-shadow-[0px_0px_4px_rgba(0,0,0,0.15)] h-screen-620:phone-xsm:h-[94px] h-screen-620:phone-xsm:w-[77px]" />
          <div className="z-2 relative flex flex-col items-center pt-4 font-extrabold text-[#EDC195] h-screen-620:phone-xsm:pt-[22px]">
            <span className="mb-1 font-nunito text-[8px] uppercase drop-shadow-[0px_2px_1px_rgba(0,0,0,0.3)] h-screen-620:phone-xsm:text-[10px]">
              {t("Уровень")}
            </span>
            <span className="-translate-y-2 text-2xl drop-shadow-[0px_2px_1px_rgba(0,0,0,0.3)] h-screen-620:phone-xsm:text-[32px]">
              {gameData?.level}
            </span>
          </div>
        </div>
        <div className="relative mb-6 ml-7 mt-1 flex items-center self-start rounded-lg bg-gradient-to-r from-[#653703b3] to-[#371D00b3] py-[6px] pl-[22px] pr-3 font-bold text-[#FFDFBF] h-screen-620:mt-4 h-screen-620:phone-xsm:mb-8 h-screen-620:phone-xsm:pl-8 h-screen-620:phone-sm-fix:mb-16">
          <img
            src={Hourglass}
            alt="Timer icon"
            className="absolute -left-3 h-9 w-7 h-screen-620:phone-xsm:h-11 h-screen-620:phone-xsm:w-9"
          />
          <span className="text-sm font-bold h-screen-620:phone-xsm:text-base">
            {getMinutes(timeLeft)}:{getSeconds(timeLeft)}
          </span>
        </div>
        <CanvasPuzzle
          onSolved={handleVictory}
          columns={difficultyConfigs[difficulty]?.columns}
          rows={difficultyConfigs[difficulty]?.rows}
          startTime={startTime}
          setStartTime={setStartTime}
          imageSrc={
            gameData.imageUrl ||
            gameData.gameLevelImage ||
            fallbackImage
          }
          movesRef={movesRef}
        />

        <Fireworks onInit={onInit} />

        <Defeat
          open={isLost && !isWin}
          setOpen={setIsLost}
          onClose={handleNextLvlClick}
          wasClaimed={gameData.status === "COMPLETED"}
        />

        <Victory
          open={isWin}
          setOpen={(value) => {
            if (!value) {
              setIsGameFinished(true)
              setTimeLeft(0)
            }
            setIsWin(value)
          }}
          coinsClaimed={gameData?.reward || 0}
          stepsDone={3}
          ellapsedTime={ellapsedTime}
          onClose={handleNextLvlClick}
          wasClaimed={gameData.status === "COMPLETED"}
        />
      </main>
    </>
  )
}

export default PuzzlesGameplay
