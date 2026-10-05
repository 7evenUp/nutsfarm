import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

import PassedLevelIcon from "@/assets/games/flip-cards/icons/passed-level.svg?react"
import StarIcon from "@/assets/games/flip-cards/icons/difficulty-star-active.svg?react"
import StarDisabledIcon from "@/assets/games/flip-cards/icons/difficulty-star-inactive.svg?react"

import ChooseDifficultyForStarted from "../modals/ChooseDifficultyForStarted"
import NotEnoughEnergy from "../modals/NotEnoughEnergy"
import EnergyPaymentStatus from "../modals/EnergyPaymentStatus"

import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { useGetCurrentUserQuery } from "@/redux/api/user"
import {
  useFailLevelMutation,
  useGetGameEnergyQuery,
  useGetStartedLevelsQuery,
  useStartLevelMutation,
} from "@/redux/api/games"
import {
  setDifficulty,
  setSelectedGameId,
  setStartedDifficulty,
  setStartedIndex,
} from "@/redux/slices/flip-cards/gameplay"

import {
  StartLevelRequestArgs,
  UserGameLevelDifficultyInfo,
} from "@/types/games"

import { encryptToken } from "@/utils/encrypt"
import { Sound } from "@/utils/Sound"
import { sendMetrika } from "@/utils/sendMetrika"

export type IOnStartedStartClick = ({
  difficultyId,
  difficulty,
  selectedStartedDifficulty,
  energyPrice,
}: {
  difficultyId: string
  difficulty: string
  selectedStartedDifficulty: UserGameLevelDifficultyInfo | null
  energyPrice: number
}) => Promise<void>

const PassedLevel = ({
  index,
  clickSound,
  ...startedLevel
}: { index: number; clickSound: Sound } & UserGameLevelDifficultyInfo) => {
  const { t } = useTranslation()

  const navigate = useNavigate()

  const [isStartLocked, setIsStartLocked] = useState(false)
  const [notEnoughOpened, setNotEnoughOpened] = useState(false)
  const [openPaymentStatus, setOpenPaymentStatus] = useState(false)

  const dispatch = useAppDispatch()
  const selectedPackId = useAppSelector((state) => state.cardPacks.chosenPackId)

  const { data: gameEnergy } = useGetGameEnergyQuery()
  const { data: currentUser } = useGetCurrentUserQuery()
  const { data: startedLevels } = useGetStartedLevelsQuery({
    type: "CARDS",
  })
  const [startLevel] = useStartLevelMutation()
  const [failLevel] = useFailLevelMutation()

  const claimedDifficulties = useMemo(() => {
    if (!startedLevels) return []

    const completedStartedLevels = startedLevels.filter(
      (item) => item.status === "COMPLETED",
    )

    return completedStartedLevels
      .filter((item) => item.gameLevelId === startedLevel.gameLevelId)
      .map((item) => item.difficulty)
  }, [startedLevels])

  const onStartClick: IOnStartedStartClick = async ({
    difficultyId,
    difficulty,
    selectedStartedDifficulty,
    energyPrice,
  }) => {
    if (!currentUser) return
    if (isStartLocked) return
    if (!gameEnergy) return

    if (selectedStartedDifficulty) {
      if (gameEnergy.gameEnergy < selectedStartedDifficulty.energyPrice) {
        setNotEnoughOpened(true)
        return
      }
    } else {
      if (gameEnergy.gameEnergy < energyPrice) {
        setNotEnoughOpened(true)
        return
      }
    }

    sendMetrika("play_metamatch")

    setIsStartLocked(true)

    if (selectedStartedDifficulty) {
      if (selectedStartedDifficulty.status === "PENDING") {
        try {
          const token = encryptToken(
            selectedStartedDifficulty.id,
            currentUser.telegramId.toString(),
            "1970.01.01 00:00",
          )

          await failLevel({
            token,
            gameType: "CARDS",
            id: selectedStartedDifficulty.id,
          }).unwrap()
        } catch (error) {
          toast.error(t("Ошибка"), {
            description: t("Упс, что-то пошло не так"),
          })
        }
      }
    }

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

      if (selectedStartedDifficulty) {
        await startLevel(startLevelPayload).unwrap()

        dispatch(setSelectedGameId(selectedStartedDifficulty.id))
        dispatch(setStartedDifficulty(selectedStartedDifficulty))
      } else {
        const newStartedLevel = await startLevel(startLevelPayload).unwrap()

        dispatch(setSelectedGameId(newStartedLevel.id))
        dispatch(setStartedDifficulty(newStartedLevel))
      }

      dispatch(setStartedIndex(index))
      dispatch(setDifficulty(difficulty))

      navigate("/games/flip-cards/gameplay")
    } catch (error) {
      toast.error(t("Ошибка"), {
        description: t("Упс, что-то пошло не так"),
      })
    }

    setIsStartLocked(false)
  }

  return (
    <>
      <ChooseDifficultyForStarted
        index={index}
        onStartClick={onStartClick}
        isLoading={isStartLocked}
        clickSound={clickSound}
        {...startedLevel}
      >
        <button className="relative">
          <PassedLevelIcon className="relative h-[79px] w-[71px]" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-extrabold text-[#3E0049]/50">
            {index}
          </span>
          <div className="absolute bottom-[3px] left-1/2 flex -translate-x-1/2 translate-y-1/2 items-center">
            {claimedDifficulties.length === 0 ? (
              <>
                <StarDisabledIcon className="-translate-y-1.5 translate-x-[3px] rotate-[30deg]" />
                <StarDisabledIcon className="h-auto w-[27px]" />
                <StarDisabledIcon className="-translate-x-[3px] -translate-y-1.5 rotate-[-30deg]" />
              </>
            ) : claimedDifficulties.length === 1 ? (
              <>
                <StarIcon className="-translate-y-1.5 translate-x-[3px] rotate-[30deg]" />
                <StarDisabledIcon className="h-auto w-[27px]" />
                <StarDisabledIcon className="-translate-x-[3px] -translate-y-1.5 rotate-[-30deg]" />
              </>
            ) : claimedDifficulties.length === 2 ? (
              <>
                <StarIcon className="-translate-y-1.5 translate-x-[3px] rotate-[30deg]" />
                <StarIcon className="h-auto w-[27px]" />
                <StarDisabledIcon className="-translate-x-[3px] -translate-y-1.5 rotate-[-30deg]" />
              </>
            ) : (
              claimedDifficulties.length === 3 && (
                <>
                  <StarIcon className="-translate-y-1.5 translate-x-[3px] rotate-[30deg]" />
                  <StarIcon className="h-auto w-[27px]" />
                  <StarIcon className="-translate-x-[3px] -translate-y-1.5 rotate-[-30deg]" />
                </>
              )
            )}
          </div>
        </button>
      </ChooseDifficultyForStarted>

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

export default PassedLevel
