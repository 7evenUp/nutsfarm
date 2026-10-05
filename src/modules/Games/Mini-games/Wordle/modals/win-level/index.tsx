import { useNavigate } from "react-router-dom"
import { Dispatch, SetStateAction } from "react"
import { useTranslation } from "react-i18next"

import NutsIcon from "@/assets/task-icons/Nuts.svg?react"

import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalTitle,
} from "../../shared/Modal"

import GameButton from "@/modules/Games/components/GameButton"

import { numberWithSpaces } from "@/utils/numberWithSpaces"

import { cn } from "@/lib/cn"

interface BuyEnergyModalProps {
  open: boolean
  bet?: number
  reward?: number
  betReward?: number
  isBet?: boolean
  isBetWin?: boolean
  isBetLose?: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
}

const WinLevelModal = ({
  open,
  bet,
  reward,
  betReward,
  isBet,
  isBetWin,
  isBetLose,
}: BuyEnergyModalProps) => {
  const { t } = useTranslation()

  const navigate = useNavigate()

  const handleClick = () => {
    navigate("/games/cryptle")
  }

  return (
    <Modal open={open} onOpenChange={() => undefined}>
      <ModalContent
        className={cn(
          "h-[320px] w-[310px] shadow-[#0B0C48]/25 outline-none",
          !isBet && "h-[250px]",
        )}
        onEscapeKeyDown={(evt) => evt.preventDefault()}
        onPointerDownOutside={(evt) => evt.preventDefault()}
        onInteractOutside={(evt) => evt.preventDefault()}
      >
        <ModalTitle className="sr-only">Cryptle win level modal</ModalTitle>
        <ModalDescription className="sr-only">
          Cryptle win level modal
        </ModalDescription>

        <div className="h-full pt-6">
          <h1 className="mb-3 bg-gradient-to-b from-[#7C5CE0] to-[#5239A7] bg-clip-text text-center font-days-one text-3xl text-transparent">
            {t("Победа!")}
          </h1>
          <span className="mb-4 flex justify-center font-nunito text-sm/4 font-semibold text-[#463190]/75">
            {t("Уровень пройден!")}
          </span>
          <div className="mx-auto mb-5 flex w-[204px] flex-col items-center justify-center gap-1 rounded-lg border border-[#3A2485]/75 bg-gradient-to-b from-[#7F60E5]/90 to-[#573DAE]/90 py-3">
            <span className="font-nunito text-sm/4 font-semibold">
              {t("Награда за прохождение")}
            </span>
            <div className="flex gap-1.5">
              <NutsIcon className="h-[18px] w-[18px]" />
              <p className="font-nunito text-sm font-bold">
                {reward ? numberWithSpaces(reward) : ""}
              </p>
            </div>
          </div>

          {isBet && (
            <div className="">
              {isBetWin && (
                <span className="mb-3 flex justify-center font-nunito text-sm/4 font-semibold text-[#463190]/75">
                  {t("Твоя ставка оправдалась!")}
                </span>
              )}
              {isBetLose && (
                <span className="mb-1 flex w-[270px] justify-center text-center font-nunito text-sm/4 font-semibold text-[#463190]/75">
                  {t("К сожалению, твоя ставка не оправдалась...")}
                </span>
              )}
              {isBetWin && (
                <div className="mb-1 flex items-center justify-center gap-2 phone-xsm:mb-3.5">
                  <p className="text-center font-nunito text-sm/4 font-bold text-[#463190]/75">
                    {t("Выигрыш")}
                  </p>
                  <div className="flex items-center justify-center gap-1 rounded-[36px] border border-[#3A2485]/50 bg-gradient-to-b from-[#7F60E5] to-[#573DAE] px-1.5 py-1">
                    <NutsIcon className="h-3.5 w-3.5" />
                    <p className="font-nunito text-xs font-bold">
                      {betReward ? numberWithSpaces(betReward) : ""}
                    </p>
                  </div>
                </div>
              )}
              {isBetLose && (
                <div className="mb-1 flex items-center justify-center gap-2 phone-xsm:mb-3.5">
                  <p className="text-center font-nunito text-sm/4 font-bold text-[#463190]/75">
                    {t("Ты теряешь")}
                  </p>
                  <div className="flex items-center justify-center gap-1 px-1.5 py-1">
                    <NutsIcon className="h-3.5 w-3.5" />
                    <p className="font-nunito text-xs font-bold text-[#463190]/75">
                      {bet ? numberWithSpaces(bet) : ""}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <GameButton
            appearance="cryptle"
            className="mx-auto h-10 px-12"
            onClick={() => handleClick()}
          >
            {t("Следующий уровень")}
          </GameButton>
        </div>
      </ModalContent>
    </Modal>
  )
}

export default WinLevelModal
