import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Description } from "@radix-ui/react-dialog"
import { toast } from "sonner"

import Loader from "@/assets/icons/loader.svg?react"
import RetrodropIcon from "@/assets/icons/retrodrop.svg?react"
import RetrodropLegend from "@/assets/icons/retrodrop-legend.svg?react"
import CoinSpecialPng from "@/assets/images/coin-special.png"

import { LargeButton } from "@/shared/ui/LargeButton"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/shared/ui/SideSheet"
import { Skeleton } from "@/shared/ui/Skeleton"

import { useClaimDropMutation, useGetDropInfoQuery } from "@/redux/api/farming"

import { numberWithSpaces } from "@/utils/numberWithSpaces"

import { cn } from "@/lib/cn"

const RetrodropNew = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)

  const {
    data: drop,
    isFetching: isDropLoading,
    refetch: refetchRetrodrop,
  } = useGetDropInfoQuery(undefined, { skip: !open })
  const [mutate, { isLoading }] = useClaimDropMutation()

  const onClaimClick = async () => {
    if (isLoading) return
    if (drop === undefined || drop.claimed) return

    try {
      await mutate().unwrap()
      refetchRetrodrop()
      toast(t("Ретродроп успешно получен"), {
        className: "justify-center",
      })
    } catch (error) {
      // @ts-expect-error RTKQ_NO_ERROR_TYPES
      if (error.originalStatus === 400) {
        toast.error(t("Ошибка"), {
          description: t("Вы уже получали ретродроп"),
        })
      } else {
        toast.error(t("Ошибка"), {
          description: t("Упс, что-то пошло не так"),
        })
      }
    } finally {
      setOpen(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        className={cn(
          "gap-0 overflow-y-auto overflow-x-hidden px-4",
          Telegram.WebApp.platform === "weba"
            ? "pb-4"
            : "pb-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
        )}
      >
        <Description className="sr-only">Retrodrop modal</Description>
        <SheetHeader
          titleClassName="max-w-[270px] text-center relative text-2xl"
          className="shrink-0"
          headerIcon={
            <RetrodropIcon className="absolute right-10 top-2.5 h-20 w-20 rotate-[24deg]" />
          }
        >
          {t("Ретродроп")}
        </SheetHeader>
        <div className="flex flex-col gap-2">
          {isDropLoading ? (
            <>
              <Skeleton className="my-10 h-[72px] rounded-[14px] bg-white/50" />
              <LargeButton appearance="white">
                <Loader className="animate-spin" />
              </LargeButton>
            </>
          ) : (
            drop && (
              <>
                <div className="relative my-10 flex items-center gap-3.5 rounded-[14px] bg-gradient-to-r from-[#FEEE1F] to-[#FACB08] py-1.5 pl-1.5 pr-2.5">
                  <div className="relative z-10 flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-xl bg-[#1C2430]">
                    <RetrodropLegend />
                  </div>

                  <span className="relative z-10 mr-3 text-sm font-semibold text-background">
                    {t("Активист Nuts Farm")}
                  </span>
                  <div className="relative z-10 ml-auto flex shrink-0 items-center gap-1 text-sm font-bold text-background">
                    <img
                      src={CoinSpecialPng}
                      alt="Coin image"
                      className="h-4 w-4"
                    />
                    <span>
                      +{numberWithSpaces(drop.cryptonRetroDropAmount)}
                    </span>
                  </div>
                </div>
                <LargeButton
                  appearance="white"
                  onClick={onClaimClick}
                  disabled={drop.claimed}
                >
                  {drop.claimed ? (
                    t("Получено")
                  ) : isLoading ? (
                    <Loader className="animate-spin" />
                  ) : (
                    t("Получить")
                  )}
                </LargeButton>
              </>
            )
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default RetrodropNew
