import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import CheckIcon from "@/assets/icons/check.svg?react"
import CopyIcon from "@/assets/icons/copy.svg?react"
import Loader from "@/assets/icons/loader.svg?react"

import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalTitle,
} from "../../shared/Modal"

import GameButton from "@/modules/Games/components/GameButton"

import {
  useCommitPaymentMutation,
  useGetTransactionStatusQuery,
} from "@/redux/api/payment"
import {
  useGetGameEnergyQuery,
  useGetGameInventoryQuery,
} from "@/redux/api/games"

import { openLinkWithTelegram } from "@/utils/openLink"
import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

const PaymentStatus = ({
  open,
  type = "energy",
  setOpen,
}: {
  open: boolean
  type?: "energy" | "skin"
  setOpen: Dispatch<SetStateAction<boolean>>
}) => {
  const { t } = useTranslation()

  const [isPollingActive, setIsPollingActive] = useState(true)
  const [rememberedTxStatus, setRememberedTxStatus] = useState<
    "CREATED" | "FAILED" | "SUCCESS" | null
  >(null)
  const [isCopied, setIsCopied] = useState(false)

  const [, { data }] = useCommitPaymentMutation({
    fixedCacheKey: type === "energy" ? "top-up-energy" : "skin",
  })

  const { currentData: transactionStatus } = useGetTransactionStatusQuery(
    { id: data?.transactionId || "" },
    { pollingInterval: 1500, skip: !open || !isPollingActive },
  )
  const { refetch: refetchEnergy } = useGetGameEnergyQuery()
  const { refetch: refetchInventory } = useGetGameInventoryQuery()

  useEffect(() => {
    if (!transactionStatus) return

    if (transactionStatus !== "CREATED") {
      setRememberedTxStatus(transactionStatus)
      setIsPollingActive(false)
    }

    if (transactionStatus === "SUCCESS") {
      if (type === "energy") refetchEnergy()
      if (type === "skin") refetchInventory()
    }
  }, [transactionStatus, data])

  useEffect(() => {
    if (!open) {
      setIsPollingActive(true)
      setRememberedTxStatus(null)
    }
  }, [open])

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalContent
        className="w-80 px-4 pb-4 pt-8"
        onEscapeKeyDown={(evt) => evt.preventDefault()}
        onPointerDownOutside={(evt) => evt.preventDefault()}
        onInteractOutside={(evt) => evt.preventDefault()}
      >
        <ModalTitle className="sr-only">Payment Status</ModalTitle>
        <ModalDescription className="sr-only">Payment Status</ModalDescription>

        {isPollingActive ? (
          <>
            <h2 className="mb-1 bg-gradient-to-b from-[#7C5CE0] to-[#5239A7] bg-clip-text text-center font-days-one text-xl text-transparent">
              {t("Обрабатываем вашу транзакцию")}
            </h2>
            <Loader className="my-auto h-32 w-32 animate-spin text-[#463190]/75" />
          </>
        ) : rememberedTxStatus === "SUCCESS" ? (
          <>
            <p className="text-center text-base font-semibold text-[#463190]/75">
              {type === "skin"
                ? t("Покупка успешно завершена")
                : t("Энергия успешно восполнена")}
            </p>

            <p className="mb-9 mt-4 text-center text-sm/4 font-semibold text-[#463190]/50">
              {type === "skin"
                ? t(
                    "Выбери новый скин в инвентаре и продолжай фармить еще больше NUTS в новом стиле!",
                  )
                : t("Продолжай играть и фармить еще больше NUTS!")}
            </p>

            <GameButton
              appearance="cryptle"
              className="h-10 w-full"
              onClick={() => {
                makeHapticFeedback({ impactOccured: "rigid" })
                setOpen(false)
              }}
            >
              {t("К уровням!")}
            </GameButton>
          </>
        ) : (
          rememberedTxStatus === "FAILED" && (
            <>
              <p className="text-center text-base font-semibold text-[#463190]/75">
                {t("Произошла ошибка")}
              </p>

              <p className="mb-9 mt-4 text-center text-sm/4 font-semibold text-[#463190]/50">
                {t(
                  'Похоже, мы не смогли обработать транзакцию. Обязательно скопируйте информацию с помощью кнопки "Скопировать" снизу и свяжитесь с поддержкой!',
                )}
              </p>

              <div className="flex w-full flex-col gap-2">
                <GameButton
                  appearance="cryptle"
                  className="h-9 flex-1 items-center gap-1"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Energy payment transaction failed.\nTransaction id: ${data?.transactionId}\nPaymentFormUrl: ${data?.paymentFormUrl}`,
                    )

                    setIsCopied(true)
                    setTimeout(() => {
                      setIsCopied(false)
                    }, 3000)
                  }}
                >
                  {isCopied ? (
                    <CheckIcon className="h-5 w-5 animate-in fade-in-0" />
                  ) : (
                    <CopyIcon className="h-5 w-5 animate-in fade-in-0" />
                  )}
                  {t("Скопировать")}
                </GameButton>
                <GameButton
                  appearance="cryptle"
                  className="h-9 flex-1"
                  onClick={() => {
                    setOpen(false)
                    openLinkWithTelegram("https://t.me/nutcrackers1337")
                  }}
                >
                  {t("Поддержка")}
                </GameButton>
              </div>
            </>
          )
        )}
      </ModalContent>
    </Modal>
  )
}

export default PaymentStatus
