import { useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Close, Description } from "@radix-ui/react-dialog"

import UserIcon from "@/assets/icons/user.svg?react"
import CloseIcon from "@/assets/icons/close.svg?react"
import CrownSilverIcon from "@/assets/icons/crown-silver.svg?react"
import CrownGoldIcon from "@/assets/icons/crown-gold.svg?react"
import CrownBronzeIcon from "@/assets/icons/crown-bronze.svg?react"
import CrownBackgroundIcon from "@/assets/passV2/icons/crown-xp-leaderboard-bg.svg?react"

import { XP_PER_LEVEL } from "../constants"

import { Sheet, SheetContent, SheetTrigger } from "@/shared/ui/SideSheet"
import { Skeleton } from "@/shared/ui/Skeleton"

import UserAvatar from "@/components/UserAvatar"
import UserNickname from "@/components/UserNickname"

import { useGetCurrentUserQuery } from "@/redux/api/user"
import {
  useGetXpLeaderboardInfiniteQuery,
  useGetXpPositionQuery,
} from "@/redux/api/leaderboard"

import { numberWithSpaces } from "@/utils/numberWithSpaces"

import { LeaderboardUser } from "@/types/leaderboard"

import { cn } from "@/lib/cn"

import {
  BackButton,
  initBackButton,
  RemoveEventListenerFn,
} from "@telegram-apps/sdk"
import { setOpenedProfileId } from "@/redux/slices/public-profile"
import { useAppDispatch } from "@/redux/hooks"

let backButton: BackButton

if (import.meta.env.VITE_IS_DEV_LOCAL === undefined) {
  try {
    const [initializedBackButton] = initBackButton()
    backButton = initializedBackButton
  } catch {
    /* empty */
  }
}

