import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { Description } from "@radix-ui/react-dialog"
import { useTranslation } from "react-i18next"

import ArrowLeftIcon from "@/assets/icons/arrow-left.svg?react"
import Loader from "@/assets/icons/loader.svg?react"
import CopyIcon from "@/assets/icons/copy.svg?react"
import CheckIcon from "@/assets/icons/check.svg?react"

import { Sheet, SheetContent } from "@/shared/ui/SideSheet"
import { LargeButton } from "@/shared/ui/LargeButton"

import {
  useCommitPaymentMutation,
  useConnectDonationWithLessonMutation,
  useGetTransactionStatusQuery,
} from "@/redux/api/payment"
import { useGetCurrentUserQuery } from "@/redux/api/user"

import { openLinkWithTelegram } from "@/utils/openLink"
import { sendMetrika } from "@/utils/sendMetrika"
import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

import { cn } from "@/lib/cn"

const SuccessfullDonate = ({
  lessonId,
  open,
  setOpen,
}: {
  lessonId?: string
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}) => {
  const { t } = useTranslation()

  const [isPollingActive, setIsPollingActive] = useState(true)
  const [isCopied, setIsCopied] = useState(false)

  const [, { data }] = useCommitPaymentMutation({ fixedCacheKey: "donate" })
  const [connectDonationWithLesson] = useConnectDonationWithLessonMutation()

  const { data: currentUser } = useGetCurrentUserQuery()
  const { data: transactionStatus } = useGetTransactionStatusQuery(
    { id: data?.transactionId || "" },
    { pollingInterval: 1500, skip: !open || !isPollingActive },
  )

  useEffect(() => {
    if (!transactionStatus) return

    if (transactionStatus !== "CREATED") setIsPollingActive(false)

    if (transactionStatus === "SUCCESS") {
      connectDonationWithLesson({
        transactionId: data?.transactionId || "",
        lessonId,
      })
    }
  }, [transactionStatus])

  useEffect(() => {
    if (open) {
      sendMetrika("donate_success_popup", { userBalance: currentUser?.balance })
    }
  }, [open])

  if (!data) return

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        className={cn(
          "min-h-[300px] items-center gap-0 overflow-hidden p-0 px-3.5 pt-3.5",
          Telegram.WebApp.platform === "weba"
            ? "pb-4"
            : "pb-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
        )}
      >
        <Description className="sr-only">Transaction status</Description>

        <div className="flex w-full">
          <button
            className="flex items-center gap-2 text-sm font-semibold opacity-70 transition-opacity focus:outline-none active:opacity-100"
            onClick={() => {
              setOpen(false)
            }}
          >
            <ArrowLeftIcon />
            {t("Назад")}
          </button>
        </div>

        {isPollingActive ? (
          <>
            <p className="mt-10 text-center font-tt-hoves-expanded text-xl font-semibold">
              {t("Обрабатываем вашу транзакцию")}
            </p>
            <Loader className="my-auto h-32 w-32 animate-spin" />
          </>
        ) : transactionStatus === "SUCCESS" ? (
          <>
            <p className="mt-10 font-tt-hoves-expanded text-xl font-semibold">
              {t("Спасибо за поддержку ❤️")}
            </p>

            <p className="mb-9 mt-4 text-center text-sm text-white/75">
              {t("Ваше участие и доверие вдохновляют нас!")}
            </p>

            <LargeButton
              appearance="white"
              onClick={() => {
                makeHapticFeedback({ impactOccured: "rigid" })
                setOpen(false)
              }}
              className="mt-auto"
            >
              {t("Назад к обучению")}
            </LargeButton>
          </>
        ) : (
          transactionStatus === "FAILED" && (
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
                      `Donate payment transaction failed.\nTransaction id: ${data?.transactionId}\nPaymentFormUrl: ${data?.paymentFormUrl}`,
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

export default SuccessfullDonate
