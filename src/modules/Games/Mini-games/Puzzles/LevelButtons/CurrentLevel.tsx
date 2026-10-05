import { useLayoutEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

import CurrentLevelIcon from "@/assets/games/puzzles/icons/current-level.svg?react"
import BlockedLevelIcon from "@/assets/games/puzzles/icons/blocked-level.svg?react"

import ChooseDifficulty from "../modals/ChooseDifficulty"
import LockedLevel from "../modals/LockedLevel"
import NotEnoughEnergy from "../modals/NotEnoughEnergy"
import EnergyPaymentStatus from "../modals/EnergyPaymentStatus"

import { useGetCurrentUserQuery } from "@/redux/api/user"
import {
  useGetGameEnergyQuery,
  useGetNewLevelsInfiniteQuery,
  useGetStartedLevelsQuery,
  useStartLevelMutation,
} from "@/redux/api/games"
import { setGameData } from "@/redux/slices/puzzles"
import { useAppDispatch } from "@/redux/hooks"

import { GameLevel, PuzzlesDifficultiesBody } from "@/types/games"

import { encryptToken } from "@/utils/encrypt"
import { Sound } from "@/utils/Sound"
import { sendMetrika } from "@/utils/sendMetrika"

import { cn } from "@/lib/cn"

export const difficultyTimeMap: Record<string, number> = {
  EASY: 45,
  MEDIUM: 60,
  HARD: 75,
}

const CurrentLevel = ({
  index,
  clickSound,
  ...props
}: GameLevel & {
  index: number
  clickSound: Sound
}) => {
  const { t } = useTranslation()

  const buttonRef = useRef<HTMLButtonElement | null>(null)

  const [notEnoughOpened, setNotEnoughOpened] = useState(false)
  const [openPaymentStatus, setOpenPaymentStatus] = useState(false)

  const navigate = useNavigate()

  const dispatch = useAppDispatch()

  const { data: currentUser } = useGetCurrentUserQuery()
  const { data: gameEnergy } = useGetGameEnergyQuery()
  const { data: startedLevelsData } = useGetStartedLevelsQuery({
    type: "PUZZLES",
  })
  const { refetch: refetchNew } = useGetNewLevelsInfiniteQuery({
    type: "PUZZLES",
  })
  const [startLevel, { isLoading: isStartLoading }] = useStartLevelMutation()

  const prevLevel = useMemo(() => {
    if (!startedLevelsData) return undefined
    if (startedLevelsData.length === 0) return undefined

    const uniqueStartedLevels = startedLevelsData.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.level === item.level),
    )

    return uniqueStartedLevels[uniqueStartedLevels.length - 1]
  }, [startedLevelsData])

  const startedPrevDifficulties = useMemo(() => {
    if (!startedLevelsData) return []
    if (!prevLevel) return []

    return startedLevelsData.filter(
      (item) => item.gameLevelId === prevLevel.gameLevelId,
    )
  }, [startedLevelsData, prevLevel])

  const hasClaimedStartedLevels = useMemo(() => {
    if (startedPrevDifficulties.length === 0) return true

    return startedPrevDifficulties.some(
      (startedLevel) => startedLevel.status === "COMPLETED",
    )
  }, [startedPrevDifficulties])

  const onStartClick = async ({
    difficultyId,
    difficulty,
    energyPrice,
  }: {
    difficultyId: string
    difficulty: string
    energyPrice: number
  }) => {
    if (!currentUser) return
    if (isStartLoading) return
    if (!hasClaimedStartedLevels) return
    if (!gameEnergy) return

    if (gameEnergy.gameEnergy < energyPrice) {
      setNotEnoughOpened(true)
      return
    }

    sendMetrika("play_nuts_blocks")

    try {
      const currentDifficulty = props.difficulties.find(
        (d) => d.id === difficultyId,
      )
      if (!difficulty || !currentDifficulty) return

      const parsedBody: PuzzlesDifficultiesBody = currentDifficulty?.body
        ? JSON.parse(currentDifficulty?.body)
        : ""

      const timeLimit = parsedBody?.difficulty_timer
        ? parsedBody.difficulty_timer
        : difficultyTimeMap[difficulty]

      const token = encryptToken(
        difficultyId,
        currentUser.telegramId.toString(),
        "1970.01.01 00:00",
      )

      const data = await startLevel({
        token,
        gameType: "PUZZLES",
        gameLevelDifficultyId: difficultyId,
      }).unwrap()

      refetchNew()

      dispatch(
        setGameData({
          ...data,
          level: index,
          timeLimit,
          gameLevelImage: props.image,
          imageUrl: props.image,
        }),
      )

      navigate("/games/puzzles/gameplay")
    } catch (error) {
      toast.error(t("Ошибка"), {
        description: t("Упс, что-то пошло не так"),
      })
    }
  }

  useLayoutEffect(() => {
    if (!buttonRef.current) return
    buttonRef.current.scrollIntoView({ block: "center" })
  }, [buttonRef])

  if (!hasClaimedStartedLevels)
    return (
      <LockedLevel>
        <button className="h-[60px] w-[60px]" ref={buttonRef}>
          <BlockedLevelIcon className="h-[68px] w-[68px] -translate-x-1 -translate-y-0.5" />
        </button>
      </LockedLevel>
    )

  return (
    <>
      <ChooseDifficulty
        onStartClick={onStartClick}
        isLoading={isStartLoading}
        {...props}
        clickSound={clickSound}
        index={index}
        hasClaimedStartedLevels={hasClaimedStartedLevels}
      >
        <button className="relative h-[60px] w-[60px]" ref={buttonRef}>
          <CurrentLevelIcon className="relative h-[68px] w-[68px] -translate-x-1 -translate-y-0.5" />

          <span
            className={cn(
              "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-[#82420F] to-[#B26823] bg-clip-text font-koulen text-transparent drop-shadow-[0px_2px_0px_#FEDED4]",
              index > 99 ? "text-2xl" : "text-4xl",
            )}
          >
            {index}
          </span>
        </button>
      </ChooseDifficulty>

      <NotEnoughEnergy
        open={notEnoughOpened}
        setOpen={setNotEnoughOpened}
        setOpenPaymentStatus={setOpenPaymentStatus}
      />
      <EnergyPaymentStatus
        open={openPaymentStatus}
        setOpen={setOpenPaymentStatus}
      />
    </>
  )
}

export default CurrentLevel
