import { useEffect, useMemo, useState } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover"
import { useTranslation } from "react-i18next"

import CardsIcon from "@/assets/games/flip-cards/icons/cards-blue.svg?react"
import ChevronDownIcon from "@/assets/games/shared-icons/chevron-down.svg?react"
import EnergyIcon from "@/assets/games/flip-cards/icons/energy-icon.svg?react"
import CoinIcon from "@/assets/games/shared-icons/coin-icon.svg?react"
import ShareIcon from "@/assets/games/flip-cards/icons/share-icon.svg?react"
import Loader from "@/assets/icons/loader.svg?react"

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

import { useAppSelector } from "@/redux/hooks"
import { useGetCurrentUserQuery } from "@/redux/api/user"
import {
  useGetLevelByIdQuery,
  useGetStartedLevelsQuery,
} from "@/redux/api/games"

import {
  CardsPackBody,
  GameDifficulty,
  UserGameLevelDifficultyInfo,
} from "@/types/games"

import { numberWithSpaces } from "@/utils/numberWithSpaces"
import { openLinkWithTelegram } from "@/utils/openLink"
import { makeHapticFeedback } from "@/utils/makeHapticFeedback"
import { Sound } from "@/utils/Sound"

import { cn } from "@/lib/cn"

const ChooseDifficultyForStarted = ({
  index,
  children,
  onStartClick,
  isLoading,
  gameLevelId,
  clickSound,
}: {
  index: number
  children: React.ReactNode
  onStartClick: IOnStartedStartClick
  isLoading: boolean
  clickSound: Sound
} & UserGameLevelDifficultyInfo) => {
  const { t } = useTranslation()

  const [modalOpened, setModalOpened] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<GameDifficulty | null>(null)

  const { packBody, chosenPackTitle, packBonus } = useAppSelector(
    (state) => state.cardPacks,
  )

  const { data: currentUser } = useGetCurrentUserQuery()
  const { data: gameLevel } = useGetLevelByIdQuery(
    { levelId: gameLevelId },
    { skip: !modalOpened },
  )
  const { data: startedLevels } = useGetStartedLevelsQuery({
    type: "CARDS",
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

    // Сортируем сложности
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
      <ModalContent className="w-80 border-black p-6 pt-8">
        <ModalTitle className="sr-only">Choose Difficulty Modal</ModalTitle>
        <ModalDescription className="sr-only">
          Choose Difficulty Modal
        </ModalDescription>

        <h2 className="mb-2 line-clamp-1 bg-gradient-to-b from-[#0F0C5A] to-[#564C9F] bg-clip-text text-center font-days-one text-[30px]/[150%] text-transparent">
          MetaMatch {index}
        </h2>

        <Popover>
          <PopoverTrigger className="group flex h-9 w-[226px] items-center gap-2 rounded-lg border border-[#382E6D]/40 px-2.5">
            <CardsIcon className="shrink-0" />
            <span className="truncate text-sm/none font-bold text-[#382E6D]/80">
              {chosenPackTitle}
            </span>
            <ChevronDownIcon className="ml-auto shrink-0 text-[#382E6D]/80 transition-transform group-data-[state=open]:rotate-180" />
          </PopoverTrigger>
          <PopoverContent
            className="z-50 w-[var(--radix-popover-trigger-width)] rounded-[10px] border border-[#382E6D]/40 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#F0F2FF] to-[#E0E0FD]"
            sideOffset={6}
          >
            <div className="no-scroll flex max-h-[250px] flex-col divide-y divide-[#867FAC]/20 overflow-y-scroll p-2.5 [mask-image:linear-gradient(to_bottom,transparent,red_12%,red_80%,transparent)]">
              {packBody.map((item) => (
                <PackItem key={item.title + item.description} {...item} />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <p className="mb-2.5 mt-6 text-sm/[150%] font-bold text-[#382E6D]">
          {t("Выбери сложность")}
        </p>

        {difficulties !== null && selectedDifficulty !== null ? (
          <div
            className={cn(
              "mb-7 flex w-full justify-center gap-1.5",
              selectedStartedDifficulty !== null &&
                selectedStartedDifficulty.gameStats &&
                "mb-5",
            )}
          >
            {difficulties.map((difficulty) => (
              <button
                key={difficulty.id}
                className={cn(
                  "flex h-8 max-w-24 flex-1 items-center justify-center rounded-lg text-sm/none font-bold",
                  selectedDifficulty.difficulty === difficulty.difficulty
                    ? "bg-gradient-to-b from-[#453C71]/90 to-[#342D5A]/90 text-white drop-shadow-[0px_2px_3px_rgba(44,3,70,0.2)]"
                    : "bg-[#838DB7]/60 text-[#382E6D]/50",
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
            <Skeleton className="h-8 max-w-24 flex-1 rounded-lg bg-[#838DB7]/60" />
            <Skeleton className="h-8 max-w-24 flex-1 rounded-lg bg-[#838DB7]/60" />
            <Skeleton className="h-8 max-w-24 flex-1 rounded-lg bg-[#838DB7]/60" />
          </div>
        )}

        {selectedStartedDifficulty !== null &&
          selectedStartedDifficulty.gameStats && (
            <div className="mb-6 flex min-h-8 items-center justify-center rounded-md bg-gradient-to-b from-[#51497B]/90 to-[#463E6B]/90 px-[18px] drop-shadow-[0px_2px_3px_rgba(44,3,70,0.2)]">
              <p className="text-sm/none font-semibold text-white">
                {t("Пройдено за ходов")}{" "}
                <span className="font-bold">
                  {selectedStartedDifficulty.gameStats.moves}
                </span>
              </p>
            </div>
          )}

        <div className="mb-7 flex gap-8">
          <div className="flex flex-col gap-2">
            <p className="text-sm/[150%] font-bold text-[#382E6D]">
              {t("Стоимость")}
            </p>
            <div className="flex items-center gap-1">
              {selectedDifficulty !== null ? (
                selectedDifficulty.price === 0 ? (
                  <p className="flex h-8 items-center gap-[5px]">
                    <EnergyIcon />
                    <span className="font-bold text-[#382E6D]">
                      {selectedDifficulty.energyPrice}
                    </span>
                  </p>
                ) : (
                  <>
                    <p className="flex h-8 items-center justify-center gap-2 rounded-md border border-[#382E6D] bg-gradient-to-b from-[#51497B]/90 to-[#463E6B]/90 px-2 drop-shadow-[0px_2px_3px_rgba(0,0,0,0.2)]">
                      <EnergyIcon />
                      <span className="font-bold text-white">
                        {selectedDifficulty.energyPrice}
                      </span>
                    </p>
                    <p className="flex h-8 items-center justify-center gap-1.5 rounded-md border border-[#382E6D] bg-gradient-to-b from-[#51497B]/90 to-[#463E6B]/90 px-2 drop-shadow-[0px_2px_3px_rgba(0,0,0,0.2)]">
                      <CoinIcon />
                      <span className="text-sm font-bold text-white">
                        {numberWithSpaces(selectedDifficulty.price)}
                      </span>
                    </p>
                  </>
                )
              ) : (
                <>
                  <Skeleton className="h-8 w-[52px] rounded-md bg-[#838DB7]/60" />
                  <Skeleton className="h-8 w-[66px] rounded-md bg-[#838DB7]/60" />
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm/[150%] font-bold text-[#382E6D]">
              {t("Награда.сложность")}
            </p>
            {selectedStartedDifficulty !== null &&
            selectedStartedDifficulty.status === "COMPLETED" ? (
              <p className="flex h-8 items-center justify-center rounded-md bg-[#A0A4CC] px-2">
                <span className="text-sm font-bold text-[#382E6D]/50">
                  {t("Получено")}
                </span>
              </p>
            ) : selectedDifficulty !== null ? (
              <p className="flex h-8 items-center justify-center gap-1.5 rounded-md border border-[#382E6D] bg-gradient-to-b from-[#51497B]/90 to-[#463E6B]/90 px-2 drop-shadow-[0px_2px_3px_rgba(0,0,0,0.2)]">
                <CoinIcon />
                <span className="text-sm font-bold text-white">
                  {numberWithSpaces(
                    Math.round(selectedDifficulty.reward * packBonus),
                  )}
                </span>
              </p>
            ) : (
              <Skeleton className="h-8 w-[66px] rounded-md bg-[#838DB7]/60" />
            )}
          </div>
        </div>

        {selectedDifficulty !== null ? (
          <GameButton
            appearance="flip-cards"
            className="h-10 w-[178px]"
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
          <Skeleton className="h-10 w-[178px] rounded-lg bg-[#838DB7]/60" />
        )}
      </ModalContent>
    </Modal>
  )
}

export default ChooseDifficultyForStarted

const PackItem = ({
  title,
  titleEn,
  description,
  descriptionEn,
  img,
  link,
}: CardsPackBody) => {
  const lang = useAppSelector((state) => state.language.value)

  const itemTitle = lang === "RU" ? title : titleEn
  const itemDescription = lang === "RU" ? description : descriptionEn

  return (
    <button
      className={cn("flex items-center py-2", !link && "pointer-events-none")}
      onClick={() => {
        if (!link) return

        openLinkWithTelegram(link, true)
      }}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-[#153672] to-[#010036]">
        <img
          src={img}
          alt={itemTitle}
          className="h-full w-full rounded-[7px] object-contain"
        />
      </div>
      <div className="ml-2 mr-5 flex flex-col gap-1">
        <h3 className="text-left text-xs/[14px] font-bold text-[#382E6D]">
          {itemTitle}
        </h3>
        <p className="line-clamp-2 text-left text-[10px]/[11px] font-semibold text-[#382E6D]/50">
          {itemDescription}
        </p>
      </div>
      {link && <ShareIcon className="ml-auto shrink-0 self-start" />}
    </button>
  )
}
