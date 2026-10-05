import { useState } from "react"
import { useTranslation } from "react-i18next"

import CoinIcon from "@/assets/games/shared-icons/coin-icon.svg?react"
import EnergyIcon from "@/assets/games/flip-cards/icons/energy-icon.svg?react"
import Loader from "@/assets/icons/loader.svg?react"

import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalTitle,
  ModalTrigger,
} from "../shared/Modal"

import GameButton from "@/modules/Games/components/GameButton"

import { useGetCurrentUserQuery } from "@/redux/api/user"

import { GameDifficulty, GameLevel } from "@/types/games"

import { numberWithSpaces } from "@/utils/numberWithSpaces"
import { makeHapticFeedback } from "@/utils/makeHapticFeedback"
import { Sound } from "@/utils/Sound"

import { cn } from "@/lib/cn"

const ChooseDifficulty = ({
  children,
  onStartClick,
  difficulties,
  isLoading,
  clickSound,
  index,
  hasClaimedStartedLevels,
}: {
  children: React.ReactNode
  onStartClick: ({
    difficultyId,
    difficulty,
    energyPrice,
  }: {
    difficultyId: string
    difficulty: string
    energyPrice: number
  }) => Promise<void>
  isLoading: boolean
  clickSound: Sound
  index: number
  hasClaimedStartedLevels: boolean
} & GameLevel) => {
  const { t } = useTranslation()

  const sortedDifficulties = [...difficulties].sort((a, b) => {
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

  const [selectedDifficulty, setSelectedDifficulty] = useState<GameDifficulty>(
    sortedDifficulties[0],
  )

  const { data: currentUser } = useGetCurrentUserQuery()

  return (
    <Modal>
      <ModalTrigger asChild>{children}</ModalTrigger>
      <ModalContent className="w-80" innerClassName="pb-3.5 pt-2.5 px-6">
        <ModalTitle className="sr-only">Choose Difficulty Modal</ModalTitle>
        <ModalDescription className="sr-only">
          Choose Difficulty Modal
        </ModalDescription>

        <h2 className="mb-1 bg-gradient-to-b from-[#FCF4ED] to-[#F6DFCB] bg-clip-text text-center font-koulen text-[30px]/[150%] text-[42px] text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]">
          Block {index}
        </h2>

        {!hasClaimedStartedLevels ? (
          <p className="mb-7 text-balance text-center text-sm/4 font-bold text-[#F9E8D9] drop-shadow-[0_1px_2px_rgba(0,0,0,0.20)]">
            {t(
              "Проверьте, что вы прошли хотя бы одну сложность на всех предыдущих уровнях",
            )}
          </p>
        ) : (
          <>
            <p className="mb-2.5 text-center text-sm/[150%] font-bold text-[#F9E8D9] drop-shadow-[0_1px_2px_rgba(0,0,0,0.20)]">
              {t("Выбери сложность")}
            </p>

            <div className="mb-7 flex w-full justify-center gap-1">
              {sortedDifficulties.map((difficulty) => (
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

            <div className="mb-7 flex gap-10">
              <div className="flex flex-col gap-2 text-sm">
                <p className="text-sm/[150%] font-bold text-[#FFF1E5]">
                  {t("Стоимость")}
                </p>
                <div className="flex gap-2">
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
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm/[150%] font-bold text-[#FFF1E5]">
                  {t("Награда.сложность")}
                </p>
                <p className="flex h-8 items-center justify-center gap-2.5 rounded-md border border-[#6B3B05]/60 bg-gradient-to-b from-[#96550B]/90 to-[#5B3204]/90 px-2">
                  <CoinIcon />
                  <span className="text-sm font-bold text-white">
                    {numberWithSpaces(selectedDifficulty.reward)}
                  </span>
                </p>
              </div>
            </div>
          </>
        )}

        <GameButton
          appearance="puzzles"
          className="h-10 w-[212px]"
          onClick={() => {
            makeHapticFeedback({ impactOccured: "heavy" })
            onStartClick({
              difficultyId: selectedDifficulty.id,
              difficulty: selectedDifficulty.difficulty,
              energyPrice: selectedDifficulty.energyPrice,
            })
          }}
          disabled={
            !currentUser ||
            currentUser.balance < selectedDifficulty.price ||
            !hasClaimedStartedLevels
          }
        >
          {isLoading ? <Loader className="animate-spin" /> : t("Играть")}
        </GameButton>
      </ModalContent>
    </Modal>
  )
}

export default ChooseDifficulty
