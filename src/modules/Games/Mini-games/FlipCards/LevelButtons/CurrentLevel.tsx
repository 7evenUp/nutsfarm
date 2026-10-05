import { useLayoutEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

import CurrentLevelIcon from "@/assets/games/flip-cards/icons/current-level.svg?react"
import BlockedLevelIcon from "@/assets/games/flip-cards/icons/blocked-level.svg?react"

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
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import {
  setDifficulty,
  setSelectedGameId,
  setStartedDifficulty,
  setStartedIndex,
} from "@/redux/slices/flip-cards/gameplay"

import { encryptToken } from "@/utils/encrypt"

import {
  GameLevel,
  StartLevelRequestArgs,
  UserGameLevelDifficultyInfo,
} from "@/types/games"
import { Sound } from "@/utils/Sound"
import { sendMetrika } from "@/utils/sendMetrika"

const CurrentLevel = ({
  index,
  clickSound,
  prevLevel,
  ...props
}: {
  index: number
  clickSound: Sound
  prevLevel: UserGameLevelDifficultyInfo | undefined
} & GameLevel) => {
  const { t } = useTranslation()

  const buttonRef = useRef<HTMLButtonElement | null>(null)

  const navigate = useNavigate()

  const [notEnoughOpened, setNotEnoughOpened] = useState(false)
  const [openPaymentStatus, setOpenPaymentStatus] = useState(false)

  const dispatch = useAppDispatch()
  const selectedPackId = useAppSelector((state) => state.cardPacks.chosenPackId)

  const { data: gameEnergy } = useGetGameEnergyQuery()
  const { data: currentUser } = useGetCurrentUserQuery()
  const { data: startedLevelsData } = useGetStartedLevelsQuery({
    type: "CARDS",
  })
  const { refetch: refetchNew } = useGetNewLevelsInfiniteQuery({
    type: "CARDS",
  })
  const [startLevel, { isLoading: isStartLoading }] = useStartLevelMutation()

  const startedPrevDifficulties = useMemo(() => {
    if (!startedLevelsData) return []
    if (!prevLevel) return []

    return startedLevelsData.filter(
      (item) => item.gameLevelId === prevLevel.gameLevelId,
    )
  }, [startedLevelsData])

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

    sendMetrika("play_metamatch")

    try {
      const token = encryptToken(
        difficultyId,
        currentUser.telegramId.toString(),
        "1970.01.01 00:00",
      )

      let startLevelPayload: StartLevelRequestArgs = {
        token,
        gameType: "CARDS",
        gameLevelDifficultyId: difficultyId,
      }

      if (selectedPackId) {
        startLevelPayload = {
          ...startLevelPayload,
          gameCardsPackId: selectedPackId,
        }
      }

      const startedLevel = await startLevel(startLevelPayload).unwrap()

      refetchNew()

      dispatch(setStartedIndex(index))
      dispatch(setSelectedGameId(startedLevel.id))
      dispatch(setDifficulty(difficulty))
      dispatch(setStartedDifficulty(startedLevel))

      navigate("/games/flip-cards/gameplay")
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
        <button className="relative" ref={buttonRef}>
          <BlockedLevelIcon className="relative h-[79px] w-[71px]" />
        </button>
      </LockedLevel>
    )

  return (
    <>
      <ChooseDifficulty
        index={index}
        onStartClick={onStartClick}
        isLoading={isStartLoading}
        clickSound={clickSound}
        hasClaimedStartedLevels={hasClaimedStartedLevels}
        {...props}
      >
        <button className="relative" ref={buttonRef}>
          <CurrentLevelIcon className="relative h-[79px] w-[71px] drop-shadow-[0px_0px_10px_rgba(240,177,249,0.6)]" />

          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-extrabold text-[#F0F3FF] drop-shadow-[0px_2px_4px_rgba(0,0,0,0.15)]">
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
