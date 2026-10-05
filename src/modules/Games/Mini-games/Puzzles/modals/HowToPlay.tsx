import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalTitle,
  ModalTrigger,
} from "../shared/Modal"

import GameButton from "@/modules/Games/components/GameButton"

import { sendMetrika } from "@/utils/sendMetrika"

const HowToPlay = ({
  children,
  showCloseButton,
}: {
  children: React.ReactNode
  showCloseButton?: boolean
}) => {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) {
      sendMetrika("nuts_blocks_how_to")
    }
  }, [open])

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalTrigger asChild>{children}</ModalTrigger>
      <ModalContent className="w-80" innerClassName="pt-4 px-6 pb-[18px]">
        <ModalTitle className="sr-only">How To Play modal</ModalTitle>
        <ModalDescription className="sr-only">
          How To Play modal
        </ModalDescription>

        <h2 className="bg-gradient-to-b from-[#FCF4ED] to-[#F6DFCB] bg-clip-text text-4xl/[150%] font-bold text-transparent drop-shadow-[0px_2px_3px_rgba(0,0,0,0.25)]">
          {t("Как играть?")}
        </h2>

        <p className="mb-[18px] mt-3 text-balance text-center text-sm/4 font-semibold text-[#FFF7EF] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.2)]">
          {t("Собери одного из наших NFT ‘Nutcrackers’ за отведенное время.")}
        </p>

        <p className="text-balance text-center text-sm/4 font-semibold text-[#FFF7EF] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.2)]">
          {t(
            "Перетаскивай пазлы из блока снизу и вставляй на подходящие места на картинке.",
          )}
        </p>

        {showCloseButton && (
          <ModalClose asChild>
            <GameButton appearance="puzzles" className="mt-7 h-10 px-[30px]">
              {t("Понятно, поехали!")}
            </GameButton>
          </ModalClose>
        )}
      </ModalContent>
    </Modal>
  )
}

export default HowToPlay
