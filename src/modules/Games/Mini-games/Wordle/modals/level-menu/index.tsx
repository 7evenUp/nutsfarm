import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import * as Collapsible from "@radix-ui/react-collapsible"
import { useTranslation } from "react-i18next"

import Loader from "@/assets/icons/loader.svg?react"
import NutsIcon from "@/assets/task-icons/Nuts.svg?react"
import CustomEnergyIcon from "../buy-energy/CustomEnergyIcon"
import ChevronDownIcon from "@/assets/games/shared-icons/chevron-down.svg?react"

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalDescription,
  ModalTitle,
} from "../../shared/Modal"

import GameButton from "@/modules/Games/components/GameButton"

import {
  useFailLevelMutation,
  useGetGameEnergyQuery,
  useStartLevelMutation,
} from "@/redux/api/games"
import { useGetCurrentUserQuery } from "@/redux/api/user"
import { useAppDispatch } from "@/redux/hooks"
import { setGameData } from "@/redux/slices/games"

import { GameLevel } from "@/types/games"

import { numberWithSpaces } from "@/utils/numberWithSpaces"
import { encryptToken } from "@/utils/encrypt"
import { sendMetrika } from "@/utils/sendMetrika"
import { Sound } from "@/utils/Sound"

import { cn } from "@/lib/cn"

interface LevelMenuModalProps {
  open: boolean
  gameLevel: GameLevel
  onOpenChange: Dispatch<SetStateAction<boolean>>
  betSound: Sound
  levelNumber: number
}

const betDependence: { [k: string]: number } = {
  "5": 1,
  "4": 1.25,
  "3": 2,
  "2": 3,
  "1": 10,
}

