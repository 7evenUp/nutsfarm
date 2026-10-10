import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { Close, Description, Title } from "@radix-ui/react-dialog"

import TicketIcon from "@/assets/passV2/icons/ticket-levels-header.svg?react"
import StarIconYellow from "@/assets/passV2/icons/yellow-star.svg?react"
import ArrowRight from "@/assets/passV2/icons/move-right.svg?react"
import StarIcon from "@/assets/passV2/icons/star.svg?react"
import CloseIcon from "@/assets/icons/close.svg?react"
import Loader from "@/assets/icons/loader.svg?react"
import Minus from "@/assets/passV2/icons/minus.svg?react"
import Plus from "@/assets/passV2/icons/plus.svg?react"
import TonIcon from "@/assets/icons/ton.svg?react"
import ForwardIcon from "@/assets/icons/forward.svg?react"

import LoadingState from "./LoadingState"

import { LargeButton } from "@/shared/ui/LargeButton"
import { Sheet, SheetContent } from "@/shared/ui/SideSheet"

import { useAppSelector } from "@/redux/hooks"
import {
  useCommitPaymentMutation,
  useCommitTonPaymentMutation,
  useGetPaymentItemsQuery,
} from "@/redux/api/payment"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"
import { sendMetrika } from "@/utils/sendMetrika"
import { openLinkWithTelegram } from "@/utils/openLink"

import { PurchaseItem } from "@/types/payment"

import { cn } from "@/lib/cn"

import styles from "./styles.module.css"

import {
  BackButton,
  initBackButton,
  RemoveEventListenerFn,
} from "@/demo/telegram-sdk"
import { initInvoice } from "@/demo/telegram-sdk"

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

