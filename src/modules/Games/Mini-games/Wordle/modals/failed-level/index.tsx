import { Dispatch, SetStateAction } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

import {
  Modal,
  ModalContent,
  ModalTitle,
  ModalDescription,
} from "../../shared/Modal"

import GameButton from "@/modules/Games/components/GameButton"

const FailedLevelModal = ({
  open,
}: {
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
}) => {
  const { t } = useTranslation()

  const navigate = useNavigate()

  const handleClick = () => {
    navigate("/games/cryptle")
  }

  return (
    <Modal open={open} onOpenChange={() => undefined}>
      <ModalContent
        className="h-[180px] w-[310px] shadow-[#0B0C48]/25 outline-none"
        onEscapeKeyDown={(evt) => evt.preventDefault()}
        onPointerDownOutside={(evt) => evt.preventDefault()}
        onInteractOutside={(evt) => evt.preventDefault()}
      >
        <ModalTitle className="sr-only">Cryptle fail level modal</ModalTitle>
        <ModalDescription className="sr-only">
          Cryptle fail level modal
        </ModalDescription>

        <div className="pt h-full pt-6">
          <h1 className="mb-3 bg-gradient-to-b from-[#9BA5F2] to-[#AAC3EB] bg-clip-text text-center font-days-one text-3xl text-transparent">
            {t("Поражение...")}
          </h1>
          <span className="mb-4 flex max-w-[270px] justify-center text-center font-nunito text-sm/4 font-semibold text-[#463190]/75">
            {t("Тебе не удалось пройти уровень за отведенное количество ходов")}
          </span>

          <GameButton
            appearance="cryptle"
            className="h-10 w-full"
            onClick={() => handleClick()}
          >
            {t("Попробовать еще раз")}
          </GameButton>
        </div>
      </ModalContent>
    </Modal>
  )
}

export default FailedLevelModal
