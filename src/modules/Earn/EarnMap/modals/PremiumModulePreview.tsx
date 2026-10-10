import React, { Dispatch, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { LargeButton } from "@/shared/ui/LargeButton"
import { Sheet, SheetContent } from "@/shared/ui/SideSheet"
import { Description } from "@radix-ui/react-dialog"

import TonIcon from "@/assets/icons/ton.svg?react"
import Loader from "@/assets/icons/loader.svg?react"
import StarIcon from "@/assets/lesson-icons/star-icon.svg?react"

import { useGetPaymentItemsQuery } from "@/redux/api/payment"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"
import { getHours, getMinutes } from "@/utils/date"

import { Module } from "@/types/learn"

import { cn } from "@/lib/cn"

import {
  BackButton,
  initBackButton,
  RemoveEventListenerFn,
} from "@/demo/telegram-sdk"

let backButton: BackButton

if (true) {
  try {
    const [initializedBackButton] = initBackButton()
    backButton = initializedBackButton
  } catch {
    /* empty */
  }
}

interface PremiumModulePreviewModalProps {
  open: boolean
  isCommitPaymentLocked: boolean
  selectedModule: Module
  preview: string[]
  onOpenChange: Dispatch<React.SetStateAction<boolean>>
  onPurchaseClick: () => void
}

const PremiumModulePreviewModal = ({
  open,
  preview,
  isCommitPaymentLocked,
  selectedModule,
  onOpenChange,
  onPurchaseClick,
}: PremiumModulePreviewModalProps) => {
  const { t } = useTranslation()

  const [activeSlide, setActiveSlide] = useState(0)

  const { data: paymentItems } = useGetPaymentItemsQuery(undefined)

  const moduleItem = useMemo(() => {
    if (!paymentItems) return null

    const neededItem = paymentItems.find(
      (item) => item.type === "UNLOCK_MODULE",
    )

    if (!neededItem) return null

    return neededItem
  }, [paymentItems])

  // BackButton
  useEffect(() => {
    if (!backButton) return

    let rmListener: RemoveEventListenerFn
    if (open) {
      backButton.show()
      rmListener = backButton.on("click", () => {
        onOpenChange(false)
      })
    } else {
      backButton.hide()
    }

    return () => {
      rmListener && rmListener()
    }
  }, [open])

  // cacheImages
  useEffect(() => {
    const cacheContent = async () => {
      const promises = preview.map((src) => {
        return new Promise((resolve, reject) => {
          if (!src) return

          const img = new Image()
          img.src = src
          img.onload = resolve
          img.onerror = reject
        })
      })

      await Promise.all(promises)
    }

    cacheContent()
  }, [])

  const onPrevClick = () => {
    makeHapticFeedback({ impactOccured: "soft" })

    if (activeSlide !== 0) {
      setActiveSlide((prev) => prev - 1)
    }
  }

  const onNextClick = () => {
    makeHapticFeedback({ impactOccured: "soft" })

    if (activeSlide >= preview.length - 1) {
      onOpenChange(false)
      return
    }

    setActiveSlide((prev) => prev + 1)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className={cn(
          "gap-0 overflow-y-auto rounded-t-none bg-background px-0 pt-0 phone-sm:py-2",
          Telegram.WebApp.platform === "weba"
            ? "pb-2"
            : "pb-[max(var(--tg-safe-area-inset-bottom,8px),8px)]",
          Telegram.WebApp.initData ? "h-screen" : "h-[100svh]",
        )}
      >
        <Description className="sr-only">Premium module modal</Description>

        <div className="absolute left-1/2 top-4 z-50 flex w-full -translate-x-1/2 items-center gap-1 px-4">
          {preview.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full",
                activeSlide >= i ? "bg-white" : "bg-[#333848]",
              )}
            />
          ))}
        </div>

        <img
          alt={`Info slide №${activeSlide + 1}`}
          src={preview[activeSlide]}
          className={cn(
            "absolute inset-0 h-full w-full object-cover object-top",
            !Telegram.WebApp.initData && "sm:object-contain",
          )}
        />

        {activeSlide > 0 && (
          <button
            aria-label="Previous slide"
            className="absolute inset-y-0 left-0 z-50 h-full w-1/2"
            onClick={onPrevClick}
          />
        )}

        <button
          aria-label={
            activeSlide >= preview.length - 1
              ? "Finish Nuts Pass Info"
              : "Next slide"
          }
          className="absolute inset-y-0 right-0 z-50 h-full w-1/2"
          onClick={onNextClick}
        />

        {activeSlide === preview.length - 1 ? (
          <div
            className={cn(
              "fixed z-50 w-full px-3",
              Telegram.WebApp.platform === "weba"
                ? "bottom-[16px]"
                : "bottom-[calc(max(var(--tg-safe-area-inset-bottom,8px),16px))]",
            )}
          >
            <LargeButton
              appearance="yellow-linear"
              onClick={onPurchaseClick}
              disabled={isCommitPaymentLocked}
            >
              {moduleItem &&
                moduleItem.personalDiscountPercent !== null &&
                moduleItem.personalDiscountStarsPrice !== null &&
                moduleItem.personalDiscountTonPrice !== null &&
                moduleItem.personalDiscountEndTime !== null &&
                new Date(moduleItem.personalDiscountEndTime).getTime() >
                  new Date().getTime() && (
                  <p className="absolute -right-2 top-2 z-50 -translate-y-full rotate-2 whitespace-nowrap rounded-lg bg-cyan px-3 py-1 font-nunito text-xs font-bold tracking-wide drop-shadow-[0px_1px_1px_rgba(0,0,0,.5)]">
                    {t("Персональное предложение %")}
                  </p>
                )}
              {isCommitPaymentLocked ? (
                <Loader className="animate-spin" />
              ) : (
                <>
                  {Telegram.WebApp.initData ? (
                    <>
                      {moduleItem &&
                      moduleItem.personalDiscountPercent !== null &&
                      moduleItem.personalDiscountStarsPrice !== null &&
                      moduleItem.personalDiscountEndTime !== null &&
                      new Date(moduleItem.personalDiscountEndTime).getTime() >
                        new Date().getTime() ? (
                        <>
                          <span className="ml-2 flex items-center justify-center gap-1 rounded-[7px] bg-gradient-to-r from-[#93711A]/20 from-[42%] via-[#93711A]/10 via-[70%] to-[#93711A]/20 to-[90%] p-1 text-xs font-extrabold text-[#481F02]">
                            {getHours(
                              (new Date(
                                moduleItem.personalDiscountEndTime,
                              ).getTime() -
                                new Date().getTime()) /
                                1000,
                              false,
                              true,
                            )}
                            {t("h")}{" "}
                            {getMinutes(
                              (new Date(
                                moduleItem.personalDiscountEndTime,
                              ).getTime() -
                                new Date().getTime()) /
                                1000,
                            )}
                            {t("m")}
                          </span>
                          {t("Открыть за")}
                          <div className="flex items-center gap-1.5">
                            <StarIcon className="h-4 w-4" />
                            <span>
                              {Math.floor(
                                moduleItem.personalDiscountStarsPrice,
                              )}
                            </span>
                            <span className="scale-[.9] line-through opacity-50">
                              {selectedModule.starsPrice}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          {t("Открыть за")}
                          <StarIcon className="h-4 w-4" />
                          {selectedModule.starsPrice}
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {moduleItem &&
                      moduleItem.personalDiscountPercent !== null &&
                      moduleItem.personalDiscountTonPrice !== null &&
                      moduleItem.personalDiscountEndTime !== null &&
                      new Date(moduleItem.personalDiscountEndTime).getTime() >
                        new Date().getTime() ? (
                        <>
                          <span className="ml-2 flex items-center justify-center gap-1 rounded-[7px] bg-gradient-to-r from-[#93711A]/20 from-[42%] via-[#93711A]/10 via-[70%] to-[#93711A]/20 to-[90%] p-1 text-xs font-extrabold text-[#481F02]">
                            {getHours(
                              (new Date(
                                moduleItem.personalDiscountEndTime,
                              ).getTime() -
                                new Date().getTime()) /
                                1000,
                              false,
                              true,
                            )}
                            {t("h")}{" "}
                            {getMinutes(
                              (new Date(
                                moduleItem.personalDiscountEndTime,
                              ).getTime() -
                                new Date().getTime()) /
                                1000,
                            )}
                            {t("m")}
                          </span>
                          {t("Открыть за")}
                          <div className="flex items-center gap-1.5">
                            <TonIcon className="h-4 w-4" />
                            <span>
                              {moduleItem.personalDiscountTonPrice.toFixed(2)}
                            </span>
                            <span className="scale-[.9] line-through opacity-50">
                              {selectedModule.tonPrice &&
                                selectedModule.tonPrice.toFixed(2)}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          {t("Открыть за")}
                          <TonIcon className="h-4 w-4" />
                          {selectedModule.tonPrice &&
                            selectedModule.tonPrice.toFixed(2)}
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </LargeButton>
          </div>
        ) : (
          <div
            className={cn(
              "fixed z-50 w-full px-3",
              Telegram.WebApp.platform === "weba"
                ? "bottom-[16px]"
                : "bottom-[calc(max(var(--tg-safe-area-inset-bottom,8px),16px))]",
            )}
          >
            <LargeButton appearance="yellow-linear" onClick={onNextClick}>
              {t("Далее")}
            </LargeButton>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default PremiumModulePreviewModal