const BuyLevels = ({
  open,
  setOpen,
  openPaymentStatus,
}: {
  open: boolean
  setOpen: (value: boolean) => void
  openPaymentStatus: () => void
}) => {
  const { t } = useTranslation()

  const [selectedPurchaseItem, setSelectedPurchaseItem] =
    useState<PurchaseItem | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<
    "cancelled" | "paid" | null
  >(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [isCommitPaymentLocked, setIsCommitPaymentLocked] = useState(false)

  const lang = useAppSelector((state) => state.language.value)
  const { passLevel } = useAppSelector((state) => state.passv2)

  const { data: paymentItems } = useGetPaymentItemsQuery(undefined)
  const [commitPayment] = useCommitPaymentMutation({
    fixedCacheKey: "buy-nuts-pass-levels",
  })
  const [commitTonPayment] = useCommitTonPaymentMutation()

  const levelItems = useMemo(() => {
    if (!paymentItems) return null

    // Актуальные id на беке - 41,44,45,46
    const levelPurchaseItems = paymentItems
      .filter((item) => item.type === "LEVELS")
      .sort((a, b) => (a.amount && b.amount ? a.amount - b.amount : 0))

    if (levelPurchaseItems.length === 0) return null

    return {
      oneLevel: levelPurchaseItems[0],
      allItems: levelPurchaseItems,
    }
  }, [paymentItems])

  const futureLevel = useMemo(() => {
    if (!selectedPurchaseItem || !selectedPurchaseItem.amount) return null
    return passLevel + quantity * selectedPurchaseItem.amount
  }, [passLevel, quantity, selectedPurchaseItem])

  const handleQuantityClick = (e: React.MouseEvent, value: number) => {
    e.stopPropagation() // предотвращаем всплытие события
    setQuantity((prev) => Math.max(prev + value, 1))
  }

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

  const buyLevels = async () => {
    if (isCommitPaymentLocked) return
    if (levelItems === null) return
    if (selectedPurchaseItem === null) return
    if (quantity == 0) return

    makeHapticFeedback({ notificationOccured: "success" })

    setIsCommitPaymentLocked(true)

    sendMetrika("buy_levels_click_pay")

    try {
      if (Telegram.WebApp.initData) {
        const response = await commitPayment({
          id: selectedPurchaseItem.id,
          lang,
          quantity: quantity,
        }).unwrap()

        // @ts-expect-error Not-in-telegram-environment
        const status = await invoice.open(response.paymentFormUrl, "url")
        setPaymentStatus(status)
      } else {
        const response = await commitTonPayment({
          id: selectedPurchaseItem.id,
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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        className={cn(
          "gap-0 overflow-y-auto bg-[#20142D] px-0 pb-32 pt-[44px] h-screen-700:pt-12",
          Telegram.WebApp.initData ? "h-screen rounded-t-none" : "h-[100svh]",
        )}
      >
        <Title className="sr-only">Buy Levels for Nuts Pass</Title>
        <Description className="sr-only">Buy Levels for Nuts Pass</Description>

        <Close className="absolute right-4 top-4 z-[100] opacity-70 transition-opacity focus:outline-none active:opacity-100">
          <CloseIcon className="h-6 w-6" />
          <span className="sr-only">Close</span>
        </Close>

        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,_var(--tw-gradient-stops))] from-[#5B40A0]/70 from-[-50%] to-[#141A2D]/70 to-[50%]" />

        <div className="pointer-events-none fixed inset-0 bottom-0 top-auto z-10 h-40 bg-gradient-to-b from-[#544871]/0 to-[#050D12]" />

        <h2 className="relative mx-auto mb-[18px] flex items-center gap-2 bg-gradient-to-b from-[#FFFFFF] to-[#E6DDFF] bg-clip-text phone-sm-fix:mb-6">
          <TicketIcon className="flex h-6 w-6 translate-y-px phone-sm-fix:h-8 phone-sm-fix:w-8" />
          <p className="text-center font-tt-hoves-expanded text-xl font-semibold text-white phone-sm-fix:text-2xl">
            {t("Покупка уровней")}
          </p>
        </h2>

        <p className="relative mb-2.5 text-balance px-10 text-center text-xs text-white/75 phone-sm-fix:text-sm">
          {t(
            "Хочешь поскорее получить долгожданную награду? У тебя есть такая возможность!",
          )}
        </p>

        <p className="relative mb-9 px-4 text-center text-xs text-white/75 phone-sm-fix:text-sm">
          {t("Приобретай уровни Nuts Pass за Telegram Stars")}
        </p>

        {levelItems === null ? (
          <LoadingState />
        ) : (
          <div className="relative flex w-full max-w-2xl flex-col items-center gap-2 self-center px-3.5">
            {levelItems.allItems.map((lvl) => {
              const isLevelDisabledToClick = false

              return (
                <button
                  key={lvl.id}
                  onClick={() => {
                    makeHapticFeedback({ impactOccured: "soft" })

                    if (isLevelDisabledToClick) {
                      const correctDomain =
                        import.meta.env.VITE_ENVIRONMENT === "PROD"
                          ? `${window.location.origin}/`
                          : `${window.location.origin}/`
                      openLinkWithTelegram(
                        `${correctDomain}pass/?initData=${encodeURIComponent(Telegram.WebApp.initData)}`,
                      )
                    } else {
                      sendMetrika("levels_pack_click")
                      setSelectedPurchaseItem(lvl)
                      setQuantity(1)
                    }
                  }}
                  className={cn(
                    "relative flex w-full flex-col rounded-[10px] bg-[#413577]/40 pl-3.5 pr-2.5 pt-2.5 outline-none",
                    lvl.amount === 1
                      ? "pb-2.5"
                      : "pb-3 phone-sm-fix:gap-[3px] phone-sm-fix:pb-[17px]",
                    lvl.amount !== null &&
                      lvl.amount > 10 && // особый градиент для выделения
                      "bg-gradient-to-r from-[#322A59] via-[#3E3274] to-[#241F42]",
                    selectedPurchaseItem?.id === lvl.id &&
                      styles.gradient_outline,
                  )}
                >
                  <div className="flex w-full items-center">
                    <h1 className="font-tt-hoves-expanded text-base font-medium phone-sm-fix:text-xl">
                      {lang === "RU" ? lvl.title : lvl.titleEn}
                    </h1>
                    {!isLevelDisabledToClick && (
                      <div className="ml-auto flex h-[35px] w-[70px] items-center justify-center gap-[5px] rounded-lg bg-[#F2DD22]/10 ring-1 ring-[#121A2A]/10">
                        {Telegram.WebApp.initData ? (
                          <>
                            <StarIconYellow className="h-3 w-3.5 shrink-0" />
                            <span className="bg-gradient-to-r from-[#FEEB1D] to-[#E7C412] bg-clip-text font-tt-hoves-expanded text-sm/[13px] font-medium text-transparent">
                              {lvl.starsPrice}
                            </span>
                          </>
                        ) : (
                          <>
                            <TonIcon className="h-3 w-3.5 shrink-0 text-[#0098EA]" />
                            <span className="bg-gradient-to-r from-[#51C2FF] to-[#85C6EA] bg-clip-text font-tt-hoves-expanded text-sm/[13px] font-medium text-transparent">
                              {lvl.tonPrice.toFixed(2)}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {!isLevelDisabledToClick &&
                    lvl.amount !== null &&
                    lvl.amount !== 1 && (
                      <div className="mt-1 flex items-start">
                        <span className="mr-2 text-xs font-medium text-white/75">
                          {t("Стоимость 1 уровня")}:
                        </span>
                        <div className="mr-3 flex items-center gap-0.5">
                          {Telegram.WebApp.initData ? (
                            <>
                              <StarIcon className="h-3 w-3.5 text-white/75" />
                              <span className="font-tt-hoves-expanded text-xs font-medium text-white/75">
                                {lvl.starsPrice / lvl.amount}
                              </span>
                            </>
                          ) : (
                            <>
                              <TonIcon className="h-3 w-3.5 text-white/75" />
                              <span className="font-tt-hoves-expanded text-xs font-medium text-white/75">
                                {(lvl.tonPrice / lvl.amount).toFixed(2)}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="relative flex items-center gap-0.5">
                          {Telegram.WebApp.initData ? (
                            <>
                              <StarIcon className="h-3 w-3.5 text-white/50" />
                              <span className="font-tt-hoves-expanded text-xs font-medium text-white/50">
                                {levelItems.oneLevel.starsPrice}
                              </span>
                            </>
                          ) : (
                            <>
                              <TonIcon className="h-3 w-3.5 text-white/50" />
                              <span className="font-tt-hoves-expanded text-xs font-medium text-white/50">
                                {levelItems.oneLevel.tonPrice.toFixed(2)}
                              </span>
                            </>
                          )}
                          <div className="absolute top-1/2 h-px w-full bg-[#8B8F96]" />
                        </div>
                      </div>
                    )}
                  {selectedPurchaseItem?.id === lvl.id && (
                    <div
                      className={cn(
                        "relative ml-auto mt-2 flex h-8",
                        selectedPurchaseItem.amount !== 1 && "h-3",
                      )}
                    >
                      <div
                        className={cn(
                          "flex min-h-8 items-center gap-[7px] rounded-lg bg-background px-2 py-1.5 shadow-inherit",
                          selectedPurchaseItem.amount !== 1 && "-translate-y-5",
                        )}
                      >
                        <Minus
                          className={cn(
                            "h-4 w-4",
                            quantity === 1 && "text-white/40",
                          )}
                          onClick={(e) => handleQuantityClick(e, -1)}
                        />
                        <span className="text-sm">{quantity}</span>
                        <Plus
                          className="h-4 w-4"
                          onClick={(e) => handleQuantityClick(e, 1)}
                        />
                      </div>
                    </div>
                  )}
                  {isLevelDisabledToClick && (
                    <div className="absolute inset-0 flex items-center justify-end gap-2 rounded-[10px] pr-4 text-sm font-bold text-white backdrop-blur-[1]">
                      {t("Перейти в Веб-версию")}
                      <ForwardIcon className="h-4 w-4" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}

        <div
          className={cn(
            "fixed left-1/2 z-20 w-full max-w-2xl -translate-x-1/2 px-3.5",
            Telegram.WebApp.platform === "weba"
              ? "bottom-4"
              : "bottom-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
          )}
        >
          {futureLevel && (
            <div className="flex justify-center gap-1 px-2">
              <span className="font-semibold drop-shadow-[0px_0px_1px_black]">
                {t("Уровень после покупки")} {passLevel}
              </span>
              <ArrowRight className="w-4" />
              <span className="font-semibold drop-shadow-[0px_0px_1px_black]">
                {futureLevel}
              </span>
            </div>
          )}
          <LargeButton
            appearance="white"
            contentClassName="gap-0"
            onClick={buyLevels}
            className="relative mt-2"
            disabled={
              isCommitPaymentLocked ||
              levelItems === null ||
              selectedPurchaseItem === null
            }
          >
            {isCommitPaymentLocked || levelItems === null ? (
              <Loader className="animate-spin" />
            ) : (
              <>
                {t("Оплатить")}
                {selectedPurchaseItem !== null && (
                  <>
                    {Telegram.WebApp.initData ? (
                      <>
                        <StarIcon className="ml-1.5 mr-1 h-auto w-5 text-inherit" />
                        <span>
                          {selectedPurchaseItem.starsPrice * quantity}
                        </span>
                      </>
                    ) : (
                      <>
                        <TonIcon className="ml-1.5 mr-1 h-auto w-5 text-inherit" />
                        <span>
                          {(selectedPurchaseItem.tonPrice * quantity).toFixed(
                            2,
                          )}
                        </span>
                        <span className="translate-x-1 translate-y-px text-sm line-through opacity-80">
                          {(
                            selectedPurchaseItem.tonPriceFull * quantity
                          ).toFixed(2)}
                        </span>
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </LargeButton>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default BuyLevels
