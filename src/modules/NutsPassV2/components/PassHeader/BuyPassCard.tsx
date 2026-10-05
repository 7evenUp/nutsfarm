import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import TicketIcon from "@/assets/passV2/icons/ticket-yellow.svg?react"
import StarIcon from "@/assets/passV2/icons/star.svg?react"
import TonIcon from "@/assets/icons/ton.svg?react"

import { Skeleton } from "@/shared/ui/Skeleton"

import { useGetPaymentItemsQuery } from "@/redux/api/payment"
import { useGetCurrentUserQuery } from "@/redux/api/user"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"
import { sendMetrika } from "@/utils/sendMetrika"
import { getHours, getMinutes } from "@/utils/date"

import { cn } from "@/lib/cn"

const BuyPassCard = ({
  openBuyPass,
  className,
}: {
  openBuyPass: VoidFunction
  className?: string
}) => {
  const { t } = useTranslation()

  const { data: paymentItems } = useGetPaymentItemsQuery(undefined)
  const { isFetching: isCurrentUserFetching } = useGetCurrentUserQuery()

  const passItem = useMemo(() => {
    if (!paymentItems) return null

    const neededItem = paymentItems.find((item) => item.type === "NUT_PASS")

    if (!neededItem) return null

    return neededItem
  }, [paymentItems])

  return (
    <>
      <div
        className={cn(
          "flex h-14 w-full items-center rounded-[10px] bg-[#F2DD22]/20 px-1.5 backdrop-blur phone-sm:px-2.5",
          className,
        )}
      >
        <TicketIcon className="mr-1 h-7 w-7 shrink-0 phone-sm:mr-2 phone-sm:h-8 phone-sm:w-8 phone-sm-fix:h-[37px] phone-sm-fix:w-[37px]" />
        <p className="mr-2 text-balance text-[9px]/[11px] font-bold text-[#F6D237] phone-sm:text-[10px]/[12px] phone-sm-fix:text-[11px]/[13px] phone:text-xs/[14px]">
          {t("Открой уникальные награды с Premium")}
        </p>
        {passItem === null || isCurrentUserFetching ? (
          <Skeleton className="ml-auto h-9 w-[150px] rounded-lg bg-white/50 drop-shadow-[0px_2px_3px_rgba(0,0,0,0.2)] phone-sm:w-44" />
        ) : (
          <button
            className="relative ml-auto h-9 min-w-[150px] rounded-lg border border-[#24292A] bg-gradient-to-br from-[#FAD00B] to-[#FEEB1D] drop-shadow-[0px_2px_3px_rgba(0,0,0,0.2)] transition-transform active:scale-[0.98] phone-sm:min-w-44"
            onClick={() => {
              makeHapticFeedback({ impactOccured: "soft" })
              sendMetrika("buy_pass_button_click")
              openBuyPass()
            }}
          >
            <p className="absolute inset-[3px] flex items-center justify-center gap-1 rounded-[7px] bg-gradient-to-r from-[#93711A]/20 from-[42%] via-[#F9F0C5]/20 via-[70%] to-[#93711A]/20 to-[90%] text-xs font-extrabold text-[#481F02] phone-sm:text-sm/[15px]">
              {Telegram.WebApp.initData ? (
                <>
                  {passItem.personalDiscountPercent !== null &&
                  passItem.personalDiscountStarsPrice !== null &&
                  passItem.personalDiscountEndTime !== null &&
                  new Date(passItem.personalDiscountEndTime).getTime() >
                    new Date().getTime() ? (
                    <>
                      <span className="ml-2">
                        {getHours(
                          (new Date(
                            passItem.personalDiscountEndTime,
                          ).getTime() -
                            new Date().getTime()) /
                            1000,
                          false,
                          true,
                        )}
                        :
                        {getMinutes(
                          (new Date(
                            passItem.personalDiscountEndTime,
                          ).getTime() -
                            new Date().getTime()) /
                            1000,
                        )}
                      </span>
                      <div className="ml-auto flex items-center gap-0.5">
                        <StarIcon className="h-auto w-4 text-[#481F02] phone-sm:w-[15px]" />
                        <span>
                          {Math.floor(passItem.personalDiscountStarsPrice)}
                        </span>
                        <span className="ml-0.5 mr-2 text-[11px]/none line-through opacity-75">
                          {passItem.starsPrice}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      {t("Приобрести за")}{" "}
                      <StarIcon className="h-auto w-3 text-[#481F02] phone-sm:w-[15px]" />{" "}
                      {passItem.starsPrice}
                    </>
                  )}
                </>
              ) : (
                <>
                  {passItem.personalDiscountPercent !== null &&
                  passItem.personalDiscountTonPrice !== null &&
                  passItem.personalDiscountEndTime !== null &&
                  new Date(passItem.personalDiscountEndTime).getTime() >
                    new Date().getTime() ? (
                    <>
                      <span className="ml-2">
                        {getHours(
                          (new Date(
                            passItem.personalDiscountEndTime,
                          ).getTime() -
                            new Date().getTime()) /
                            1000,
                          false,
                          true,
                        )}
                        :
                        {getMinutes(
                          (new Date(
                            passItem.personalDiscountEndTime,
                          ).getTime() -
                            new Date().getTime()) /
                            1000,
                        )}
                      </span>
                      <div className="ml-auto flex items-center gap-0.5">
                        <TonIcon className="h-auto w-4 text-[#481F02] phone-sm:w-[15px]" />
                        <span>
                          {passItem.personalDiscountTonPrice.toFixed(2)}
                        </span>
                        <span className="ml-0.5 mr-2 text-[11px]/none line-through opacity-75">
                          {passItem.tonPrice.toFixed(2)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      {t("Приобрести за")}{" "}
                      <TonIcon className="h-auto w-3 text-[#481F02] phone-sm:w-[15px]" />{" "}
                      {passItem.tonPrice.toFixed(2)}
                    </>
                  )}
                </>
              )}
            </p>
          </button>
        )}
      </div>
    </>
  )
}

export default BuyPassCard
