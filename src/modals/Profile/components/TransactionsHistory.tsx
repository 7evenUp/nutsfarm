import { useEffect, useRef } from "react"
import * as Collapsible from "@radix-ui/react-collapsible"
import { useTranslation } from "react-i18next"

import ChevronDown from "@/assets/icons/chevron-down.svg?react"
import CoinPng from "@/assets/images/coin.png"

import { Skeleton } from "@/shared/ui/Skeleton"

import {
  useGetCurrentUserQuery,
  useGetTransactionsInfiniteQuery,
} from "@/redux/api/user"

import { numberWithSpaces } from "@/utils/numberWithSpaces"

import { UserTransaction, UserTransactionAction } from "@/types/user"

import { cn } from "@/lib/cn"

const TransactionsHistory = () => {
  const { t } = useTranslation()

  const { data: currentUser } = useGetCurrentUserQuery()
  const { data, isLoading, isFetching } = useGetTransactionsInfiniteQuery()

  if (isLoading) {
    return <Skeleton className="mb-6 ml-4 h-6 w-48 rounded-lg" />
  }

  if (!currentUser) return
  if (!data) return

  const flatedTransactions = data.pages
    .flatMap((r) => r.items)
    .filter((item) => item.amount !== null && Math.abs(item.amount) > 0)

  if (flatedTransactions.length === 0) return

  return (
    <Collapsible.Root
      className={cn("mb-6 flex w-full flex-col items-center px-4 text-white")}
    >
      <Collapsible.CollapsibleTrigger className="group flex w-full items-center gap-2">
        <span className="font-tt-hoves-expanded text-lg font-semibold text-white">
          {t("История транзакций")}
        </span>
        <ChevronDown className="h-5 w-5 text-white/75 transition-transform group-data-[state=open]:rotate-180" />
      </Collapsible.CollapsibleTrigger>
      <Collapsible.Content className="w-full overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <p className="mt-4 text-balance text-xs text-white/50">
          {t(
            "Награда отображается без учёта бустера, полученного за дневной стрик",
          )}
        </p>
        <div className="mt-4 flex flex-col divide-y divide-white/30 first:border-t first:border-white/30 last:border-b last:border-white/30">
          {flatedTransactions.map((transaction, i) => (
            <TxItem
              key={i}
              {...transaction}
              isLast={i === flatedTransactions.length - 1}
            />
          ))}
          {isFetching && (
            <>
              <div className="flex h-[45px] items-center justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-12" />
              </div>
              <div className="flex h-[45px] items-center justify-between">
                <Skeleton className="h-5 w-8" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="flex h-[45px] items-center justify-between">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-14" />
              </div>
            </>
          )}
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

export default TransactionsHistory

const TxItem = ({
  isLast,
  ...transaction
}: UserTransaction & { isLast: boolean }) => {
  const lastTxRef = useRef(null)

  const { hasNextPage, fetchNextPage } = useGetTransactionsInfiniteQuery()

  useEffect(() => {
    if (!lastTxRef.current) return
    if (!isLast) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (hasNextPage) {
            fetchNextPage()
          }
        }
      },
      {
        threshold: 0,
      },
    )

    observer.observe(lastTxRef.current)

    return () => observer.disconnect()
  }, [lastTxRef, hasNextPage, fetchNextPage, isLast])

  return (
    <div
      ref={lastTxRef}
      className="flex items-center justify-between gap-1 rounded-sm py-3 text-sm font-medium"
    >
      <p className="truncate text-white/75">
        <TransactionActionMapper
          action={transaction.action}
          type={transaction.type}
        />
      </p>
      <div
        className={cn(
          "flex shrink-0 items-center gap-1",
          transaction.type === "DEPOSIT" && "text-[#A3FF47]/75",
          transaction.type === "WITHDRAW" && "text-[#FF493E]/75",
        )}
      >
        {transaction.type === "DEPOSIT"
          ? "+" + numberWithSpaces(transaction.amount)
          : numberWithSpaces(transaction.amount)}
        <img
          src={CoinPng}
          alt="Nuts coin icon"
          className="h-3.5 w-3.5 opacity-75"
        />
      </div>
    </div>
  )
}

const TransactionActionMapper = ({
  action,
  type,
}: {
  action: UserTransactionAction
  type: "WITHDRAW" | "DEPOSIT"
}) => {
  const { t } = useTranslation()

  if (action === "DAILY_STREAK_REWARD") return t("Дневная награда")
  if (action === "FARM") return t("Фарм")
  if (action === "FREEZE_PAYMENT") return t("Заморозка стрика")
  if (action === "LEARN") return t("Прохождение урока")
  if (action === "LEVELS_BUYING") return t("Покупка уровней")
  if (action === "NUT_PASS_REWARD") return t("Награда пропуска")
  if (action === "REFERRAL") return t("Награда за друга")
  if (action === "RETRO_DROP_BALANCE_BONUS") return t("Ретродроп")
  if (action === "RETRO_DROP_BONUS") return t("Ретродроп")
  if (action === "START_BONUS") return t("Приветственный бонус")
  if (action === "STORY") return t("Просмотр истории")
  if (action === "TASK") return t("Выполнение задания")
  if (action === "TON_WALLET_BONUS") return t("Подключение TON кошелька")
  if (action === "NUTCRACKER_BONUS") return t("Бонус к фарму")
  if (action === "ACHIEVEMENT") return t("Награда за достижение")
  if (action === "GAME") {
    if (type === "DEPOSIT") return t("Награда за прохождение")
    if (type === "WITHDRAW") return t("Старт уровня")
  }
  if (action === "NUTS_PURCHASE") return t("Внутриигровая покупка")
  if (action === "BOOST") return t("Награда за бустер")
  if (action === "WHEEL_REWARD") return t("Награда за прокрутку колеса")
  if (action === "RETRO_DROP_2_BONUS") return t("Ретродроп")
  if (action === "OTHER") return t("Прочее")

  return action
}
