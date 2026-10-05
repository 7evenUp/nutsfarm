import { useTranslation } from "react-i18next"

import LockIcon from "@/assets/games/cryptle/icons/level-lock.svg?react"

import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalTitle,
  ModalTrigger,
} from "../../shared/Modal"

const LockedLevel = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation()

  return (
    <Modal>
      <ModalTrigger asChild>{children}</ModalTrigger>
      <ModalContent className="w-72 px-6 pb-6 pt-[45px]">
        <ModalTitle className="sr-only">Locked Level</ModalTitle>
        <ModalDescription className="sr-only">
          This level is not available yet, go through the previous ones to
          unlock it
        </ModalDescription>

        <LockIcon className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-3.5 drop-shadow-[0px_2px_3px_rgba(0,0,0,0.3)]" />

        <h2 className="mb-2 bg-gradient-to-b from-[#7354D3] to-[#5239A7] bg-clip-text font-days-one text-[30px]/[150%] text-transparent">
          {t("Закрыто")}
        </h2>
        <p className="text-balance text-center text-sm/4 font-semibold text-[#463190]/75">
          {t(
            "Этот уровень пока недоступен, пройди предыдущие, чтобы разблокировать его",
          )}
        </p>
      </ModalContent>
    </Modal>
  )
}

export default LockedLevel
