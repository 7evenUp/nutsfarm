import { Dispatch, SetStateAction } from "react"
import { useTranslation } from "react-i18next"

import CoinIcon from "@/assets/games/shared-icons/coin-icon.svg?react"
import ArrowRight from "@/assets/games/shared-icons/arrow-right.svg?react"

import Hourglass from "@/modules/Games/Mini-games/Puzzles/assets/images/hourglass.png"

import {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalTitle,
} from "../shared/Modal"

import GameButton from "@/modules/Games/components/GameButton"

import { setGameData } from "@/redux/slices/puzzles"
import { useAppDispatch } from "@/redux/hooks"

import { getMinutes, getSeconds } from "@/utils/date"
import { numberWithSpaces } from "@/utils/numberWithSpaces"

const Victory = ({
  open,
  setOpen,
  ellapsedTime,
  coinsClaimed,
  onClose,
  wasClaimed,
}: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  stepsDone?: number
  ellapsedTime: number
  coinsClaimed: number
  onClose?: () => void
  wasClaimed: boolean
}) => {
  const { t } = useTranslation()

  const dispatch = useAppDispatch()

  const handleNextLvlClick = () => {
    setOpen(false)
    dispatch(setGameData(null))
    onClose?.()
  }

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalContent
        className="w-80"
        innerClassName="py-4 px-7"
        onEscapeKeyDown={(evt) => evt.preventDefault()}
        onPointerDownOutside={(evt) => evt.preventDefault()}
        onInteractOutside={(evt) => evt.preventDefault()}
      >
        <ModalTitle className="sr-only">Victory modal</ModalTitle>
        <ModalDescription className="sr-only">
          Congratulations, You have won!
        </ModalDescription>

        <h2 className="mb-1 bg-gradient-to-b from-[#FEE222] to-[#FCC52B] bg-clip-text text-center text-[36px]/[150%] font-bold text-transparent">
          {t("Победа!")}
        </h2>
        <p className="text-balance text-center text-sm/4 font-bold text-[#FFDFBF]">
          {t("Ты успешно собрал пазл!")}
        </p>

        <div className="mb-3 mt-6 flex h-[59px] w-full items-center justify-center rounded-md border border-[#6B3B05]/60 bg-gradient-to-b from-[#96550B]/90 to-[#5A3104]/90 text-sm/4 text-[#FFF1E5] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.2)]">
          <div className="flex flex-col items-center justify-center gap-2.5 font-bold">
            <span>{t("Время прохождения")}: </span>
            <div className="flex items-center gap-1.5">
              <img
                src={Hourglass}
                alt="Timer icon"
                className="h-[17px] w-3.5"
              />
              <span className="text-[#FFDFBF]">
                {ellapsedTime
                  ? `${getMinutes(ellapsedTime / 1000)}:${getSeconds(ellapsedTime / 1000)}`
                  : "00:00"}
              </span>
            </div>
          </div>
        </div>
        <div className="mb-2 flex h-[59px] w-full items-center justify-center rounded-md border border-[#6B3B05]/60 bg-gradient-to-b from-[#96550B]/90 to-[#5A3104]/90 text-sm/4 text-[#FFF1E5] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.2)]">
          <div className="flex flex-col items-center justify-center gap-2.5 font-bold">
            {wasClaimed ? (
              <span className="text-balance text-center">
                {t("Вы уже получали награду за прохождение этой сложности")}
              </span>
            ) : (
              <>
                <span>{t("Награда за прохождение")}</span>
                <div className="flex items-center gap-1">
                  <CoinIcon className="h-[18px] w-[18px]" />
                  <span className="text-sm/none font-bold">
                    {numberWithSpaces(coinsClaimed)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <ModalClose asChild onClick={handleNextLvlClick}>
          <GameButton
            appearance="puzzles"
            className="mt-6 h-10 w-full gap-[5px]"
          >
            {t("Следующий уровень")}
            <ArrowRight />
          </GameButton>
        </ModalClose>
      </ModalContent>
    </Modal>
  )
}

export default Victory
