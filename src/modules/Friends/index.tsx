import { useMemo, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

import AddUserIcon from "@/assets/icons/add-user.svg?react"
import LoaderIcon from "@/assets/icons/loader.svg?react"
import CoinPng from "@/assets/images/coin.png"
import Bell from "@/assets/icons/notification-bell.svg?react"
import Loader from "@/assets/icons/loader.svg?react"

import LoadingScreen from "../LoadingScreen"

import CalculatorAnimation from "./components/CalculatorAnimation"
import ReferralItem from "./components/ReferralItem"
import ReferralLinks from "./components/ReferralLinks"
import KOLForm from "./components/KOLForm"

import InviteFriendDialog from "@/modals/InviteFriend"

import { Button } from "@/shared/ui/Button"
import { LargeButton } from "@/shared/ui/LargeButton"

import {
  useClaimReferralPointsMutation,
  useGetLastClaimTimeQuery,
  useGetReferralPointsQuery,
  useGetReferralsQuery,
} from "@/redux/api/user"
import {
  useNotifyUnactiveFriendsMutation,
  useGetNextUnactiveNotifyTimeQuery,
} from "@/redux/api/notification"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { setPage } from "@/redux/slices/refPageNumber"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"
import { numberWithSpaces } from "@/utils/numberWithSpaces"
import { getHours, getMinutes } from "@/utils/date"
import { sendMetrika } from "@/utils/sendMetrika"

import { useHasFocus } from "@/hooks/useHasFocus"

import { cn } from "@/lib/cn"

const TIME_BEFORE_CLAIMS_IN_HOURS = import.meta.env.VITE_TIME_BEFORE_CLAIMS
  ? parseInt(import.meta.env.VITE_TIME_BEFORE_CLAIMS)
  : 4
const DEFAULT_PAGINATION_SIZE = 15
// fix when time to next claim exactly 4 hours away from Date.now()
const EXTRA_SEC = 1000

const Friends = () => {
  const [isClaimLocked, setIsClaimLocked] = useState(false)
  const [isNotifyLocked, setIsNotifyLocked] = useState(false)

  const hasFocus = useHasFocus()

  const { t } = useTranslation()

  const page = useAppSelector((state) => state.refPageNumber.value)
  const lang = useAppSelector((state) => state.language.value)
  const dispatch = useAppDispatch()

  const {
    data: referralInfo,
    isLoading: isReferralsLoading,
    isFetching,
  } = useGetReferralsQuery({ page, size: DEFAULT_PAGINATION_SIZE })
  const { data: lastClaimTime, isLoading: isLastClaimTimeLoading } =
    useGetLastClaimTimeQuery(undefined, {
      refetchOnFocus: true,
      refetchOnMountOrArgChange: 30,
    })
  const { data: nextUnactiveNotify } = useGetNextUnactiveNotifyTimeQuery()

  const [claim, { isLoading: isClaimLoading }] =
    useClaimReferralPointsMutation()
  const [notify] = useNotifyUnactiveFriendsMutation()

  const nextClaim = useMemo(() => {
    if (lastClaimTime === undefined) return 0

    return (
      new Date(lastClaimTime).getTime() +
      1000 * 60 * 60 * TIME_BEFORE_CLAIMS_IN_HOURS
    )
  }, [lastClaimTime])

  const { data: referralPoints, isLoading: isReferralPointsLoading } =
    useGetReferralPointsQuery(undefined, {
      skip: !lastClaimTime || Date.now() < nextClaim,
      refetchOnFocus: true,
      refetchOnMountOrArgChange: 30,
    })

  const timeToNextClaim = useMemo(
    () => (nextClaim - Date.now() - EXTRA_SEC) / 1000,
    [nextClaim, hasFocus],
  )

  const timeToNextNotify = useMemo(() => {
    if (nextUnactiveNotify === undefined) return null
    if (nextUnactiveNotify === null) return 0

    // Вычисляем разницу во времени в миллисекундах
    const timeDifference = +new Date(nextUnactiveNotify) - +new Date()

    if (timeDifference < 0) return 0
    // Переводим миллисекунды в дни и часы
    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24))
    const hours = Math.floor(
      (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    )

    return {
      days,
      hours,
    }
  }, [nextUnactiveNotify])

  if (isReferralsLoading) return <LoadingScreen />

  if (!referralInfo) return null

  const onClaimClick = async () => {
    if (isClaimLoading || isClaimLocked) return

    makeHapticFeedback({ impactOccured: "rigid" })

    setIsClaimLocked(true)

    try {
      const claimedPoints = await claim().unwrap()
      toast(
        <div className="flex flex-wrap items-center font-bold">
          <img
            src={CoinPng}
            alt="Nuts coin icon"
            className="mr-2.5 h-10 w-10"
          />
          <span className="text-[#FED900]">
            +{numberWithSpaces(claimedPoints)} NUTS
          </span>
        </div>,
        {
          className: "justify-center",
        },
      )
    } catch {
      toast.error(t("Ошибка"), {
        description: t("Упс, что-то пошло не так"),
      })
    } finally {
      setTimeout(() => setIsClaimLocked(false), 1000)
    }
  }

  const notifyUnactive = async () => {
    if (isNotifyLocked) return

    sendMetrika("notify_all_friends")

    makeHapticFeedback({ impactOccured: "rigid" })

    setIsNotifyLocked(true)

    try {
      await notify().unwrap()
      toast(t("Уведомление друзьям отправлено"), {
        className: "justify-center text-center",
      })
    } catch {
      toast.error(t("Ошибка"), {
        description: t("Упс, что-то пошло не так"),
      })
    }
  }

  return (
    <main
      className={cn(
        "relative flex flex-1 flex-col items-center px-4 pt-16 phone-sm:pt-20",
        Telegram.WebApp.platform === "weba"
          ? "pb-[174px]"
          : "pb-[calc(max(var(--tg-safe-area-inset-bottom,16px),16px)+158px)]",
      )}
    >
      {referralInfo.items.length > 0 ? (
        <>
          <div className="flex h-[100px] w-full shrink-0 flex-col items-center justify-center gap-2 rounded-xl border-2 border-[#1C2430]">
            {isLastClaimTimeLoading || isReferralPointsLoading ? (
              <>
                <CalculatorAnimation />
                <span className="text-sm font-semibold text-white/50">
                  {t("Вычисляем...")}
                </span>
              </>
            ) : Date.now() < nextClaim ? (
              <div className="flex flex-col items-center gap-2">
                <CalculatorAnimation />
                <p className="text-xs text-white/50">
                  {`${t("Приходи через")} ${getHours(timeToNextClaim)}${t("h")} ${getMinutes(timeToNextClaim)}${t("m")}`}
                </p>
              </div>
            ) : (
              <div className="flex w-full items-center gap-2.5 px-3 phone-sm:pl-6 phone-sm:pr-5">
                <img
                  src={CoinPng}
                  alt="Nuts coin icon"
                  className="h-7 w-7 phone-sm:h-8 phone-sm:w-8 phone:h-9 phone:w-9"
                />
                <span className="font-tt-hoves text-xl font-semibold phone-sm:text-2xl phone:text-[28px]">
                  {referralPoints ? numberWithSpaces(referralPoints) : 0}
                </span>
                <Button
                  className="ml-auto shrink-0 phone-sm:h-10"
                  contentClassName="phone-sm:h-9 phone-sm:px-5 phone-sm:text-base"
                  shadowClassName="phone-sm:h-10"
                  onClick={onClaimClick}
                  disabled={
                    isClaimLoading ||
                    Date.now() < nextClaim ||
                    (referralPoints === undefined ? false : referralPoints <= 0)
                  }
                >
                  {isClaimLoading ? (
                    <LoaderIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    t("Получить")
                  )}
                </Button>
              </div>
            )}
          </div>
          <span
            className={cn(
              "mt-3 w-[280px] text-center text-xs font-semibold text-white/50",
              lang === "RU" ? "w-[280px]" : "w-[200px]",
            )}
          >
            {t(
              "Получай +7% от каждого приглашённого друга и +3% от всех его друзей",
            )}
          </span>

          <KOLForm />

          {/* Интерфейс ввода реферальных ссылок */}
          <ReferralLinks />

          <div className="mb-3.5 mt-7 flex h-9 w-full items-center justify-between">
            <span className="font-tt-hoves-expanded text-lg font-semibold">
              {numberWithSpaces(referralInfo.total)}{" "}
              {referralInfo.total > 1 ? "frens" : "fren"}
            </span>

            {timeToNextNotify !== null &&
              (timeToNextNotify === 0 ? (
                <button
                  className="flex h-9 items-center justify-center gap-1 rounded-[10px] bg-[#1C2430] px-2.5 transition-colors active:bg-[#1C2430]/70"
                  onClick={notifyUnactive}
                >
                  {isNotifyLocked ? (
                    <Loader className="animate-spin" />
                  ) : (
                    <>
                      <Bell className="h-4 w-4 text-white/75" />
                      <span className="text-sm font-semibold">
                        {t("Оповестить неактивных")}
                      </span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  className="flex h-9 items-center justify-center gap-1 rounded-[10px] bg-[#1C2430] px-2.5 text-sm opacity-75"
                  disabled
                >
                  {`${t("Доступно через")} ${timeToNextNotify.days}${t("d")} ${timeToNextNotify.hours}${t("h")}`}
                </button>
              ))}
          </div>

          <div className="flex w-full flex-col gap-3.5">
            {referralInfo.items.map((ref, i) => (
              <ReferralItem key={i} {...ref} />
            ))}
            {DEFAULT_PAGINATION_SIZE * page < referralInfo.total && (
              <button
                className="flex h-14 w-full items-center justify-center gap-4 rounded-[14px] bg-[#17202D] font-tt-hoves text-base font-semibold text-white transition-colors active:bg-[#202936]"
                onClick={() => {
                  if (isFetching) return
                  dispatch(setPage(page + 1))
                }}
              >
                {isFetching && <LoaderIcon className="h-5 w-5 animate-spin" />}
                {t("Загрузить ещё")}
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <span
            className={cn(
              "mt-3 w-[280px] text-center text-xs font-semibold text-white/50",
              lang === "RU" ? "w-[280px]" : "w-[200px]",
            )}
          >
            {t(
              "Получай +7% от каждого приглашённого друга и +3% от всех его друзей",
            )}
          </span>
          <KOLForm />
          {/* Интерфейс ввода реферальных ссылок */}
          <ReferralLinks />
        </>
      )}

      <div
        className={cn(
          "fixed z-[1] h-[84px] w-full max-w-[500px] bg-background px-4 pt-4",
          Telegram.WebApp.platform === "weba"
            ? "bottom-[76px]"
            : "bottom-[calc(max(var(--tg-safe-area-inset-bottom,16px),16px)+60px)]",
        )}
      >
        <InviteFriendDialog>
          <LargeButton
            appearance="white"
            onClick={() => sendMetrika("invite_referral")}
          >
            <AddUserIcon className="h-5 w-5" />
            {t("Пригласить друга")}
          </LargeButton>
        </InviteFriendDialog>
      </div>
    </main>
  )
}

export default Friends
