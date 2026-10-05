import { useState, useEffect, useLayoutEffect, useRef } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

import {
  useClaimLevelMutation,
  useFailLevelMutation,
  useGetNewLevelsInfiniteQuery,
} from "@/redux/api/games"
import { useGetCurrentUserQuery } from "@/redux/api/user"

import { Sound } from "@/utils/Sound"
import { encryptToken, decryptWord } from "@/utils/encrypt"

import { CellStatus, GameState } from "@/types/wordle"
import { UserGameLevelDifficultyInfo } from "@/types/games"

import {
  WORD_LENGTH,
  TRIES,
  KEYBOARD_LETTERS_EN,
  KEYBOARD_LETTERS_RU,
} from "../constants"

const S3CloudUrl =
  import.meta.env.VITE_IS_DEV_LOCAL === undefined
    ? "https://s3-nutsfarm.crypton.xyz"
    : "https://s3-nutsfarm-dev.crypton.xyz"

const LetterEnterSound = new Sound(
  `${S3CloudUrl}/sounds/games/cryptle/cryptle-enter-letter.mp3`,
)
const InvalidWordSound = new Sound(
  `${S3CloudUrl}/sounds/games/cryptle/cryptle-incorrect-word.mp3`,
)
const WinGameSound = new Sound(
  `${S3CloudUrl}/sounds/games/cryptle/cryptle-victory.mp3`,
)
const LoseGameSound = new Sound(
  `${S3CloudUrl}/sounds/games/cryptle/cryptle-defeat.mp3`,
)

interface UseWordleProps {
  gameData: UserGameLevelDifficultyInfo | null
  lang: "EN" | "RU"
}

interface GameConfig {
  language: "EN" | "RU"
  description: string
  targetWord: string
  bet?: number
}

const betReverseDependence: { [k: string]: number } = {
  "1": 5,
  "1.25": 4,
  "2": 3,
  "3": 2,
  "10": 1,
}

const dictionaryCache: Record<"RU" | "EN", Set<string> | null> = {
  RU: null,
  EN: null,
}

async function loadDictionary(lang: "RU" | "EN"): Promise<Set<string>> {
  if (dictionaryCache[lang]) return dictionaryCache[lang]!

  const dictFile = `https://s3-nutsfarm-dev.crypton.xyz/cryptle-dictionaries/${lang.toLowerCase()}.txt`

  try {
    const response = await fetch(dictFile)
    if (!response.ok) throw new Error("Dictionary load failed")

    const text: string = await response.text()
    const words: string[] = text.split("\r\n")

    dictionaryCache[lang] = new Set(words)
    return dictionaryCache[lang]!
  } catch (error) {
    console.error(`Failed to load ${lang} dictionary:`, error)
    throw error
  }
}

export async function isWordValid(
  word: string,
  lang: "RU" | "EN",
): Promise<boolean> {
  if (!word || typeof word !== "string") return false

  const normalizedWord = word.toLowerCase().trim()
  if (normalizedWord.length !== 5) return false

  try {
    const dictionary = await loadDictionary(lang)
    return dictionary.has(normalizedWord)
  } catch {
    // Fallback для ошибок загрузки
    return false
  }
}

