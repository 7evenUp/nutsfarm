import { Dispatch, SetStateAction } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

import ArrowRight from "@/assets/games/shared-icons/arrow-right.svg?react"
import CoinIcon from "@/assets/games/shared-icons/coin-icon.svg?react"

import {
  AlertModal,
  AlertModalContent,
  AlertModalDescription,
  AlertModalTitle,
} from "../shared/AlertModal"

import GameButton from "@/modules/Games/components/GameButton"

import { useAppSelector } from "@/redux/hooks"

import { numberWithSpaces } from "@/utils/numberWithSpaces"

const Victory = ({
  open,
  setOpen,
  stepsDone,
  wasClaimed,
}: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  stepsDone: number
  wasClaimed: boolean
}) => {
  const { t } = useTranslation()

  const navigate = useNavigate()

  const { startedDifficulty } = useAppSelector(
    (state) => state.flipCardsGameplay,
  )

  if (startedDifficulty === null) return

  const onNextLevelClick = () => {
    navigate("/games/flip-cards")
  }

  return (
    <AlertModal open={open} onOpenChange={setOpen}>
      <AlertModalContent
        className="w-80 border-black px-12 pb-5 pt-8"
        onEscapeKeyDown={(evt) => evt.preventDefault()}
      >
        <AlertModalTitle className="sr-only">Victory modal</AlertModalTitle>
        <AlertModalDescription className="sr-only">
          Congratulations, You have won!
        </AlertModalDescription>

        <h2 className="mb-1 bg-gradient-to-b from-[#0F0C5A] to-[#564C9F] bg-clip-text font-days-one text-[30px]/[150%] text-transparent">
          {t("Победа!")}
        </h2>
        <p className="text-balance text-center text-sm/4 font-semibold text-[#382E6D]">
          {t("Уровень пройден!")}
        </p>

        <div className="mb-2 mt-6 flex h-8 w-full items-center justify-center rounded-md border border-[#382E6D] bg-gradient-to-b from-[#51497B]/90 to-[#463E6B]/90 text-sm/4 text-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.2)]">
          <p className="font-semibold">
            {t("Количество ходов")}{" "}
            <span className="font-extrabold">{stepsDone}</span>
          </p>
        </div>
        <div className="flex h-[62px] w-full flex-col items-center gap-1.5 rounded-md border border-[#382E6D] bg-gradient-to-b from-[#51497B]/90 to-[#463E6B]/90 pt-[5px] text-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.2)]">
          {wasClaimed ? (
            <span className="text-balance text-center text-sm/[150%] font-bold">
              {t("Вы уже получали награду за прохождение этой сложности")}
            </span>
          ) : (
            <>
              <span className="text-sm/[150%] font-bold">
                {t("Награда за прохождение")}
              </span>
              <div className="flex items-center gap-2">
                <CoinIcon className="h-[18px] w-[18px]" />
                <span className="text-sm/none font-bold">
                  {numberWithSpaces(startedDifficulty.reward)}
                </span>
              </div>
            </>
          )}
        </div>

        <GameButton
          appearance="flip-cards"
          className="mt-6 h-10 w-full gap-[5px]"
          onClick={onNextLevelClick}
        >
          {t("Следующий уровень")}
          <ArrowRight />
        </GameButton>
      </AlertModalContent>
    </AlertModal>
  )
}

export default Victory
