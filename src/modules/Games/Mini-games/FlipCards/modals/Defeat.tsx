import { Dispatch, SetStateAction } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

import RetryIcon from "@/assets/games/shared-icons/retry.svg?react"

import {
  AlertModal,
  AlertModalClose,
  AlertModalContent,
  AlertModalDescription,
  AlertModalTitle,
} from "../shared/AlertModal"

import GameButton from "@/modules/Games/components/GameButton"

const Defeat = ({
  open,
  setOpen,
  wasClaimed,
}: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  wasClaimed: boolean
}) => {
  const { t } = useTranslation()

  const navigate = useNavigate()

  const onRetryClick = () => {
    navigate("/games/flip-cards")
  }

  return (
    <AlertModal open={open} onOpenChange={setOpen}>
      <AlertModalContent
        className="w-80 border-black px-12 pb-5 pt-6"
        onEscapeKeyDown={(evt) => evt.preventDefault()}
      >
        <AlertModalTitle className="sr-only">Defeat modal</AlertModalTitle>
        <AlertModalDescription className="sr-only">
          C'est dommage
        </AlertModalDescription>

        <h2 className="mb-1 bg-gradient-to-b from-[#0F0C5A] to-[#564C9F] bg-clip-text font-days-one text-[30px]/[150%] text-transparent">
          {t("Поражение...")}
        </h2>
        {wasClaimed ? (
          <p className="text-balance text-center text-sm/4 font-semibold text-[#382E6D]">
            {t(
              "Не расстраивайся, ты в любом случае уже получил награды за прохождение этой сложности",
            )}
          </p>
        ) : (
          <p className="text-balance text-center text-sm/4 font-semibold text-[#382E6D]">
            {t("Тебе не удалось пройти уровень за отведенное количество ходов")}
          </p>
        )}

        <AlertModalClose asChild>
          <GameButton
            appearance="flip-cards"
            className="mt-6 h-10 w-full gap-[5px]"
            onClick={onRetryClick}
          >
            {t("Попробовать еще раз")}
            <RetryIcon className="h-4 w-4" />
          </GameButton>
        </AlertModalClose>
      </AlertModalContent>
    </AlertModal>
  )
}

export default Defeat
