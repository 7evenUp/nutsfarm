import { Dispatch, SetStateAction, useEffect } from "react"
import { useTranslation } from "react-i18next"

import { Cell } from "../../core/components/Board/Cell"

import {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "../../shared/Modal"
import GameButton from "@/modules/Games/components/GameButton"

import { useAppSelector } from "@/redux/hooks"

import { sendMetrika } from "@/utils/sendMetrika"

interface GameRulesModalProps {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: Dispatch<SetStateAction<boolean>>
  showCloseButton?: boolean
}

const GameRulesModal = ({
  children,
  open,
  onOpenChange,
  showCloseButton,
}: GameRulesModalProps) => {
  const { t } = useTranslation()

  const lang = useAppSelector((state) => state.language.value)

  const exampleWord1 = lang === "RU" ? "ШАПКА" : "APPLE"
  const exampleWord2 = lang === "RU" ? "КОНЕК" : "MAGIC"
  const exampleWord3 = lang === "RU" ? "БАТОН" : "OCEAN"

  useEffect(() => {
    if (open) {
      sendMetrika("cryptle_how_to")
    }
  }, [open])

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      {children && <ModalTrigger asChild>{children}</ModalTrigger>}
      <ModalContent className="w-[312px] shadow-[#0B0C48]/25">
        <ModalTitle className="sr-only">Game rules</ModalTitle>
        <ModalDescription className="sr-only">Game rules</ModalDescription>

        <ModalHeader className="w-full">{t("Как играть?")}</ModalHeader>

        <div className="h-full px-6 py-4">
          {/* Rules block */}
          <div className="mb-5">
            {/* First descriprions block */}
            <div className="mb-5 flex flex-col gap-2 text-[#463190]/75">
              <p className="text-center text-xs/3 font-semibold phone-sm-fix:text-sm/4">
                {t("Угадай слово из 5 букв с")}{" "}
                <span className="font-extrabold">{t("6 попыток")}</span>{" "}
                {t("или менее. Используй только существующие слова")}
              </p>

              <p className="text-center text-xs/3 font-semibold phone-sm-fix:text-sm/4">
                {t(
                  "После каждой попытки плитки показывают насколько близко была твоя догадка",
                )}
              </p>
            </div>

            {/* Exmaple first  block */}
            <div className="mb-5 flex flex-col gap-2">
              <div className="flex justify-center gap-1.5 phone-sm-fix:gap-2">
                {exampleWord1.split("").map((letter, i) => {
                  return (
                    <Cell
                      index={i}
                      key={`first${letter}${i}`}
                      letter={letter}
                      status={i === 0 ? "correct" : "empty"}
                      skin="DEFAULT"
                      isDemo={true}
                    />
                  )
                })}
              </div>
              <p className="text-center text-xs/3 font-semibold text-[#463190]/75 phone-sm-fix:text-sm/4">
                {t(
                  "Буква, подсвеченная зеленым, правильная и на правильном месте",
                )}
              </p>
            </div>
            {/* Exmaple second  block */}
            <div className="mb-5 flex flex-col gap-2">
              <div className="flex justify-center gap-1.5 phone-sm-fix:gap-2">
                {exampleWord2.split("").map((letter, i) => {
                  return (
                    <Cell
                      index={i}
                      key={`second${letter}${i}`}
                      letter={letter}
                      status={i === 2 ? "present" : "empty"}
                      skin="DEFAULT"
                      isDemo={true}
                    />
                  )
                })}
              </div>
              <p className="text-center text-xs/3 font-semibold text-[#463190]/75 phone-sm-fix:text-sm/4">
                {t(
                  "Буква, подсвеченная желтым, правильная, но не на том месте",
                )}
              </p>
            </div>
            {/* Exmaple third  block */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-center gap-1.5 phone-sm-fix:gap-2">
                {exampleWord3.split("").map((letter, i) => {
                  return (
                    <Cell
                      index={i}
                      key={`third${letter}${i}`}
                      letter={letter}
                      status={i === 4 ? "absent" : "empty"}
                      skin="DEFAULT"
                      isDemo={true}
                    />
                  )
                })}
              </div>
              <p className="text-center text-xs/3 font-semibold text-[#463190]/75 phone-sm-fix:text-sm/4">
                {t("Буква, подсвеченная серым, неправильная")}
              </p>
            </div>
          </div>

          {showCloseButton && (
            <ModalClose asChild>
              <GameButton
                appearance="cryptle"
                className="h-10 w-full px-8"
                onClick={() => {
                  if (onOpenChange) {
                    onOpenChange(false)
                  }
                }}
              >
                {t("Понятно, поехали!")}
              </GameButton>
            </ModalClose>
          )}
        </div>
      </ModalContent>
    </Modal>
  )
}

export default GameRulesModal
