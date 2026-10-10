import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react"
import { Description, Title } from "@radix-ui/react-dialog"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

import TicketBackground from "@/assets/passV2/icons/ticket-buypass-background.svg?react"
import StarIcon from "@/assets/passV2/icons/star.svg?react"
import TonIcon from "@/assets/icons/ton.svg?react"
import Loader from "@/assets/icons/loader.svg?react"

import { Sheet, SheetContent } from "@/shared/ui/SideSheet"
import { LargeButton } from "@/shared/ui/LargeButton"

import {
  useCommitPaymentMutation,
  useCommitTonPaymentMutation,
  useGetPaymentItemsQuery,
} from "@/redux/api/payment"
import { useAppSelector } from "@/redux/hooks"
import { useGetCurrentUserQuery } from "@/redux/api/user"

import { cn } from "@/lib/cn"

import {
  BackButton,
  initBackButton,
  RemoveEventListenerFn,
} from "@/demo/telegram-sdk"
import { initInvoice } from "@/demo/telegram-sdk"

import { sendMetrika } from "@/utils/sendMetrika"
import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

let backButton: BackButton
// @ts-expect-error Not-in-telegram-environment
let invoice

if (true) {
  try {
    const [initializedBackButton] = initBackButton()
    backButton = initializedBackButton
    invoice = initInvoice()
  } catch {
    /* empty */
  }
}

