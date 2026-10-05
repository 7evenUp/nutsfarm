import { useTranslation } from "react-i18next"

import LockIcon from "@/assets/games/flip-cards/icons/lock.svg?react"

import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalTitle,
  ModalTrigger,
} from "../shared/Modal"

const LockedLevel = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation()

  return (
    <Modal>
      <ModalTrigger asChild>{children}</ModalTrigger>
      <ModalContent className="w-72 px-6 py-8">
        <ModalTitle className="sr-only">Locked Level</ModalTitle>
        <ModalDescription className="sr-only">
          This level is not available yet, go through the previous ones to
          unlock it
        </ModalDescription>

        <LockIcon className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2" />

        <h2 className="mb-1 bg-gradient-to-b from-[#0F0C5A] to-[#564C9F] bg-clip-text font-days-one text-[30px]/[150%] text-transparent">
          {t("Закрыто")}
        </h2>
        <p className="text-balance text-center text-sm/4 font-semibold text-[#382E6D]">
          {t(
            "Этот уровень пока недоступен, пройди предыдущие, чтобы разблокировать его",
          )}
        </p>
      </ModalContent>
    </Modal>
  )
}

export default LockedLevel
