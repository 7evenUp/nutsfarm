import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

import ArrowLeftIcon from "@/assets/icons/arrow-left.svg?react"

import LevelBadge from "@/assets/games/flip-cards/icons/level-badge.svg?react"
import StepsRemainsBackground from "@/assets/games/flip-cards/icons/steps-remains-background.svg?react"

import CoreCard from "./Card/CoreCard"

import Victory from "../modals/Victory"
import Defeat from "../modals/Defeat"

import { useAppSelector } from "@/redux/hooks"
import {
  useClaimLevelMutation,
  useFailLevelMutation,
  useGetNewLevelsInfiniteQuery,
  useGetStartedLevelsQuery,
} from "@/redux/api/games"
import { useGetCurrentUserQuery } from "@/redux/api/user"

import { encryptToken } from "@/utils/encrypt"
import { shuffleArray } from "@/utils/arrays"
import { Sound } from "@/utils/Sound"
import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

import { cn } from "@/lib/cn"

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

const winSound = new Sound("/sounds/games/flip-cards/flip-cards-victory.mp3")
const defeatSound = new Sound("/sounds/games/flip-cards/flip-cards-defeat.mp3")
const correctMatchSound = new Sound(
  "/sounds/games/flip-cards/flip-cards-correct-match.mp3",
)
const uncorrectMatchSound = new Sound(
  "/sounds/games/flip-cards/flip-cards-uncorrect-match.mp3",
)

const DELAY_OPEN_VICTORY_MODAL = 1000
const DELAY_OPEN_DEFEAT_MODAL = 250

