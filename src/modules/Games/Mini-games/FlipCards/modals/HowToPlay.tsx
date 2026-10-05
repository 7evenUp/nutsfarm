import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import CardBackfaceIcon from "@/assets/games/flip-cards/icons/card-backface.svg?react"
import CryptonIcon from "@/assets/games/flip-cards/icons/crypton.svg?react"

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
      sendMetrika("metamatch_how_to")
    }
  }, [open])

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalTrigger asChild>{children}</ModalTrigger>
      <ModalContent className="w-80 border-black px-6 pb-5 pt-8">
        <ModalTitle className="sr-only">How To Play modal</ModalTitle>
        <ModalDescription className="sr-only">
          How To Play modal
        </ModalDescription>

        <h2 className="mb-1 bg-gradient-to-b from-[#0F0C5A] to-[#564C9F] bg-clip-text font-days-one text-[30px]/[150%] text-transparent">
          {t("Как играть?")}
        </h2>
        <p className="text-balance text-center text-sm/4 font-semibold text-[#382E6D]/60">
          {t("Переворачивай плитки и собирай пары из двух одинаковыx")}
        </p>
        <div className="my-7 flex gap-2">
          <div className="flex h-[60px] w-[60px] items-center justify-center rounded-xl border-2 border-[#D02B2D] bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-[#153672] to-[#010036]">
            <CryptonIcon />
          </div>
          <div className="flex h-[60px] w-[60px] items-center justify-center rounded-xl border border-[#382E6D]/60 bg-[#838DB7]/90">
            <CardBackfaceIcon />
          </div>
          <div className="flex h-[60px] w-[60px] items-center justify-center rounded-xl border border-[#382E6D]/60 bg-[#838DB7]/90">
            <CardBackfaceIcon />
          </div>
          <div className="flex h-[60px] w-[60px] items-center justify-center rounded-xl border-2 border-[#D02B2D] bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-[#153672] to-[#010036]">
            <CryptonIcon />
          </div>
        </div>

        {showCloseButton && (
          <ModalClose asChild>
            <GameButton appearance="flip-cards" className="h-10 w-[218px]">
              {t("Понятно, поехали!")}
            </GameButton>
          </ModalClose>
        )}
      </ModalContent>
    </Modal>
  )
}

export default HowToPlay
