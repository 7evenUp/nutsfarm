import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import Loader from "@/assets/icons/loader.svg?react"
import StarIcon from "@/assets/passV2/icons/star.svg?react"
import TonIcon from "@/assets/icons/ton.svg?react"
import Minus from "@/assets/passV2/icons/minus.svg?react"
import Plus from "@/assets/passV2/icons/plus.svg?react"

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/shared/ui/Drawer"
import { LargeButton } from "@/shared/ui/LargeButton"

import {
  useCommitPaymentMutation,
  useCommitTonPaymentMutation,
  useGetPaymentItemsQuery,
} from "@/redux/api/payment"
import { useAppSelector } from "@/redux/hooks"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

import { cn } from "@/lib/cn"

import { initInvoice } from "@telegram-apps/sdk"

// @ts-expect-error Not-in-telegram-environment
let invoice

if (import.meta.env.VITE_IS_DEV_LOCAL === undefined) {
  try {
    invoice = initInvoice()
  } catch {
    /* empty */
  }
}

const BuyTicket = ({
  children,
  openSuccessfullPayment,
}: {
  children: React.ReactNode
  openSuccessfullPayment: VoidFunction
}) => {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<
    "cancelled" | "paid" | null
  >(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [isCommitPaymentLocked, setIsCommitPaymentLocked] = useState(false)

  const lang = useAppSelector((state) => state.language.value)

  const { data: paymentItems } = useGetPaymentItemsQuery(undefined, {
    skip: !open,
  })
  const [commitPayment] = useCommitPaymentMutation({
    fixedCacheKey: "premium-ticket",
  })
  const [commitTonPayment] = useCommitTonPaymentMutation()

  const ticketItem = useMemo(() => {
    if (!paymentItems) return null

    const neededItem = paymentItems.find(
      (item) => item.type === "PAID_SPIN_WHEEL",
    )

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
      openSuccessfullPayment()
      return
    }
  }, [paymentStatus])

  const buyTickets = async () => {
    if (isCommitPaymentLocked) return
    if (ticketItem === null) return
    if (quantity == 0) return

    makeHapticFeedback({ notificationOccured: "success" })

    setIsCommitPaymentLocked(true)

    try {
      if (Telegram.WebApp.initData) {
        const response = await commitPayment({
          id: ticketItem.id,
          lang,
          quantity: quantity,
        }).unwrap()

        // @ts-expect-error Not-in-telegram-environment
        const status = await invoice.open(response.paymentFormUrl, "url")
        setPaymentStatus(status)
      } else {
        const response = await commitTonPayment({
          id: ticketItem.id,
          lang,
          quantity,
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

  const handleQuantityClick = (e: React.MouseEvent, value: number) => {
    e.stopPropagation() // предотвращаем всплытие события
    setQuantity((prev) => Math.max(prev + value, 1))
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="sr-only">
          <DrawerTitle>Buy Ticket modal</DrawerTitle>
          <DrawerDescription>
            Buy premium tickets to open premium rewards!
          </DrawerDescription>
        </DrawerHeader>

        <h2 className="mt-4 text-center font-tt-hoves-expanded text-2xl font-semibold -tracking-[0.02em] text-white">
          {t("Покупка премиум билета")}
        </h2>

        <div className="my-6 flex flex-col gap-2 px-4 phone-xsm:my-8 phone-sm-fix:my-14">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/75">
              {t("Стоимость одного билета")}:
            </span>
            <div className="flex h-8 w-[70px] items-center justify-center gap-1 rounded-lg bg-[#17202D] px-2 py-1.5">
              {Telegram.WebApp.initData ? (
                <>
                  <StarIcon className="h-auto w-4 text-[#FCDF15]" />
                  <span className="bg-gradient-to-r from-[#FEEB1D] to-[#E7C412] bg-clip-text font-tt-hoves-expanded text-sm font-medium text-transparent">
                    {ticketItem?.starsPrice}
                  </span>
                </>
              ) : (
                <>
                  <TonIcon className="h-auto w-4 text-[#0098EA]" />
                  <span className="bg-gradient-to-r from-[#51C2FF] to-[#85C6EA] bg-clip-text font-tt-hoves-expanded text-sm font-medium text-transparent">
                    {ticketItem?.tonPrice.toFixed(2)}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/75">
              {t("Выбери количество для покупки")}:
            </span>
            <div className="flex h-8 w-[70px] items-center justify-center gap-[7px] rounded-lg bg-[#17202D] px-2 py-1.5 text-white">
              <button
                aria-label="minus"
                onClick={(e) => handleQuantityClick(e, -1)}
              >
                <Minus
                  className={cn("h-4 w-4", quantity === 1 && "text-white/40")}
                />
              </button>
              <span className="text-sm">{quantity}</span>
              <button
                aria-label="plus"
                onClick={(e) => handleQuantityClick(e, 1)}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <DrawerFooter>
          <LargeButton
            appearance="white"
            contentClassName="gap-0"
            onClick={buyTickets}
            className="relative mt-2"
            disabled={isCommitPaymentLocked || ticketItem === null}
          >
            {isCommitPaymentLocked || ticketItem === null ? (
              <Loader className="animate-spin" />
            ) : (
              <>
                {t("Оплатить")}
                {Telegram.WebApp.initData ? (
                  <>
                    <StarIcon className="ml-1.5 mr-1 h-auto w-5 text-inherit" />
                    <span>{ticketItem.starsPrice * quantity}</span>
                  </>
                ) : (
                  <>
                    <TonIcon className="ml-1.5 mr-1 h-auto w-5 text-inherit" />
                    <span>{(ticketItem.tonPrice * quantity).toFixed(2)}</span>
                    <span className="translate-x-1 translate-y-px text-sm line-through opacity-80">
                      {(ticketItem.tonPriceFull * quantity).toFixed(2)}
                    </span>
                  </>
                )}
              </>
            )}
          </LargeButton>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default BuyTicket