const FlipCardsGameplay = () => {
  const { t } = useTranslation()

  const navigate = useNavigate()

  const timerRef = useRef(0)

  const [currentKey, setCurrentKey] = useState<number | null>(null)
  const [activeCards, setActiveCards] = useState<{ id: number; key: number }[]>(
    [],
  )
  const [isLocked, setIsLocked] = useState(false)

  const [isWin, setIsWin] = useState(false)
  const [isLost, setIsLost] = useState(false)
  const [totalStepsForDifficulty, setTotalStepsForDifficulty] = useState<
    number | null
  >(null)
  const [stepsRemain, setStepsRemain] = useState<number | null>(null)

  const {
    selectedDifficulty,
    selectedGameId,
    startedDifficulty,
    startedIndex,
  } = useAppSelector((state) => state.flipCardsGameplay)
  const body = useAppSelector((state) => state.cardPacks.packBody)

  const { data: currentUser } = useGetCurrentUserQuery()
  const { refetch: refetchStarted } = useGetStartedLevelsQuery({
    type: "CARDS",
  })
  const { refetch: refetchNew } = useGetNewLevelsInfiniteQuery({
    type: "CARDS",
  })
  const [claimLevel] = useClaimLevelMutation()
  const [failLevel] = useFailLevelMutation()

  const gameCards = useMemo(() => {
    if (selectedDifficulty === null) return null

    let counter = 0

    const difficultySplit =
      selectedDifficulty === "HARD"
        ? 15 // 5x6
        : selectedDifficulty === "MEDIUM"
          ? 10 // 4x5
          : 8 // 4x4

    const shuffledBody = shuffleArray(body)
    const arr = []

    for (let i = 0; i < shuffledBody.length; i++) {
      if (i === difficultySplit) break

      const firstItem = { id: counter, key: i, value: shuffledBody[i].img }
      counter++

      const secondItem = { id: counter, key: i, value: shuffledBody[i].img }
      counter++

      arr.push(firstItem, secondItem)
    }

    const shuffledArr = shuffleArray(arr)

    return shuffledArr
  }, [selectedDifficulty])

  useEffect(() => {
    const cacheImages = async () => {
      const promises = body.map((item) => {
        return new Promise((resolve, reject) => {
          if (!item.img) return

          const img = new Image()
          img.src = item.img
          img.onload = resolve
          img.onerror = reject
        })
      })

      await Promise.all(promises)
    }

    cacheImages()
  }, [body])

  // Кнопка ТМА "Назад"
  useEffect(() => {
    if (!backButton) return

    backButton.show()
    const rmListener = backButton.on("click", () => {
      refetchStarted()
      refetchNew()
      navigate("/games/flip-cards")
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

    return () => clearInterval(intervalId)
  }, [])

  // Win logic
  useEffect(() => {
    if (gameCards === null) return
    if (activeCards.length === gameCards.length) {
      if (selectedGameId === null) return
      if (!currentUser) return

      if (
        startedDifficulty !== null &&
        startedDifficulty.status !== "COMPLETED"
      ) {
        const token = encryptToken(
          selectedGameId,
          currentUser.telegramId.toString(),
          "1970.01.01 00:00",
        )

        claimLevel({
          token,
          gameType: "CARDS",
          id: selectedGameId,
          gameStats: {
            moves:
              totalStepsForDifficulty !== null && stepsRemain !== null
                ? totalStepsForDifficulty - stepsRemain
                : 0,
            timePassed: timerRef.current,
          },
        })
      }

      setTimeout(() => {
        winSound.play()
        setIsWin(true)
      }, DELAY_OPEN_VICTORY_MODAL)
    }
  }, [activeCards])

  // Defeat logic
  useEffect(() => {
    if (gameCards === null) return
    if (stepsRemain === null || stepsRemain > 0) return
    if (activeCards.length !== gameCards.length) {
      if (selectedGameId === null) return
      if (!currentUser) return

      if (
        startedDifficulty !== null &&
        startedDifficulty.status !== "COMPLETED"
      ) {
        const token = encryptToken(
          selectedGameId,
          currentUser.telegramId.toString(),
          "1970.01.01 00:00",
        )

        failLevel({
          token,
          gameType: "CARDS",
          id: selectedGameId,
        })
      }

      setTimeout(() => {
        defeatSound.play()
        setIsLost(true)
      }, DELAY_OPEN_DEFEAT_MODAL)
    }
  }, [stepsRemain])

  // Парсинг body у сложности
  useEffect(() => {
    if (startedDifficulty === null) return

    const parseDifficultyBody = () => {
      try {
        const parsedBody = JSON.parse(startedDifficulty.gameLevelDifficultyBody)
        if (typeof parsedBody === "object") {
          const x = parsedBody["max_flips"]
          setStepsRemain(x)
          setTotalStepsForDifficulty(x)
        }
      } catch {
        setStepsRemain(50)
      }
    }

    parseDifficultyBody()
  }, [startedDifficulty])

  // Проверка, что все данные для игры есть
  useEffect(() => {
    if (
      selectedDifficulty === null ||
      selectedGameId === null ||
      startedDifficulty === null
    )
      return navigate("/games/flip-cards")
  }, [])

  // Загрузка звуков
  useEffect(() => {
    winSound.load()
    defeatSound.load()
    correctMatchSound.load()
    uncorrectMatchSound.load()

    return () => {
      winSound.stop()
      defeatSound.stop()
      correctMatchSound.stop()
      uncorrectMatchSound.stop()
    }
  }, [])

  if (stepsRemain === null || totalStepsForDifficulty === null) return null

  const onCardClick = (cardId: number, cardKey: number) => {
    if (activeCards.find((el) => el.id === cardId)) return
    if (isLocked) return
    if (stepsRemain <= 0) return

    setStepsRemain((prev) => (prev === null ? null : prev - 1))

    // Нажатие на первую карточку в потенциальной паре
    if (currentKey === null) {
      makeHapticFeedback({ impactOccured: "soft" })

      setCurrentKey(cardKey)
      setActiveCards((prev) => [...prev, { id: cardId, key: cardKey }])
    }
    // Нажатие на вторую карточку в потенциальной паре
    else {
      setIsLocked(true)

      // Вторая карточка соответствует первой в паре
      if (cardKey === currentKey) {
        makeHapticFeedback({ notificationOccured: "success" })
        correctMatchSound.play()

        setActiveCards((prev) => [...prev, { id: cardId, key: cardKey }])
        setCurrentKey(null)
        setIsLocked(false)
      }
      // Вторая карточка отличается от первой в паре
      else {
        makeHapticFeedback({ notificationOccured: "error" })
        uncorrectMatchSound.play()

        // Показываем вторую карточку
        setActiveCards((prev) => [...prev, { id: cardId, key: cardKey }])

        // Через N время переворачиваем обе карточки
        setTimeout(() => {
          setActiveCards((prev) =>
            prev.filter((el) => el.key !== currentKey && el.key !== cardKey),
          )
          setCurrentKey(null)
          setTimeout(() => {
            setIsLocked(false)
          }, 100)
        }, 500)
      }
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-[url(/images/games/flip-cards-ingame-background-sm.png)] bg-cover bg-bottom phone-sm-fix:bg-[url(/images/games/flip-cards-ingame-background.png)]" />

      <LevelBadge className="absolute left-1/2 top-0 -translate-x-1/2 drop-shadow-[0px_0px_4px_rgba(0,0,0,0.15)]" />
      <div className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center pt-[22px] font-bold text-[#6B7CCF]">
        <p className="text-[10px] uppercase">{t("Уровень")}</p>
        <p className="-translate-y-2 text-[32px]">{startedIndex}</p>
      </div>

      <main className="relative flex min-h-screen w-screen flex-1 flex-col items-center px-6 pb-10 pt-[72px]">
        {import.meta.env.VITE_IS_DEV_LOCAL !== undefined && (
          <Link
            to="/games/flip-cards"
            className="flex items-center gap-2 self-start text-sm font-semibold opacity-70 transition-opacity focus:outline-none active:opacity-100"
          >
            <ArrowLeftIcon />
            {t("Назад")}
          </Link>
        )}

        <div
          className={cn(
            "relative mt-1.5 self-start phone-sm-fix:mt-6",
            selectedDifficulty === "HARD" &&
              "mb-4 phone-xsm:mb-6 phone-sm-fix:mb-10",
            selectedDifficulty === "MEDIUM" &&
              "mb-6 phone-xsm:mb-5 phone-sm-fix:mb-10",
            selectedDifficulty === "EASY" && "mb-6 phone-xsm:mb-8",
          )}
        >
          <StepsRemainsBackground className="h-auto w-14 phone-sm-fix:w-[69px]" />
          <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-[#7A7FAB] phone-sm-fix:text-[32px]">
            {stepsRemain}
          </p>
        </div>

        {gameCards !== null && (
          <div className="flex w-full flex-1 items-center justify-center">
            <div
              className={cn(
                "grid w-full max-w-[500px] grid-cols-2 gap-2 [grid-auto-rows:max-content]",
                selectedDifficulty === "HARD" && "grid-cols-5 gap-1 px-3",
                selectedDifficulty === "MEDIUM" &&
                  "grid-cols-4 gap-1 px-6 phone-sm-fix:gap-2 phone-sm-fix:px-0",
                selectedDifficulty === "EASY" && "grid-cols-4",
              )}
            >
              {gameCards.map((el) => (
                <CoreCard
                  key={el.id}
                  className={cn(
                    selectedDifficulty === "HARD" && "aspect-square",
                    selectedDifficulty === "MEDIUM" && "aspect-square",
                    selectedDifficulty === "EASY" && "aspect-square",
                  )}
                  onClick={() => onCardClick(el.id, el.key)}
                  isActive={
                    !!activeCards.find((activeCard) => activeCard.id === el.id)
                  }
                  imgSrc={el.value}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <Defeat
        open={isLost}
        setOpen={setIsLost}
        wasClaimed={
          startedDifficulty ? startedDifficulty.status === "COMPLETED" : false
        }
      />

      <Victory
        open={isWin}
        setOpen={setIsWin}
        stepsDone={totalStepsForDifficulty - stepsRemain}
        wasClaimed={
          startedDifficulty ? startedDifficulty.status === "COMPLETED" : false
        }
      />
    </>
  )
}

export default FlipCardsGameplay