const LevelMenuModal = ({
  open,
  gameLevel,
  onOpenChange,
  betSound,
  levelNumber,
}: LevelMenuModalProps) => {
  const { t } = useTranslation()

  const { difficulties, status, id } = gameLevel

  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [bet, setBet] = useState<number | null>(null)
  const [betData, setBetData] = useState<{
    bet: number
    betRatio: number
  } | null>(null)
  const [tryies, setTryies] = useState<number | null>(null)
  const [isStartLocked, setIsStartLocked] = useState<boolean>(false)

  const { data: currentUser } = useGetCurrentUserQuery()
  const { data: gameEnergy } = useGetGameEnergyQuery()

  const [failLevel] = useFailLevelMutation()
  const [startLevel] = useStartLevelMutation()

  const isStartDisabled = useMemo(() => {
    if (!difficulties) return true
    if (!currentUser) return true
    if (!gameEnergy) return true

    if (currentUser.balance < difficulties[0].price) return true
    if (gameEnergy.gameEnergy < difficulties[0].energyPrice) return true

    return false
  }, [difficulties, currentUser])

  const isBetPossible = useMemo(() => {
    if (status === "PENDING" || status === "FAILED") return false

    return true
  }, [status])

  useEffect(() => {
    if (currentUser && currentUser.balance) {
      const lowerTwoThousand = Math.min(
        Math.floor(currentUser.balance / 20),
        2000,
      )
      const higherThreeThudreed = Math.max(lowerTwoThousand, 300)

      if (higherThreeThudreed > currentUser.balance / 20) return
      setBet(higherThreeThudreed)
    }
  }, [currentUser])

  const handleMakeBet = () => {
    if (!bet) return

    if (!tryies) return
    if (!isBetPossible) return
    betSound.play()
    setBetData({ bet, betRatio: betDependence[tryies] })
  }

  const onStartClick = async (difficultyId: string) => {
    if (!currentUser) return
    if (isStartLocked) return

    sendMetrika("play_cryptle")

    setIsStartLocked(true)

    if (status && status === "PENDING") {
      try {
        const token = encryptToken(
          difficultyId,
          currentUser.telegramId.toString(),
          "1970.01.01 00:00",
        )

        await failLevel({
          token,
          gameType: "WORDLY",
          id: String(id),
        }).unwrap()
      } catch (error) {
        toast.error(t("Ошибка"), {
          description: t("Упс, что-то пошло не так"),
        })
      }
    }

    try {
      const token = encryptToken(
        difficultyId,
        currentUser.telegramId.toString(),
        "1970.01.01 00:00",
      )

      const data = await startLevel({
        token,
        gameType: "WORDLY",
        gameLevelDifficultyId: difficultyId,
        ...betData,
      }).unwrap()
      dispatch(setGameData({ ...data, levelNumber }))

      navigate("/games/cryptle/gameplay")
      onOpenChange(false)
    } catch (error) {
      toast.error(t("Ошибка"), {
        description: t("Упс, что-то пошло не так"),
      })
    }

    setIsStartLocked(false)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="w-[295px] shadow-[#0B0C48]/25 outline-none data-[state=open]:duration-200 phone-xsm:w-[312px]">
        <ModalTitle className="sr-only">Cryptle level menu modal</ModalTitle>
        <ModalDescription className="sr-only">
          Cryptle level menu modal
        </ModalDescription>

        <ModalHeader className="w-full">
          {t("Уровень")} {levelNumber}
        </ModalHeader>

        <div className="flex h-full w-full flex-col items-center px-6 pb-5 pt-6">
          <Collapsible.Root className="mb-3 w-full rounded-[10px] border border-[#463190]/20 phone-xsm:mb-6">
            <Collapsible.Trigger className="group relative flex h-9 w-full items-center justify-center">
              <span className="text-sm/4 font-bold text-[#463190]/75">
                {isBetPossible ? t("Условия") : t("Ставка недоступна")}
              </span>
              <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-[#463190] transition-transform group-data-[state=open]:rotate-180" />
            </Collapsible.Trigger>

            <Collapsible.Content className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
              <div
                className={cn(
                  "flex flex-col px-4 pb-3.5",
                  !isBetPossible && "pointer-events-none opacity-20",
                )}
              >
                <p className="mb-3 text-balance text-center font-nunito text-xs font-semibold text-[#463190]/50 phone-xsm:mb-[18px]">
                  {t(
                    "Сделай ставку, за какое количество попыток ты угадаешь слово, и получи дополнительные NUTS в случае успеха!",
                  )}
                </p>
                {/* Possibile coins win */}
                <div className="mb-3 flex items-center justify-center gap-2 phone-xsm:mb-5">
                  <p className="text-center font-nunito text-sm/4 font-bold text-[#463190]/75">
                    {t("Выигрыш")}
                  </p>
                  <div className="flex items-center justify-center gap-1 rounded-[36px] border border-[#3A2485]/50 bg-gradient-to-b from-[#7F60E5]/90 to-[#5B41B4]/90 px-1.5 py-1">
                    <NutsIcon className="h-3.5 w-3.5" />
                    <p className="min-w-[30px] text-center font-nunito text-xs font-bold text-white">
                      {bet && tryies
                        ? numberWithSpaces(bet * betDependence[tryies])
                        : "0"}
                    </p>
                  </div>
                </div>
                {/* Select guess word tryes */}
                <div className="mb-3 flex flex-col gap-2 phone-xsm:mb-5">
                  <p className="text-center font-nunito text-sm/4 font-bold text-[#463190]/75">
                    {t("Количество попыток")}
                  </p>
                  <div className="flex justify-center gap-2.5">
                    {Array(4)
                      .fill(null)
                      .map((_, index) => {
                        return (
                          <button
                            key={`hard${index}`}
                            onClick={() => {
                              if (betData) return
                              if (index + 1 === tryies) setTryies(null)
                              else setTryies(index + 1)
                              betSound.play()
                            }}
                            className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-b from-[#DEEAFF] to-[#EFF4FF] shadow-[0_1px_0_rgba(91,87,179,0.30)]",
                              index + 1 === tryies &&
                                "from-[#E2EBFE] to-[#D3D5FF]",
                            )}
                          >
                            <span
                              className={cn(
                                "bg-gradient-to-b from-[#A3C0F3] to-[#CEDFFC] bg-clip-text font-nunito text-2xl font-black text-transparent",
                                index + 1 === tryies &&
                                  "from-[#7B5BDE] to-[#260D7E]",
                              )}
                            >
                              {index + 1}
                            </span>
                          </button>
                        )
                      })}
                  </div>
                </div>
                {betData ? (
                  <button
                    className="flex h-9 w-full items-center justify-center rounded-md border border-[#7D6ABA]/30 bg-gradient-to-b from-[#D3D5FF] to-[#E2EBFE] text-[#463190] shadow-[0_1px_0_rgba(91,87,179,0.30)] disabled:border-[#A8C0E9]/30 disabled:from-[#DEEAFF] disabled:to-[#E5EEFF] disabled:text-[#96B3E5] disabled:shadow-none"
                    onClick={() => handleMakeBet()}
                    disabled={true}
                  >
                    <p className="text-center text-sm/4 font-bold">
                      {t("Ставка сделана")}
                    </p>
                    {/* <p className="flex items-center justify-center text-sm/4 font-bold">
                      Выигрыш{" "}
                      <NutsIcon className="mx-2 h-5 w-5 rounded-full shadow-lg" />{" "}
                      {betData.bet * betData.ratio}
                    </p> */}
                  </button>
                ) : !bet ? (
                  <button
                    className="group flex h-9 w-full items-center justify-center rounded-md border border-[#7D6ABA]/30 bg-gradient-to-b from-[#D3D5FF] to-[#E2EBFE] text-[#463190] shadow-[0_1px_0_rgba(91,87,179,0.30)] disabled:border-[#A8C0E9]/30 disabled:from-[#DEEAFF] disabled:to-[#E5EEFF] disabled:text-[#96B3E5] disabled:shadow-none"
                    disabled={true}
                  >
                    <p className="flex items-center justify-center text-sm/4 font-bold">
                      {t("Недостаточно средств")}
                    </p>
                  </button>
                ) : (
                  <button
                    className="group flex h-9 w-full items-center justify-center rounded-md border border-[#7D6ABA]/30 bg-gradient-to-b from-[#D3D5FF] to-[#E2EBFE] text-[#463190] shadow-[0_1px_0_rgba(91,87,179,0.30)] disabled:border-[#A8C0E9]/30 disabled:from-[#DEEAFF] disabled:to-[#E5EEFF] disabled:text-[#96B3E5] disabled:shadow-none"
                    onClick={() => handleMakeBet()}
                    disabled={!tryies}
                  >
                    <p className="flex items-center justify-center text-sm/4 font-bold">
                      {t("Поставить")}{" "}
                      <NutsIcon className="ml-1.5 mr-1 h-[18px] w-[18px] rounded-full drop-shadow-[0px_1px_1px_rgba(0,0,0,0.2)] group-disabled:opacity-50 group-disabled:drop-shadow-none" />{" "}
                      {bet ? numberWithSpaces(bet) : 0}
                    </p>
                  </button>
                )}
              </div>
            </Collapsible.Content>
          </Collapsible.Root>

          <div className="mb-4 flex gap-14 phone-xsm:mb-7">
            <div className="flex flex-col items-start justify-center gap-2">
              <p className="text-center font-nunito text-sm/4 font-semibold text-[#463190]/75">
                {t("Стоимость")}
              </p>
              <div className="flex gap-1">
                <div className="flex h-8 items-center justify-center gap-1 text-[#463190]">
                  <CustomEnergyIcon status="fill" className="h-6 w-6" />
                  <p className="font-nunito font-bold">
                    {difficulties[0].energyPrice}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start justify-center gap-2">
              <p className="text-center font-nunito text-sm/4 font-semibold text-[#463190]/75">
                {t("Награда.сложность")}
              </p>
              <div className="flex h-8 items-center justify-center gap-1.5 rounded-md border border-[#3A2485]/75 bg-gradient-to-b from-[#7F60E5]/90 to-[#5B41B4]/90 px-2.5">
                <NutsIcon className="h-[18px] w-[18px]" />
                <p className="font-nunito text-sm font-bold text-white">
                  {numberWithSpaces(difficulties[0].reward)}
                </p>
              </div>
            </div>
          </div>

          {isStartLocked ? (
            <GameButton
              appearance="cryptle"
              className="mt-auto h-10 w-full px-7"
            >
              <Loader className="h-4 w-4 animate-spin" />
            </GameButton>
          ) : (
            <GameButton
              appearance="cryptle"
              disabled={isStartDisabled}
              className="mt-auto h-10 w-full px-7"
              onClick={() => onStartClick(difficulties[0].id)}
            >
              {t("Играть")}
            </GameButton>
          )}
        </div>
      </ModalContent>
    </Modal>
  )
}

export default LevelMenuModal
