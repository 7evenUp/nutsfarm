import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import CheckIcon from "@/assets/icons/check.svg?react"
import CopyIcon from "@/assets/icons/copy.svg?react"
import Loader from "@/assets/icons/loader.svg?react"

import {
  AlertModal,
  AlertModalContent,
  AlertModalDescription,
  AlertModalTitle,
} from "../shared/AlertModal"

import GameButton from "@/modules/Games/components/GameButton"

import {
  useCommitPaymentMutation,
  useGetTransactionStatusQuery,
} from "@/redux/api/payment"
import { useGetGameEnergyQuery } from "@/redux/api/games"

import { openLinkWithTelegram } from "@/utils/openLink"
import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

const EnergyPaymentStatus = ({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}) => {
  const { t } = useTranslation()

  const [isPollingActive, setIsPollingActive] = useState(true)
  const [rememberedTxStatus, setRememberedTxStatus] = useState<
    "CREATED" | "FAILED" | "SUCCESS" | null
  >(null)
  const [isCopied, setIsCopied] = useState(false)

  const [, { data }] = useCommitPaymentMutation({
    fixedCacheKey: "top-up-energy",
  })

  const { currentData: transactionStatus } = useGetTransactionStatusQuery(
    { id: data?.transactionId || "" },
    { pollingInterval: 1500, skip: !open || !isPollingActive },
  )
  const { refetch } = useGetGameEnergyQuery()

  useEffect(() => {
    if (!transactionStatus) return

    if (transactionStatus !== "CREATED") {
      setRememberedTxStatus(transactionStatus)
      setIsPollingActive(false)
    }

    if (transactionStatus === "SUCCESS") refetch()
  }, [transactionStatus, data])

  useEffect(() => {
    if (!open) {
      setIsPollingActive(true)
      setRememberedTxStatus(null)
    }
  }, [open])

  return (
    <AlertModal open={open} onOpenChange={setOpen}>
      <AlertModalContent className="w-80 px-4 pb-4 pt-8">
        <AlertModalTitle className="sr-only">
          Energy Payment Status
        </AlertModalTitle>
        <AlertModalDescription className="sr-only">
          Energy Payment Status
        </AlertModalDescription>

        {isPollingActive ? (
          <>
            <h2 className="mb-1 bg-gradient-to-b from-[#0F0C5A] to-[#564C9F] bg-clip-text text-center font-days-one text-xl text-transparent">
              {t("Обрабатываем вашу транзакцию")}
            </h2>
            <Loader className="my-auto h-32 w-32 animate-spin" />
          </>
        ) : rememberedTxStatus === "SUCCESS" ? (
          <>
            <p className="text-center text-base font-semibold text-[#382E6D]">
              {t("Энергия успешно восполнена")}
            </p>

            <p className="mb-9 mt-4 text-center text-sm/4 font-semibold text-[#382E6D]/80">
              {t("Продолжай играть и фармить еще больше NUTS!")}
            </p>

            <GameButton
              appearance="flip-cards"
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
              <p className="text-center text-base font-semibold text-[#382E6D]">
                {t("Произошла ошибка")}
              </p>

              <p className="mb-9 mt-4 text-center text-sm/4 font-semibold text-[#382E6D]/80">
                {t(
                  'Похоже, мы не смогли обработать транзакцию. Обязательно скопируйте информацию с помощью кнопки "Скопировать" снизу и свяжитесь с поддержкой!',
                )}
              </p>

              <div className="flex w-full flex-col gap-2">
                <GameButton
                  appearance="flip-cards"
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
                  appearance="flip-cards"
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
      </AlertModalContent>
    </AlertModal>
  )
}

export default EnergyPaymentStatus
