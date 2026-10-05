import { useTranslation } from "react-i18next"

import LockIcon from "@/assets/games/puzzles/icons/lock-icon-inside-modal.svg?react"

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
      <ModalContent className="w-72" innerClassName="pb-6 pt-10 px-3.5">
        <ModalTitle className="sr-only">Locked Level</ModalTitle>
        <ModalDescription className="sr-only">
          This level is not available yet, go through the previous ones to
          unlock it
        </ModalDescription>

        <LockIcon className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-3.5 drop-shadow-[0px_4px_3px_rgba(0,0,0,0.25)]" />

        <h2 className="mb-2 bg-gradient-to-b from-[#FCF4ED] to-[#F6DFCB] bg-clip-text text-[32px]/[150%] font-bold text-transparent drop-shadow-[0px_2px_3px_rgba(0,0,0,0.25)]">
          {t("Закрыто")}
        </h2>
        <p className="text-center text-sm/4 font-semibold text-[#FFF7EF] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.2)]">
          {t(
            "Этот уровень пока недоступен, пройди предыдущие, чтобы разблокировать его",
          )}
        </p>
      </ModalContent>
    </Modal>
  )
}

export default LockedLevel