const BuyPass = ({
  open,
  setOpen,
  openPaymentStatus,
}: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  openPaymentStatus: () => void
}) => {
  const { t } = useTranslation()

  const [paymentStatus, setPaymentStatus] = useState<
    "cancelled" | "paid" | null
  >(null)
  const [isCommitPaymentLocked, setIsCommitPaymentLocked] = useState(false)

  const lang = useAppSelector((state) => state.language.value)

  const { data: currentUser } = useGetCurrentUserQuery()
  const { data: paymentItems } = useGetPaymentItemsQuery(undefined)
  const [commitPayment] = useCommitPaymentMutation({
    fixedCacheKey: "buy-nuts-pass",
  })
  const [commitTonPayment] = useCommitTonPaymentMutation()

  const passItem = useMemo(() => {
    if (!paymentItems) return null

    const neededItem = paymentItems.find((item) => item.type === "NUT_PASS")

    if (!neededItem) return null

    return neededItem
  }, [paymentItems])

  useEffect(() => {
    if (paymentStatus === null) return

    if (paymentStatus === "cancelled") {
      setPaymentStatus(null)
      return
    }

    if (paymentStatus === "paid") {
      setPaymentStatus(null)
      openPaymentStatus()
      return
    }
  }, [paymentStatus])

  // TMA Back Button
  useEffect(() => {
    if (!backButton) return

    let rmListener: RemoveEventListenerFn
    if (open) {
      backButton.show()
      rmListener = backButton.on("click", () => {
        setOpen(false)
      })
    } else {
      backButton.hide()
    }

    return () => {
      if (rmListener) {
        rmListener()
      }
    }
  }, [open])

  const buyPass = async () => {
    if (isCommitPaymentLocked) return
    if (passItem === null) return

    makeHapticFeedback({ notificationOccured: "success" })

    setIsCommitPaymentLocked(true)

    sendMetrika("pass_payment_pop_up_click_pay")

    try {
      if (Telegram.WebApp.initData) {
        const response = await commitPayment({
          id: passItem.id,
          lang,
        }).unwrap()

        // @ts-expect-error Not-in-telegram-environment
        const status = await invoice.open(response.paymentFormUrl, "url")
        setPaymentStatus(status)
      } else {
        const response = await commitTonPayment({
          id: passItem.id,
          lang,
        }).unwrap()

        window.open(response.paymentFormUrl, "_top")
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "WebAppMethodUnsupported")
          toast.error("Ошибка, openInvoice не поддерживается")
        if (err.message === "WebAppInvoiceOpened")
          toast.error("Ошибка, openInvoice с такой ссылкой уже был открыт")

        return
      }
      toast.error(t("Ошибка"), {
        description: t("Упс, что-то пошло не так"),
      })
    } finally {
      setTimeout(() => {
        setIsCommitPaymentLocked(false)
      }, 20)
    }
  }

  if (currentUser?.isNutPassActive) return null

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        className={cn(
          "items-center gap-0 overflow-hidden p-0 px-3.5 pt-12",
          Telegram.WebApp.platform === "weba"
            ? "pb-4"
            : "pb-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
        )}
      >
        <Title className="sr-only">Buy Pass Modal</Title>
        <Description className="sr-only">Buy Pass Modal</Description>

        <div className="relative z-10 flex max-w-xl flex-col items-center">
          <h2 className="text-center font-tt-hoves-expanded text-[28px]/[32px] font-semibold -tracking-[0.02em] text-white">
            Nuts Pass
            <br />
            Premium
          </h2>

          <p className="mb-10 mt-6 text-balance px-10 text-center text-sm font-medium text-white">
            {t(
              "Получи Nuts Pass Premium и открой трек эксклюзивных наград с Premium-боксами, уникальными бустерами и NFT-призами. Стань лучшим в лидерборде и займи элитный пьедестал!",
            )}
          </p>

          <p className="mb-1.5 text-center text-base font-medium text-white/50">
            {t("К оплате")}:
          </p>

          <div className="mb-10 flex items-center gap-1.5">
            {Telegram.WebApp.initData ? (
              <StarIcon className="h-auto w-5 text-[#FCDF15]" />
            ) : (
              <TonIcon className="h-auto w-5 text-[#0098EA]" />
            )}

            <span className="font-tt-hoves-expanded text-xl font-medium text-white">
              {!passItem ? (
                <Loader className="h-7 w-7 animate-spin" />
              ) : Telegram.WebApp.initData ? (
                passItem.personalDiscountStarsPrice !== null &&
                passItem.personalDiscountEndTime &&
                new Date(passItem.personalDiscountEndTime).getTime() >
                  new Date().getTime() ? (
                  <>
                    <span>
                      {Math.floor(passItem.personalDiscountStarsPrice)}
                    </span>
                    <span className="ml-2 text-sm line-through opacity-70">
                      {passItem.starsPrice}
                    </span>
                  </>
                ) : (
                  passItem.starsPrice
                )
              ) : passItem.personalDiscountTonPrice !== null &&
                passItem.personalDiscountEndTime &&
                new Date(passItem.personalDiscountEndTime).getTime() >
                  new Date().getTime() ? (
                <>
                  <span>{passItem.personalDiscountTonPrice.toFixed(2)}</span>
                  <span className="ml-2 text-sm line-through opacity-70">
                    {passItem.tonPrice.toFixed(2)}
                  </span>
                </>
              ) : (
                <>
                  <span>{passItem.tonPrice.toFixed(2)}</span>
                  <span className="ml-2 text-sm line-through opacity-70">
                    {passItem.tonPriceFull.toFixed(2)}
                  </span>
                </>
              )}
            </span>
          </div>

          <LargeButton
            appearance="white"
            contentClassName="gap-0"
            onClick={buyPass}
            disabled={isCommitPaymentLocked || passItem === null}
          >
            {isCommitPaymentLocked || passItem === null ? (
              <Loader className="animate-spin" />
            ) : (
              <>
                {t("Оплатить")}
                {Telegram.WebApp.initData ? (
                  <>
                    <StarIcon className="ml-1.5 mr-1 h-auto w-5 text-inherit" />
                    {passItem.personalDiscountStarsPrice !== null &&
                    passItem.personalDiscountEndTime &&
                    new Date(passItem.personalDiscountEndTime).getTime() >
                      new Date().getTime()
                      ? Math.floor(passItem.personalDiscountStarsPrice)
                      : passItem.starsPrice}
                  </>
                ) : (
                  <>
                    <TonIcon className="ml-1.5 mr-1 h-auto w-5 text-inherit" />
                    {passItem.personalDiscountTonPrice !== null &&
                    passItem.personalDiscountEndTime &&
                    new Date(passItem.personalDiscountEndTime).getTime() >
                      new Date().getTime()
                      ? passItem.personalDiscountTonPrice.toFixed(2)
                      : passItem.tonPrice.toFixed(2)}
                  </>
                )}
              </>
            )}
          </LargeButton>
        </div>

        <TicketBackground className="absolute right-0 top-[135px] z-10" />

        <div className="absolute inset-0 bg-[radial-gradient(400px_400px_at_110%_70%,_var(--tw-gradient-stops))] from-[#754DCA]/40 to-[#050D12] to-[50%]" />
      </SheetContent>
    </Sheet>
  )
}

export default BuyPass
