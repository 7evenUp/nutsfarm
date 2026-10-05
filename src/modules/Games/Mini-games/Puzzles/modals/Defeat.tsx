import { Dispatch, SetStateAction } from "react"
import { useTranslation } from "react-i18next"

import RetryIcon from "@/assets/games/shared-icons/retry.svg?react"

import GameButton from "@/modules/Games/components/GameButton"

import { setGameData } from "@/redux/slices/puzzles"
import { useAppDispatch } from "@/redux/hooks"

import {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalTitle,
} from "../shared/Modal"

const Defeat = ({
  open,
  setOpen,
  onClose,
  wasClaimed,
}: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  onClose?: () => void
  wasClaimed: boolean
}) => {
  const { t } = useTranslation()

  const dispatch = useAppDispatch()

  const handleClick = () => {
    setOpen(false)
    dispatch(setGameData(null))
    onClose?.()
  }

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalContent
        className="w-80"
        innerClassName="px-[25px] pb-5 pt-4"
        onEscapeKeyDown={(evt) => evt.preventDefault()}
        onPointerDownOutside={(evt) => evt.preventDefault()}
        onInteractOutside={(evt) => evt.preventDefault()}
      >
        <ModalTitle className="sr-only">Defeat modal</ModalTitle>
        <ModalDescription className="sr-only">C'est dommage</ModalDescription>

        <h2 className="mb-1 bg-gradient-to-b from-[#FCF4ED] to-[#F6DFCB] bg-clip-text text-center font-days-one text-[32px]/[150%] text-transparent">
          {t("Поражение...")}
        </h2>

        {wasClaimed ? (
          <p className="text-balance text-center text-sm font-semibold text-[#FFF7EF]">
            {t(
              "Не расстраивайся, ты в любом случае уже получил награды за прохождение этой сложности",
            )}
          </p>
        ) : (
          <p className="text-balance text-center text-sm font-semibold text-[#FFF7EF]">
            {t("Тебе не удалось пройти уровень за отведенное время")}
          </p>
        )}

        <ModalClose>
          <div className="px-2.5">
            <GameButton
              appearance="puzzles"
              className="mt-6 h-10 w-full gap-[5px] px-4"
              onClick={handleClick}
            >
              {t("Попробовать еще раз")}
              <RetryIcon className="h-4 w-4" />
            </GameButton>
          </div>
        </ModalClose>
      </ModalContent>
    </Modal>
  )
}

export default Defeat