const XpLeaderboard = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)

  const { data: position, isLoading: isXpPositionLoading } =
    useGetXpPositionQuery(undefined, { skip: !open })
  const {
    data: leaderboardData,
    isLoading: isXpLoading,
    isFetchingNextPage,
  } = useGetXpLeaderboardInfiniteQuery(undefined, { skip: !open })
  const { data: currentUser } = useGetCurrentUserQuery()

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

  const xpLeaders = useMemo(() => {
    if (!leaderboardData) return undefined

    return leaderboardData.pages.flatMap((r) => r.items)
  }, [leaderboardData])

  if (!currentUser) return null

  // if (isXpPositionLoading || isXpLoading) return children

  // if (!xpLeaders || xpLeaders.length === 0 || !currentUser) return null

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        className={cn(
          "gap-0 overflow-y-auto bg-[#20142D] px-0 pb-4 pt-12",
          Telegram.WebApp.initData ? "h-screen rounded-t-none" : "h-[100svh]",
        )}
      >
        <Description className="sr-only">Leaderboard XP modal</Description>

        {!Telegram.WebApp.initData && (
          <Close className="absolute right-4 top-4 z-[100] opacity-70 transition-opacity focus:outline-none active:opacity-100">
            <CloseIcon className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </Close>
        )}

        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,_var(--tw-gradient-stops))] from-[#5B40A0]/70 from-[-50%] to-[#141A2D]/70 to-[50%]" />

        <CrownBackgroundIcon className="absolute left-1/2 top-0 -translate-x-1/2 translate-y-4" />

        <h2 className="relative mb-3.5 bg-gradient-to-b from-[#FFFFFF] to-[#E6DDFF] bg-clip-text text-center font-tt-hoves-expanded text-xl font-semibold text-transparent">
          Nuts Pass
          <br /> {t("Лидерборд")}
        </h2>

        <p className="relative mb-8 text-balance px-4 text-center text-sm text-white/75">
          {t(
            "Лидерборд рассчитан по уровню Pass и обновляется несколько раз в час",
          )}
        </p>

        {isXpPositionLoading || isXpLoading ? (
          <TopSkeleton />
        ) : xpLeaders === undefined ? (
          <div>{t("Упс, что-то пошло не так")}</div>
        ) : (
          <>
            {position && (
              <div
                className={cn(
                  "fixed inset-x-3.5 z-50",
                  Telegram.WebApp.platform === "weba"
                    ? "bottom-4"
                    : "bottom-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
                )}
                onClick={() => {
                  if (currentUser) {
                    dispatch(setOpenedProfileId(currentUser.id))
                  }
                }}
              >
                <div className="flex h-[55px] w-full items-center gap-2 rounded-xl bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#974AA6] to-[#55225F] to-[150%] px-3.5">
                  <UserAvatar className="h-6 w-6" />
                  <UserNickname className="text-sm font-medium" />
                  <span className="text-sm font-medium text-white/50">
                    {position.toString().includes("+")
                      ? numberWithSpaces(position)
                      : "#" + numberWithSpaces(position)}
                  </span>
                  <div className="ml-auto text-sm font-medium text-white">
                    {Math.floor(currentUser.nutPassXpBalance / XP_PER_LEVEL) +
                      1}{" "}
                    LVL
                  </div>
                </div>
              </div>
            )}

            <div className="mb-10 flex h-[174px] items-end justify-center gap-2.5 px-3.5">
              {xpLeaders.length > 1 && (
                <div
                  className="relative flex h-[164px] w-[90px] flex-col items-center rounded-xl bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#63559F] to-[#3D317F] to-[90%] pb-7 pt-2.5 phone-xsm:w-[100px] phone-sm:w-[110px] phone-sm-fix:w-[115px]"
                  onClick={() => dispatch(setOpenedProfileId(xpLeaders[1].id))}
                >
                  <CrownSilverIcon className="mb-2 shrink-0" />
                  {xpLeaders[1].telegramPicture ? (
                    <img
                      src={xpLeaders[1].telegramPicture}
                      alt="User's avatar"
                      className="h-[52px] w-[52px] rounded-full bg-white/10 object-cover"
                    />
                  ) : xpLeaders[1].firstname ? (
                    <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white/10 text-xl font-extrabold">
                      {xpLeaders[1].firstname[0].toUpperCase()}
                    </div>
                  ) : (
                    <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white/10">
                      <UserIcon className="h-6 w-6" />
                    </div>
                  )}
                  <span
                    style={{ wordWrap: "break-word" }}
                    className="mb-0.5 mt-auto max-h-4 w-full overflow-hidden truncate whitespace-normal px-2 text-center text-xs font-medium leading-4"
                  >
                    {xpLeaders[1].firstname}
                  </span>
                  <div className="flex items-center gap-1 truncate text-sm font-extrabold text-[#E2DCB6]">
                    {Math.floor(xpLeaders[1].nutPassXpBalance / XP_PER_LEVEL) +
                      1}
                    <span>LVL</span>
                  </div>
                  <div className="absolute bottom-0 left-1/2 flex h-[26px] w-[26px] -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-[#E7E2C6] to-[#DCD4A2] font-tt-hoves font-semibold text-[#060E14]">
                    2
                  </div>
                </div>
              )}
              {xpLeaders.length > 0 && (
                <div
                  className="relative flex h-[174px] max-w-[200px] flex-1 flex-col items-center rounded-xl bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#7664C3] to-[#4E418E] to-[100%] pb-7 pt-2.5"
                  onClick={() => dispatch(setOpenedProfileId(xpLeaders[0].id))}
                >
                  <CrownGoldIcon className="mb-2 shrink-0" />
                  {xpLeaders[0].telegramPicture ? (
                    <img
                      src={xpLeaders[0].telegramPicture}
                      alt="User's avatar"
                      className="h-16 w-16 rounded-full bg-white/10 object-cover"
                    />
                  ) : xpLeaders[0].firstname ? (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-2xl font-extrabold">
                      {xpLeaders[0].firstname[0].toUpperCase()}
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                      <UserIcon className="h-7 w-7" />
                    </div>
                  )}
                  <span
                    style={{ wordWrap: "break-word" }}
                    className="mb-0.5 mt-auto max-h-4 max-w-[90px] overflow-hidden truncate whitespace-normal text-center text-xs font-medium leading-4 phone-sm:max-w-[100px] phone-sm-fix:max-w-[110px] phone:max-w-[120px] phone-lg:max-w-[130px] phone-xl:max-w-[170px]"
                  >
                    {xpLeaders[0].firstname}
                  </span>
                  <div className="flex items-center gap-1 truncate text-sm font-extrabold text-[#F8D712]">
                    {Math.floor(xpLeaders[0].nutPassXpBalance / XP_PER_LEVEL) +
                      1}
                    <span>LVL</span>
                  </div>
                  <div className="absolute bottom-0 left-1/2 flex h-9 w-9 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-[#FEE61A] to-[#F2C509] font-tt-hoves text-2xl font-semibold text-[#060E14]">
                    1
                  </div>
                </div>
              )}
              {xpLeaders.length > 2 && (
                <div
                  className="relative flex h-[164px] w-[90px] flex-col items-center rounded-xl bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#63559F] to-[#3D317F] to-[90%] pb-7 pt-2.5 phone-xsm:w-[100px] phone-sm:w-[110px] phone-sm-fix:w-[115px]"
                  onClick={() => dispatch(setOpenedProfileId(xpLeaders[2].id))}
                >
                  <CrownBronzeIcon className="mb-2 shrink-0" />
                  {xpLeaders[2].telegramPicture ? (
                    <img
                      src={xpLeaders[2].telegramPicture}
                      alt="User's avatar"
                      className="h-[52px] w-[52px] rounded-full bg-white/10 object-cover"
                    />
                  ) : xpLeaders[2].firstname ? (
                    <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white/10 text-xl font-extrabold">
                      {xpLeaders[2].firstname[0].toUpperCase()}
                    </div>
                  ) : (
                    <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white/10">
                      <UserIcon className="h-6 w-6" />
                    </div>
                  )}
                  <span
                    style={{ wordWrap: "break-word" }}
                    className="mb-0.5 mt-auto max-h-4 w-full overflow-hidden truncate whitespace-normal px-2 text-center text-xs font-medium leading-4"
                  >
                    {xpLeaders[2].firstname}
                  </span>
                  <div className="flex items-center gap-1 truncate text-sm font-extrabold text-[#FEA313]">
                    {Math.floor(xpLeaders[2].nutPassXpBalance / XP_PER_LEVEL) +
                      1}
                    <span>LVL</span>
                  </div>
                  <div className="absolute bottom-0 left-1/2 flex h-[26px] w-[26px] -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-[#F79B16] to-[#FCD610] font-tt-hoves font-semibold text-[#060E14]">
                    3
                  </div>
                </div>
              )}
            </div>

            {xpLeaders.length > 3 && (
              <div className="relative mx-3.5 mb-20 flex flex-col gap-2">
                <div className="fixed inset-x-0 bottom-0 h-28 bg-gradient-to-b from-[#050D12]/0 to-[#050D12]" />
                {xpLeaders.slice(3).map((leader, i) => (
                  <LeaderItem
                    key={i}
                    index={i}
                    {...leader}
                    hasToFetchNew={i === xpLeaders.length - 5}
                  />
                ))}
                {isFetchingNextPage && (
                  <>
                    <Skeleton className="h-[55px] rounded-xl" />
                    <Skeleton className="h-[55px] rounded-xl" />
                    <Skeleton className="h-[55px] rounded-xl" />
                  </>
                )}
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default XpLeaderboard

const LeaderItem = ({
  id,
  index,
  telegramPicture,
  firstname,
  nutPassXpBalance,
  hasToFetchNew,
}: LeaderboardUser & { index: number; hasToFetchNew: boolean }) => {
  const dispatch = useAppDispatch()
  const lastItemRef = useRef<HTMLDivElement | null>(null)

  const { fetchNextPage, hasNextPage } = useGetXpLeaderboardInfiniteQuery()

  useEffect(() => {
    if (!lastItemRef.current) return
    if (!hasToFetchNew) return

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

    observer.observe(lastItemRef.current)

    return () => observer.disconnect()
  }, [lastItemRef, hasNextPage, fetchNextPage, hasToFetchNew])

  return (
    <div
      className="flex h-[55px] shrink-0 items-center rounded-xl bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#4F467B] to-[#3D2F67] px-3.5"
      ref={lastItemRef}
      onClick={() => dispatch(setOpenedProfileId(id))}
    >
      <span
        className={cn(
          "w-[19px] shrink-0 text-center text-sm font-medium text-white/50",
          index + 4 >= 100 && "w-6",
          index + 4 >= 1000 && "w-8",
        )}
      >
        {index + 4}
      </span>
      {telegramPicture ? (
        <img
          src={telegramPicture}
          alt="User's avatar"
          loading="lazy"
          className="ml-2.5 h-6 w-6 shrink-0 rounded-full bg-white/10 object-cover"
        />
      ) : firstname ? (
        <div className="ml-2.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-medium">
          {firstname[0].toUpperCase()}
        </div>
      ) : (
        <div className="ml-2.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10">
          <UserIcon className="h-4 w-4" />
        </div>
      )}
      <span className="mx-2 truncate text-sm font-medium">
        {firstname ? firstname : "-"}
      </span>
      <div className="ml-auto shrink-0 text-sm font-medium text-[#C2B4FE]">
        {Math.floor(nutPassXpBalance / XP_PER_LEVEL) + 1} LVL
      </div>
    </div>
  )
}

const TopSkeleton = () => {
  return (
    <>
      <div className="mb-10 flex h-[174px] items-end gap-2.5 px-2">
        <div className="relative flex h-[164px] flex-1 flex-col items-center rounded-xl bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#63559F] to-[#3D317F] to-[90%] pb-7 pt-2.5">
          <CrownSilverIcon className="mb-2 shrink-0" />
          <Skeleton className="h-[52px] w-[52px] rounded-full bg-white/30" />
          <Skeleton className="mb-1.5 mt-auto h-3 w-14 bg-white/30" />
          <Skeleton className="h-4 w-16 bg-white/30" />
          <div className="absolute bottom-0 left-1/2 flex h-[26px] w-[26px] -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-[#E7E2C6] to-[#DCD4A2] font-tt-hoves font-semibold text-[#060E14]">
            2
          </div>
        </div>
        <div className="relative flex h-[174px] w-32 flex-col items-center rounded-xl bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#7664C3] to-[#4E418E] to-[100%] pb-7 pt-2.5">
          <CrownGoldIcon className="mb-2 shrink-0" />
          <Skeleton className="h-16 w-16 rounded-full bg-white/30" />
          <Skeleton className="mb-1.5 mt-auto h-3 w-20 bg-white/30" />
          <Skeleton className="h-4 w-16 bg-white/30" />
          <div className="absolute bottom-0 left-1/2 flex h-9 w-9 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-[#FEE61A] to-[#F2C509] font-tt-hoves text-2xl font-semibold text-[#060E14]">
            1
          </div>
        </div>
        <div className="relative flex h-[164px] flex-1 flex-col items-center rounded-xl bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#63559F] to-[#3D317F] to-[90%] pb-7 pt-2.5">
          <CrownBronzeIcon className="mb-2 shrink-0" />
          <Skeleton className="h-[52px] w-[52px] rounded-full bg-white/30" />
          <Skeleton className="mb-1.5 mt-auto h-3 w-14 bg-white/30" />
          <Skeleton className="h-4 w-16 bg-white/30" />
          <div className="absolute bottom-0 left-1/2 flex h-[26px] w-[26px] -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-[#F79B16] to-[#FCD610] font-tt-hoves font-semibold text-[#060E14]">
            3
          </div>
        </div>
      </div>
      <div className="relative mx-3.5 mb-20 flex flex-col gap-2">
        <div className="flex h-[55px] items-center rounded-xl bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#4F467B] to-[#3D2F67] px-3.5">
          <Skeleton className="h-5 w-[19px]" />
          <Skeleton className="ml-2.5 h-6 w-6 rounded-full" />
          <Skeleton className="mx-2 h-5 w-12" />
          <Skeleton className="ml-auto h-5 w-16" />
        </div>
        <div className="flex h-[55px] items-center rounded-xl bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#4F467B] to-[#3D2F67] px-3.5">
          <Skeleton className="h-5 w-[19px]" />
          <Skeleton className="ml-2.5 h-6 w-6 rounded-full" />
          <Skeleton className="mx-2 h-5 w-14" />
          <Skeleton className="ml-auto h-5 w-16" />
        </div>
        <div className="flex h-[55px] items-center rounded-xl bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#4F467B] to-[#3D2F67] px-3.5">
          <Skeleton className="h-5 w-[19px]" />
          <Skeleton className="ml-2.5 h-6 w-6 rounded-full" />
          <Skeleton className="mx-2 h-5 w-10" />
          <Skeleton className="ml-auto h-5 w-14" />
        </div>
        <div className="flex h-[55px] items-center rounded-xl bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#4F467B] to-[#3D2F67] px-3.5">
          <Skeleton className="h-5 w-[19px]" />
          <Skeleton className="ml-2.5 h-6 w-6 rounded-full" />
          <Skeleton className="mx-2 h-5 w-16" />
          <Skeleton className="ml-auto h-5 w-14" />
        </div>
      </div>
    </>
  )
}
