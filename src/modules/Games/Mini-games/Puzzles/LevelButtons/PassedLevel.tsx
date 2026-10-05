import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

import PassedLevelIcon from "@/assets/games/puzzles/icons/passed-level.svg?react"
import StarIcon from "@/assets/games/puzzles/icons/difficulty-star-active.svg?react"
import StarDisabledIcon from "@/assets/games/puzzles/icons/difficulty-star-inactive.svg?react"

import { difficultyTimeMap } from "./CurrentLevel"

import ChooseDifficultyForStarted from "../modals/ChooseDifficultyForStarted"
import NotEnoughEnergy from "../modals/NotEnoughEnergy"
import EnergyPaymentStatus from "../modals/EnergyPaymentStatus"

import { useAppDispatch } from "@/redux/hooks"
import { useGetCurrentUserQuery } from "@/redux/api/user"
import { setGameData } from "@/redux/slices/puzzles"
import {
  useFailLevelMutation,
  useGetGameEnergyQuery,
  useGetStartedLevelsQuery,
  useStartLevelMutation,
} from "@/redux/api/games"

import {
  PuzzlesDifficultiesBody,
  StartLevelRequestArgs,
  UserGameLevelDifficultyInfo,
} from "@/types/games"

import { encryptToken } from "@/utils/encrypt"
import { Sound } from "@/utils/Sound"
import { sendMetrika } from "@/utils/sendMetrika"

import { cn } from "@/lib/cn"

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

  const { data: currentUser } = useGetCurrentUserQuery()
  const { data: gameEnergy } = useGetGameEnergyQuery()
  const { data: startedLevels } = useGetStartedLevelsQuery({
    type: "PUZZLES",
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
    selectedStartedDifficulty,
    energyPrice,
  }) => {
    if (!currentUser || isStartLocked) return
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

    sendMetrika("play_nuts_blocks")

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
            gameType: "PUZZLES",
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

      const startLevelPayload: StartLevelRequestArgs = {
        token,
        gameType: "PUZZLES",
        gameLevelDifficultyId: difficultyId,
      }

      if (selectedStartedDifficulty) {
        await startLevel(startLevelPayload).unwrap()

        const difficulty = selectedStartedDifficulty.difficulty
        const timeLimit = (() => {
          if (selectedStartedDifficulty.gameLevelDifficultyBody) {
            try {
              const parsedBody: PuzzlesDifficultiesBody = JSON.parse(
                selectedStartedDifficulty.gameLevelDifficultyBody,
              )
              return parsedBody.difficulty_timer
            } catch (e) {
              console.error("Parsing error in gameLevelDifficultyBody:", e)
            }
          }
          return difficultyTimeMap[difficulty]
        })()

        dispatch(
          setGameData({
            ...selectedStartedDifficulty,
            level: index,
            timeLimit,
            gameLevelImage: selectedStartedDifficulty.gameLevelImage,
            difficulty,
          }),
        )

        navigate("/games/puzzles/gameplay")
      } else {
        const newStartedLevel = await startLevel(startLevelPayload).unwrap()
        const difficulty = newStartedLevel.difficulty
        let timeLimit: number = difficultyTimeMap[difficulty]

        if (newStartedLevel.gameLevelDifficultyBody) {
          try {
            const parsedBody: PuzzlesDifficultiesBody = JSON.parse(
              newStartedLevel.gameLevelDifficultyBody,
            )
            if (parsedBody.difficulty_timer) {
              timeLimit = parsedBody.difficulty_timer
            }
          } catch (e) {
            console.error("Parsing error in gameLevelDifficultyBody:", e)
          }
        }

        dispatch(
          setGameData({
            ...newStartedLevel,
            level: index,
            timeLimit,
            gameLevelImage: newStartedLevel.gameLevelImage,
            difficulty,
          }),
        )

        navigate("/games/puzzles/gameplay")
      }
    } catch (error: unknown) {
      toast.error(t("Ошибка"), {
        description: t("Упс, что-то пошло не так"),
      })
    }

    setIsStartLocked(false)
  }

  return (
    <>
      <ChooseDifficultyForStarted
        onStartClick={onStartClick}
        isLoading={isStartLocked}
        clickSound={clickSound}
        {...startedLevel}
        index={index}
      >
        <button className="relative h-[60px] w-[60px]">
          <PassedLevelIcon className="relative h-[68px] w-[68px] -translate-x-1 -translate-y-0.5" />
          <span
            className={cn(
              "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-koulen text-[#AB5C13]",
              index > 99 ? "text-2xl" : "text-4xl",
            )}
          >
            {index}
          </span>
          <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-end">
            {claimedDifficulties.length === 0 ? (
              <>
                <StarDisabledIcon className="drop-shadow-[0px_2px_3px_rgba(0,0,0,0.2)]" />
                <StarDisabledIcon className="-mx-0.5 h-auto w-[22px] drop-shadow-[0px_2px_3px_rgba(0,0,0,0.2)]" />
                <StarDisabledIcon className="drop-shadow-[0px_2px_3px_rgba(0,0,0,0.2)]" />
              </>
            ) : claimedDifficulties.length === 1 ? (
              <>
                <StarIcon className="drop-shadow-[0px_2px_3px_rgba(0,0,0,0.2)]" />
                <StarDisabledIcon className="-mx-0.5 h-auto w-[22px] drop-shadow-[0px_2px_3px_rgba(0,0,0,0.2)]" />
                <StarDisabledIcon className="drop-shadow-[0px_2px_3px_rgba(0,0,0,0.2)]" />
              </>
            ) : claimedDifficulties.length === 2 ? (
              <>
                <StarIcon className="drop-shadow-[0px_2px_3px_rgba(0,0,0,0.2)]" />
                <StarIcon className="-mx-0.5 h-auto w-[22px] drop-shadow-[0px_2px_3px_rgba(0,0,0,0.2)]" />
                <StarDisabledIcon className="drop-shadow-[0px_2px_3px_rgba(0,0,0,0.2)]" />
              </>
            ) : (
              claimedDifficulties.length === 3 && (
                <>
                  <StarIcon className="drop-shadow-[0px_2px_3px_rgba(0,0,0,0.2)]" />
                  <StarIcon className="-mx-0.5 h-auto w-[22px] drop-shadow-[0px_2px_3px_rgba(0,0,0,0.2)]" />
                  <StarIcon className="drop-shadow-[0px_2px_3px_rgba(0,0,0,0.2)]" />
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
