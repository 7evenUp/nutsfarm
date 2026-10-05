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
import { useGetCurrentUserQuery } from "@/redux/api/user"
import { useGetLevelRewardsInfiniteQuery } from "@/redux/api/nutspass"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"
import { openLinkWithTelegram } from "@/utils/openLink"


import { cn } from "@/lib/cn"

const BuyLevelsPaymentStatus = ({
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
    fixedCacheKey: "buy-nuts-pass-levels",
  })

  const { currentData: transactionStatus } = useGetTransactionStatusQuery(
    { id: data?.transactionId || "" },
    { pollingInterval: 1500, skip: !open || !isPollingActive },
  )
  const { refetch: refetchCurrentUser } = useGetCurrentUserQuery()
  const { refetch: refetchLevels } = useGetLevelRewardsInfiniteQuery(undefined)

  useEffect(() => {
    if (!transactionStatus) return

    if (transactionStatus !== "CREATED") {
      setRememberedTxStatus(transactionStatus)
      setIsPollingActive(false)
    }

    if (transactionStatus === "SUCCESS") {
      refetchCurrentUser()
      refetchLevels()
    }
  }, [transactionStatus, data])

  useEffect(() => {
    if (!open) {
      setIsPollingActive(true)
      setRememberedTxStatus(null)
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
        <Description className="sr-only">Transaction status</Description>

        {isPollingActive ? (
          <>
            <p className="mt-10 text-center font-tt-hoves-expanded text-xl font-semibold">
              {t("Обрабатываем вашу транзакцию")}
            </p>
            <Loader className="my-auto h-32 w-32 animate-spin" />
          </>
        ) : rememberedTxStatus === "SUCCESS" ? (
          <>
            <p className="mt-10 text-center font-tt-hoves-expanded text-xl font-semibold">
              {t("Уровни Nuts Pass успешно получены")}
            </p>

            <p className="mb-9 mt-4 text-center text-sm text-white/75">
              {t("Скорее открывай новые награды!")}
            </p>

            <LargeButton
              appearance="white"
              onClick={() => {
                makeHapticFeedback({ impactOccured: "rigid" })
                setOpen(false)
              }}
              className="mt-auto"
            >
              {t("К пропуску")}
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
                      `Pass Levels payment transaction failed.\nTransaction id: ${data?.transactionId}\nPaymentFormUrl: ${data?.paymentFormUrl}`,
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

export default BuyLevelsPaymentStatus