export const useWordle = ({ gameData, lang }: UseWordleProps) => {
  const { t } = useTranslation()

  const { id, gameLevelDifficultyBody, bet, betRatio, reward } = { ...gameData }

  const timerRef = useRef(0)

  const [failLevel] = useFailLevelMutation()
  const { data: currentUser } = useGetCurrentUserQuery()
  const [claimLevel, { isLoading: isStartClaimLoading }] =
    useClaimLevelMutation({ fixedCacheKey: "claimCryptle" })
  const { refetch: refetchNew } = useGetNewLevelsInfiniteQuery({
    type: "WORDLY",
  })

  const [soundsLoaded, setSoundsLoaded] = useState(false)
  const [gameState, setGameState] = useState<GameState>({
    guesses: [],
    currentGuess: "",
    gameOver: false,
    won: false,
  })

  const [gameConfig, setGameConfig] = useState<GameConfig | null>(() => {
    if (!gameLevelDifficultyBody) {
      return null
    }

    const decryptedData = decryptWord(
      gameLevelDifficultyBody,
      "1970.01.01 00:00",
    )

    const config = JSON.parse(decryptedData)
    return {
      language: lang,
      description: lang === "EN" ? config.descriptionEn : config.descriptionRu,
      targetWord:
        lang === "EN"
          ? config.wordEn.toUpperCase()
          : config.wordRu.toUpperCase(),
      bet: betRatio ? betReverseDependence[betRatio] : undefined,
    }
  })

  useLayoutEffect(() => {
    Promise.all([
      LetterEnterSound.load(),
      InvalidWordSound.load(),
      WinGameSound.load(),
      LoseGameSound.load(),
    ]).then(() => setSoundsLoaded(true))
  }, [])

  useEffect(() => {
    if (gameLevelDifficultyBody) {
      const decryptedData = decryptWord(
        gameLevelDifficultyBody,
        "1970.01.01 00:00",
      )

      const config = JSON.parse(decryptedData)

      setGameConfig({
        language: lang,
        description:
          lang === "EN" ? config.descriptionEn : config.descriptionRu,
        targetWord:
          lang === "EN"
            ? config.wordEn.toUpperCase()
            : config.wordRu.toUpperCase(),
        bet: betRatio ? betReverseDependence[betRatio] : undefined,
      })
      setGameState({
        ...gameState,
        guesses: [],
        currentGuess: "",
        gameOver: false,
        reward: reward,
        bet: bet,
        betReward: bet && betRatio ? bet * betRatio : undefined,
        isBet: !!bet,
      })
    }
  }, [gameData])

  // Отсчёт времени игры
  useEffect(() => {
    const intervalId = setInterval(() => {
      timerRef.current = timerRef.current + 1
    }, 1000)

    return () => clearInterval(intervalId)
  }, [])

  const handleKeyPress = async (key: string) => {
    if (gameState.gameOver) return

    if (key === "ENTER") {
      if (!gameConfig || gameState.currentGuess.length !== WORD_LENGTH) return

      const newGuesses = [...gameState.guesses, gameState.currentGuess]
      const won = gameState.currentGuess === gameConfig.targetWord

      const isValid = await isWordValid(
        gameState.currentGuess,
        gameConfig.language,
      )

      if (won) {
        if (!id || !currentUser) return
        const token = encryptToken(
          id,
          currentUser.telegramId.toString(),
          "1970.01.01 00:00",
        )
        claimLevel({
          token,
          gameType: "WORDLY",
          isBetWin: gameConfig.bet
            ? gameConfig.bet >= newGuesses.length
            : false,
          id: id,
          gameStats: {
            moves: newGuesses.length,
            timePassed: timerRef.current,
            betNutsAmount: bet ? bet : 0,
            betTriesAmount: gameConfig.bet ? gameConfig.bet : 0,
          },
        })

        refetchNew()

        setGameState({
          ...gameState,
          guesses: newGuesses,
          currentGuess: "",
        })

        setTimeout(() => {
          if (soundsLoaded) WinGameSound.play()
          setGameState({
            ...gameState,
            isBetwon: gameConfig.bet
              ? gameConfig.bet >= newGuesses.length
              : false,
            won,
          })
        }, 2200)
      } else if (newGuesses.length === TRIES) {
        if (!id || !currentUser) return

        // Блокировка фейла уровня если в ласт слове невалидное слово
        if (!isValid) {
          toast.error(t("Мы не знаем такого слова"))
          if (soundsLoaded) InvalidWordSound.play()
          setGameState({
            ...gameState,
            invalidWord: true,
          })
          setTimeout(
            () =>
              setGameState({
                ...gameState,
                invalidWord: false,
              }),
            1000,
          )

          return
        }

        const token = encryptToken(
          id,
          currentUser.telegramId.toString(),
          "1970.01.01 00:00",
        )
        failLevel({
          token,
          gameType: "WORDLY",
          id: id,
        })

        setGameState({
          ...gameState,
          guesses: newGuesses,
          currentGuess: "",
        })

        setTimeout(() => {
          if (soundsLoaded) LoseGameSound.play()
          setGameState({
            ...gameState,
            guesses: newGuesses,
            currentGuess: "",
            gameOver: true,
            isBetwon: false,
          })
        }, 2200)
      } else {
        if (isValid) {
          setGameState({
            ...gameState,
            guesses: newGuesses,
            currentGuess: "",
            gameOver: won || newGuesses.length === TRIES,
            isBetwon: gameConfig.bet
              ? gameConfig.bet >= newGuesses.length
              : false,
            won,
          })
        } else {
          toast.error(t("Мы не знаем такого слова"))
          if (soundsLoaded) InvalidWordSound.play()
          setGameState({
            ...gameState,
            invalidWord: true,
          })
          setTimeout(
            () =>
              setGameState({
                ...gameState,
                invalidWord: false,
              }),
            1000,
          )
        }
      }
    } else if (key === "DELETE") {
      setGameState({
        ...gameState,
        currentGuess: gameState.currentGuess.slice(0, -1),
      })
    } else if (gameState.currentGuess.length < WORD_LENGTH) {
      if (soundsLoaded) {
        LetterEnterSound.play()
      }
      setGameState({
        ...gameState,
        currentGuess: gameState.currentGuess + key,
      })
    }
  }

  const getCellStatus = (
    letter: string,
    index: number,
    rowIndex: number,
  ): CellStatus => {
    if (!gameConfig) return "empty"
    if (rowIndex >= gameState.guesses.length) return "empty"

    const guess = gameState.guesses[rowIndex]
    const target = gameConfig.targetWord

    // Сначала помечаем все точные совпадения
    if (letter === target[index]) {
      return "correct"
    }

    // Считаем количество букв в target, которые ещё не "использованы"
    const targetLetters = target.split("")

    // Сначала отмечаем все correct буквы и "используем" их
    const availableLetters = [...targetLetters]
    const statuses: CellStatus[] = new Array(guess.length).fill("absent")

    // Первый проход - отмечаем correct позиции
    for (let i = 0; i < guess.length; i++) {
      if (guess[i] === target[i]) {
        statuses[i] = "correct"
        // "Используем" эту букву в availableLetters
        const indexToRemove = availableLetters.indexOf(guess[i])
        if (indexToRemove !== -1) {
          availableLetters.splice(indexToRemove, 1)
        }
      }
    }

    // Второй проход - отмечаем present буквы
    for (let i = 0; i < guess.length; i++) {
      if (statuses[i] === "correct") continue // Уже обработано

      if (availableLetters.includes(guess[i])) {
        statuses[i] = "present"
        // "Используем" эту букву в availableLetters
        const indexToRemove = availableLetters.indexOf(guess[i])
        if (indexToRemove !== -1) {
          availableLetters.splice(indexToRemove, 1)
        }
      } else {
        statuses[i] = "absent"
      }
    }

    return statuses[index]
  }

  const getKeyStatus = (key: string): CellStatus => {
    let status: CellStatus = "empty"

    if (!gameConfig) return "empty"

    for (const guess of gameState.guesses) {
      for (let i = 0; i < guess.length; i++) {
        if (guess[i] !== key) continue

        if (guess[i] === gameConfig.targetWord[i]) {
          return "correct"
        } else if (gameConfig.targetWord.includes(guess[i])) {
          status = "present"
        } else if (status === "empty") {
          status = "absent"
        }
      }
    }

    return status
  }

  const getKeyboardLayout = () => {
    // if (!gameConfig) return KEYBOARD_LETTERS_EN
    if (!gameConfig) return []
    return gameConfig.language === "EN"
      ? KEYBOARD_LETTERS_EN
      : KEYBOARD_LETTERS_RU
  }

  return {
    gameState,
    gameConfig,
    isStartClaimLoading,
    handleKeyPress,
    getCellStatus,
    getKeyStatus,
    getKeyboardLayout,
  }
}
