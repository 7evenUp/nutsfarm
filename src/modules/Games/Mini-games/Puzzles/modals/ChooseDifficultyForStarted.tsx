import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import Loader from "@/assets/icons/loader.svg?react"
import CoinIcon from "@/assets/games/shared-icons/coin-icon.svg?react"
import EnergyIcon from "@/assets/games/flip-cards/icons/energy-icon.svg?react"
import Hourglass from "@/modules/Games/Mini-games/Puzzles/assets/images/hourglass.png"

import { IOnStartedStartClick } from "../LevelButtons/PassedLevel"

import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalTitle,
  ModalTrigger,
} from "../shared/Modal"

import GameButton from "@/modules/Games/components/GameButton"

import { Skeleton } from "@/shared/ui/Skeleton"

import { useGetCurrentUserQuery } from "@/redux/api/user"
import {
  useGetLevelByIdQuery,
  useGetStartedLevelsQuery,
} from "@/redux/api/games"

import { GameDifficulty, UserGameLevelDifficultyInfo } from "@/types/games"

import { numberWithSpaces } from "@/utils/numberWithSpaces"
import { makeHapticFeedback } from "@/utils/makeHapticFeedback"
import { Sound } from "@/utils/Sound"
import { getMinutes, getSeconds } from "@/utils/date"

import { cn } from "@/lib/cn"

