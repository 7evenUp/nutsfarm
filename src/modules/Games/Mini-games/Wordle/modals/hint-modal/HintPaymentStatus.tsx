import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { Description } from "@radix-ui/react-dialog"
import { useTranslation } from "react-i18next"

import Loader from "@/assets/icons/loader.svg?react"
import CopyIcon from "@/assets/icons/copy.svg?react"
import CheckIcon from "@/assets/icons/check.svg?react"

import { Sheet, SheetContent } from "@/shared/ui/SideSheet"
import { LargeButton } from "@/shared/ui/LargeButton"

import {
  useCommitPaymentMutation,
  useGetTransactionStatusQuery,
} from "@/redux/api/payment"

import { openLinkWithTelegram } from "@/utils/openLink"
import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

import { cn } from "@/lib/cn"

type HintItem =
  | "description"
  | "letter_1"
  | "letter_2"
  | "letter_3"
  | "letter_4"
  | "letter_5"
  | null

// Константа для таймаута polling (30 секунд)
const POLLING_TIMEOUT = 30000

interface HintPaymentStatusProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  currentHint: HintItem
  onPaymentSuccess: (hint: HintItem) => void
  onPaymentFailed: () => void
}

const HintPaymentStatus = ({
  open,
  setOpen,
  currentHint,
  onPaymentSuccess,
  onPaymentFailed,
}: HintPaymentStatusProps) => {
  const { t } = useTranslation()

  const [isPollingActive, setIsPollingActive] = useState(true)
  const [pollingStartTime, setPollingStartTime] = useState<number | null>(null)
  const [rememberedTxStatus, setRememberedTxStatus] = useState<
    "CREATED" | "FAILED" | "SUCCESS" | null
  >(null)
  const [rememberedHintName, setRememberedHintName] = useState<HintItem | null>(
    null,
  )
  const [rememberedTxId, setRememberedTxId] = useState("")
  const [rememberedPaymentUrl, setRememberedPaymentUrl] = useState("")
  const [isCopied, setIsCopied] = useState(false)

  const [, { data, reset }] = useCommitPaymentMutation({
    fixedCacheKey: "buy-hint-payment",
  })

  const { currentData: transactionStatus } = useGetTransactionStatusQuery(
    { id: data?.transactionId || "" },
    { pollingInterval: 1500, skip: !open || !isPollingActive },
  )

  useEffect(() => {
    if (!isPollingActive || !pollingStartTime) return

    const intervalId = setInterval(() => {
      if (Date.now() - pollingStartTime > POLLING_TIMEOUT) {
        // Останавливаем интервал, чтобы избежать лишних выполнений
        clearInterval(intervalId)

        setIsPollingActive(false)
        setPollingStartTime(null)
        setRememberedTxStatus("FAILED")
        onPaymentFailed()
        reset()
      }
    }, 1000)

    return () => clearInterval(intervalId)
  }, [isPollingActive, pollingStartTime, onPaymentFailed, reset])

  useEffect(() => {
    if (!transactionStatus) return

    if (transactionStatus !== "CREATED") {
      setRememberedTxStatus(transactionStatus)
      setIsPollingActive(false)
    }

    if (transactionStatus === "SUCCESS") {
      onPaymentSuccess(currentHint)
    } else if (transactionStatus === "FAILED") {
      onPaymentFailed()
    }
  }, [transactionStatus, currentHint, onPaymentSuccess, onPaymentFailed])

  // Логика для управления видимостью модального окна
  useEffect(() => {
    if (open) {
      // Когда модальное окно открывается, начинаем опрос
      setPollingStartTime(Date.now())
      setIsPollingActive(true)
      setRememberedHintName(currentHint)
      setRememberedTxId(data?.transactionId || "unknown")
      setRememberedPaymentUrl(data?.paymentFormUrl || "unknown")
    } else {
      // Когда закрывается - сбрасываем состояния
      setIsPollingActive(false)
      setRememberedTxStatus(null)
      setIsCopied(false)
    }
  }, [open])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        className={cn(
          "min-h-[300px] items-center gap-0 overflow-hidden p-0 px-3.5 pt-12",
          Telegram.WebApp.platform === "weba"
            ? "pb-4"
            : "pb-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
        )}
        onEscapeKeyDown={(evt) => evt.preventDefault()}
        onPointerDownOutside={(evt) => evt.preventDefault()}
        onInteractOutside={(evt) => evt.preventDefault()}
      >
        <Description className="sr-only">
          Hint payment transaction status
        </Description>

        {isPollingActive ? (
          <>
            <p className="mt-10 text-center font-tt-hoves-expanded text-xl font-semibold">
              {t("Обрабатываем вашу транзакцию")}
            </p>
            <Loader className="my-auto h-32 w-32 animate-spin" />
          </>
        ) : rememberedTxStatus === "SUCCESS" ? (
          <>
            <p className="mt-10 font-tt-hoves-expanded text-xl font-semibold">
              {t("Подсказка успешно получена!")}
            </p>

            <p className="mb-9 mt-4 text-center text-sm text-white/75">
              {t("Вперед к игре")}
            </p>
            <LargeButton
              appearance="white"
              onClick={() => {
                makeHapticFeedback({ impactOccured: "rigid" })
                setOpen(false)
              }}
              className="mt-auto"
            >
              {t("Назад")}
            </LargeButton>
          </>
        ) : (
          rememberedTxStatus === "FAILED" && (
            <>
              <p className="mt-10 font-tt-hoves-expanded text-xl font-semibold">
                {t("Произошла ошибка")}
              </p>

              <p className="mb-9 mt-4 text-center text-sm text-white/75">
                {t(
                  'Похоже, мы не смогли обработать транзакцию. Обязательно скопируйте информацию с помощью кнопки "Скопировать" снизу и свяжитесь с поддержкой!',
                )}
              </p>

              <div className="mt-auto flex w-full gap-2">
                <LargeButton
                  appearance="gray"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Hint payment transaction failed.\nHint: ${rememberedHintName}\nTransaction id: ${rememberedTxId}\nPaymentFormUrl: ${rememberedPaymentUrl}`,
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
                </LargeButton>
                <LargeButton
                  appearance="white"
                  onClick={() => {
                    setOpen(false)
                    openLinkWithTelegram("https://t.me/nutcrackers1337")
                  }}
                >
                  {t("Поддержка")}
                </LargeButton>
              </div>
            </>
          )
        )}
      </SheetContent>
    </Sheet>
  )
}

export default HintPaymentStatus
