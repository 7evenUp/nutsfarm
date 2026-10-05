import { useMemo, useState } from "react"
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

import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalTitle,
  ModalTrigger,
} from "../shared/Modal"

import GameButton from "@/modules/Games/components/GameButton"

import { useAppSelector } from "@/redux/hooks"
import { useGetCurrentUserQuery } from "@/redux/api/user"

import { CardsPackBody, GameDifficulty, GameLevel } from "@/types/games"

import { numberWithSpaces } from "@/utils/numberWithSpaces"
import { openLinkWithTelegram } from "@/utils/openLink"
import { makeHapticFeedback } from "@/utils/makeHapticFeedback"
import { Sound } from "@/utils/Sound"

import { cn } from "@/lib/cn"

const ChooseDifficulty = ({
  index,
  children,
  onStartClick,
  difficulties,
  isLoading,
  clickSound,
  hasClaimedStartedLevels,
}: {
  index: number
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
  hasClaimedStartedLevels: boolean
} & GameLevel) => {
  const { t } = useTranslation()

  const sortedDifficulties = useMemo(() => {
    const order: Record<string, number> = { EASY: 0, MEDIUM: 1, HARD: 2 }
    return [...difficulties].sort(
      (a, b) => order[a.difficulty] - order[b.difficulty],
    )
  }, [difficulties])

  const [selectedDifficulty, setSelectedDifficulty] = useState<GameDifficulty>(
    sortedDifficulties[0],
  )

  const { packBody, chosenPackTitle, packBonus } = useAppSelector(
    (state) => state.cardPacks,
  )

  const { data: currentUser } = useGetCurrentUserQuery()

  return (
    <Modal>
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
          <PopoverTrigger className="group z-50 flex h-9 w-[226px] items-center gap-2 rounded-lg border border-[#382E6D]/40 px-2.5">
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

        {!hasClaimedStartedLevels ? (
          <p className="mb-7 mt-6 text-balance text-center text-sm/4 font-bold text-[#382E6D]">
            {t(
              "Проверьте, что вы прошли хотя бы одну сложность на всех предыдущих уровнях",
            )}
          </p>
        ) : (
          <>
            <p className="mb-2.5 mt-6 text-sm/[150%] font-bold text-[#382E6D]">
              {t("Выбери сложность")}
            </p>

            <div className="mb-7 flex w-full justify-center gap-1.5">
              {sortedDifficulties.map((difficulty) => (
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

            <div className="mb-7 flex gap-10">
              <div className="flex flex-col gap-2">
                <p className="text-sm/[150%] font-bold text-[#382E6D]">
                  {t("Стоимость")}
                </p>
                {selectedDifficulty.price === 0 ? (
                  <p className="flex h-8 items-center gap-[5px]">
                    <EnergyIcon />
                    <span className="font-bold text-[#382E6D]">
                      {selectedDifficulty.energyPrice}
                    </span>
                  </p>
                ) : (
                  <div className="flex gap-1">
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
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm/[150%] font-bold text-[#382E6D]">
                  {t("Награда.сложность")}
                </p>
                <p className="flex h-8 items-center justify-center gap-1.5 rounded-md border border-[#382E6D] bg-gradient-to-b from-[#51497B]/90 to-[#463E6B]/90 px-2 drop-shadow-[0px_2px_3px_rgba(0,0,0,0.2)]">
                  <CoinIcon />
                  <span className="text-sm font-bold text-white">
                    {numberWithSpaces(
                      Math.round(selectedDifficulty.reward * packBonus),
                    )}
                  </span>
                </p>
              </div>
            </div>
          </>
        )}

        <GameButton
          appearance="flip-cards"
          className="h-10 w-[178px]"
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
          {isLoading ? (
            <Loader className="animate-spin" />
          ) : !hasClaimedStartedLevels ? (
            t("Недоступно")
          ) : (
            t("Играть")
          )}
        </GameButton>
      </ModalContent>
    </Modal>
  )
}

export default ChooseDifficulty

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