const ChooseDifficultyForStarted = ({
  children,
  onStartClick,
  isLoading,
  gameLevelId,
  clickSound,
  index,
}: {
  children: React.ReactNode
  onStartClick: IOnStartedStartClick
  isLoading: boolean
  clickSound: Sound
  index: number
} & UserGameLevelDifficultyInfo) => {
  const { t } = useTranslation()

  const [modalOpened, setModalOpened] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<GameDifficulty | null>(null)

  const { data: currentUser } = useGetCurrentUserQuery()
  const { data: gameLevel } = useGetLevelByIdQuery(
    { levelId: gameLevelId },
    { skip: !modalOpened },
  )
  const { data: startedLevels } = useGetStartedLevelsQuery({
    type: "PUZZLES",
  })

  const startedDifficulties = useMemo(() => {
    if (!gameLevel || !startedLevels) return []

    const neededStartedDifficulties = startedLevels.filter(
      (item) => item.gameLevelId === gameLevelId,
    )

    return neededStartedDifficulties
  }, [startedLevels, gameLevel])

  const selectedStartedDifficulty = useMemo(() => {
    if (selectedDifficulty === null) return null
    if (startedDifficulties.length === 0) return null

    const neededDifficulty = startedDifficulties.find(
      (i) => i.gameLevelDifficultyId === selectedDifficulty.id,
    )

    if (neededDifficulty === undefined) return null

    return neededDifficulty
  }, [startedDifficulties, selectedDifficulty])

  const difficulties = useMemo(() => {
    if (!gameLevel) return null

    const sorted = [...gameLevel.difficulties].sort((a, b) => {
      const order: Record<"EASY" | "MEDIUM" | "HARD", number> = {
        EASY: 0,
        MEDIUM: 1,
        HARD: 2,
      }
      return (
        order[a.difficulty as keyof typeof order] -
        order[b.difficulty as keyof typeof order]
      )
    })

    return sorted
  }, [gameLevel])

  useEffect(() => {
    if (!difficulties) return

    setSelectedDifficulty(difficulties[0])
  }, [difficulties])

  return (
    <Modal open={modalOpened} onOpenChange={setModalOpened}>
      <ModalTrigger asChild>{children}</ModalTrigger>
      <ModalContent className="w-80" innerClassName="p-3.5">
        <ModalTitle className="sr-only">Choose Difficulty Modal</ModalTitle>
        <ModalDescription className="sr-only">
          Choose Difficulty Modal
        </ModalDescription>

        <h2 className="mb-1 bg-gradient-to-b from-[#FCF4ED] to-[#F6DFCB] bg-clip-text text-center font-koulen text-[30px]/[150%] text-[42px] text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]">
          Block {index}
        </h2>

        <p className="mb-2.5 text-center text-sm/[150%] font-bold text-[#F9E8D9] drop-shadow-[0_1px_2px_rgba(0,0,0,0.20)]">
          {t("Выбери сложность")}
        </p>

        {difficulties !== null && selectedDifficulty !== null ? (
          <div
            className={cn(
              "mb-7 flex w-full justify-center gap-1.5",
              selectedStartedDifficulty !== null &&
                selectedStartedDifficulty.gameStats &&
                "mb-4",
            )}
          >
            {difficulties.map((difficulty) => (
              <button
                key={difficulty.id}
                className={cn(
                  "flex h-8 max-w-24 flex-1 items-center justify-center rounded-md text-sm/none font-bold",
                  selectedDifficulty.difficulty === difficulty.difficulty
                    ? "bg-gradient-to-b from-[#864B08]/90 to-[#683A05]/90 text-[#FEE820] ring-1 ring-inset ring-[#492C06]/90"
                    : "bg-gradient-to-b from-[#643603]/70 to-[#452501]/70 text-[#FFDFBF]/50",
                )}
                onClick={() => {
                  clickSound.play()
                  makeHapticFeedback({ impactOccured: "medium" })
                  setSelectedDifficulty(difficulty)
                }}
              >
                {difficulty.difficulty === "EASY"
                  ? t("лёгкий")
                  : difficulty.difficulty === "MEDIUM"
                    ? t("средний")
                    : difficulty.difficulty === "HARD"
                      ? t("сложный")
                      : "unknown"}
              </button>
            ))}
          </div>
        ) : (
          <div className="mb-7 flex w-full justify-center gap-1.5">
            <Skeleton className="h-8 max-w-24 flex-1 rounded-lg bg-[#6D3D0D]/60" />
            <Skeleton className="h-8 max-w-24 flex-1 rounded-lg bg-[#6D3D0D]/60" />
            <Skeleton className="h-8 max-w-24 flex-1 rounded-lg bg-[#6D3D0D]/60" />
          </div>
        )}

        {selectedStartedDifficulty !== null &&
          selectedStartedDifficulty.gameStats && (
            <div className="mb-5 flex min-h-8 items-center justify-center rounded-md bg-gradient-to-b from-[#653703]/70 to-[#452501]/70 px-10 text-sm/none font-bold text-[#FFDFBF]">
              {t("Пройдено за")}{" "}
              <img
                src={Hourglass}
                alt="Timer icon"
                className="ml-2 mr-[5px] h-[17px] w-3.5"
              />
              <span className="font-bold">
                {`${getMinutes(selectedStartedDifficulty.gameStats.timePassed)}:${getSeconds(selectedStartedDifficulty.gameStats.timePassed)}`}
              </span>
            </div>
          )}

        <div className="mb-7 flex gap-10">
          <div className="flex flex-col gap-2 text-sm">
            <p className="text-sm/[150%] font-bold text-[#FFF1E5]">
              {t("Стоимость")}
            </p>
            <div className="flex gap-2">
              {selectedDifficulty !== null ? (
                <>
                  <div className="flex h-8 items-center justify-center gap-2.5 rounded-md border border-[#6B3B05]/60 bg-gradient-to-b from-[#96550B]/90 to-[#5B3204]/90 px-2">
                    <EnergyIcon />
                    <span className="font-bold text-[#FFF1E5]">
                      {selectedDifficulty.energyPrice}
                    </span>
                  </div>
                  <div className="flex h-8 items-center justify-center gap-2.5 rounded-md border border-[#6B3B05]/60 bg-gradient-to-b from-[#96550B]/90 to-[#5B3204]/90 px-2">
                    <CoinIcon />
                    <span className="text-sm font-bold text-[#FFF1E5]">
                      {numberWithSpaces(selectedDifficulty.price)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <Skeleton className="h-8 w-[52px] rounded-md bg-[#6D3D0D]/60" />
                  <Skeleton className="h-8 w-[66px] rounded-md bg-[#6D3D0D]/60" />
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm/[150%] font-bold text-[#FFF1E5]">
              {t("Награда.сложность")}
            </p>
            {selectedStartedDifficulty !== null &&
            selectedStartedDifficulty.status === "COMPLETED" ? (
              <p className="flex h-8 items-center justify-center gap-2.5 rounded-md border border-[#6B3B05]/60 bg-gradient-to-b from-[#96550B]/90 to-[#5B3204]/90 px-2">
                <span className="text-sm font-bold text-[#FFDFBF]/50">
                  {t("Получено")}
                </span>
              </p>
            ) : selectedDifficulty !== null ? (
              <p className="flex h-8 items-center justify-center gap-2.5 rounded-md border border-[#6B3B0599] bg-gradient-to-b from-[#96550B] from-[0%] to-[#4F2B02] to-[118%] px-2">
                <CoinIcon />
                <span className="text-sm font-bold text-white">
                  {numberWithSpaces(selectedDifficulty.reward)}
                </span>
              </p>
            ) : (
              <Skeleton className="h-8 w-[66px] rounded-md bg-[#6D3D0D]/60" />
            )}
          </div>
        </div>

        {selectedDifficulty !== null ? (
          <GameButton
            appearance="puzzles"
            className="h-10 w-[212px]"
            onClick={() => {
              makeHapticFeedback({ impactOccured: "heavy" })
              onStartClick({
                difficultyId: selectedDifficulty.id,
                difficulty: selectedDifficulty.difficulty,
                selectedStartedDifficulty,
                energyPrice: selectedDifficulty.energyPrice,
              })
            }}
            disabled={
              !currentUser || currentUser.balance < selectedDifficulty.price
            }
          >
            {isLoading ? (
              <Loader className="animate-spin" />
            ) : selectedStartedDifficulty === null ? (
              t("Играть")
            ) : selectedStartedDifficulty.status === "COMPLETED" ? (
              t("Играть снова")
            ) : selectedStartedDifficulty.status === "FAILED" ? (
              t("Попробовать ещё")
            ) : (
              selectedStartedDifficulty.status === "PENDING" && t("Закончить")
            )}
          </GameButton>
        ) : (
          <Skeleton className="h-10 w-[212px] rounded-lg bg-[#6D3D0D]/60" />
        )}
      </ModalContent>
    </Modal>
  )
}

export default ChooseDifficultyForStarted
