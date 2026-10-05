import { useMemo } from "react"

import TopSkeleton from "./TopSkeleton"

import LeaderItem from "./components/LeaderItem"
import SilverLeader from "./components/SilverLeader"
import GoldLeader from "./components/GoldLeader"
import BronzeLeader from "./components/BronzeLeader"

import { Skeleton } from "@/shared/ui/Skeleton"

import UserAvatar from "@/components/UserAvatar"
import UserNickname from "@/components/UserNickname"

import {
  useGetXpLeaderboardWithoutDonationInfiniteQuery,
  useGetXpPositionWithoutDonationQuery,
} from "@/redux/api/leaderboard"
import { useGetCurrentUserQuery } from "@/redux/api/user"
import { setOpenedProfileId } from "@/redux/slices/public-profile"
import { useAppDispatch } from "@/redux/hooks"

import { numberWithSpaces } from "@/utils/numberWithSpaces"

import { cn } from "@/lib/cn"

const XpTop = () => {
  const dispatch = useAppDispatch()

  const { data: position, isLoading: isXpPositionLoading } =
    useGetXpPositionWithoutDonationQuery()
  const {
    data: leaderboardData,
    isFetchingNextPage,
    isLoading: isXpLoading,
    fetchNextPage,
    hasNextPage,
  } = useGetXpLeaderboardWithoutDonationInfiniteQuery()
  const { data: currentUser } = useGetCurrentUserQuery()

  const xpLeaders = useMemo(() => {
    if (!leaderboardData) return undefined

    return leaderboardData.pages.flatMap((r) => r.items)
  }, [leaderboardData])

  if (isXpPositionLoading || isXpLoading) return <TopSkeleton />

  if (!xpLeaders || xpLeaders.length === 0 || !currentUser) return null

  return (
    <>
      <div className="mb-10 flex h-[174px] items-end gap-2.5 px-2">
        {xpLeaders.length > 1 && (
          <SilverLeader {...xpLeaders[1]}>
            <div className="flex items-center gap-1 truncate text-sm font-extrabold text-[#E2DCB6]">
              {numberWithSpaces(xpLeaders[1].nutPassXpBalance)}
              <span>XP</span>
            </div>
          </SilverLeader>
        )}
        {xpLeaders.length > 0 && (
          <GoldLeader {...xpLeaders[0]}>
            <div className="flex items-center gap-1 truncate text-sm font-extrabold text-[#F8D712]">
              {numberWithSpaces(xpLeaders[0].nutPassXpBalance)}
              <span>XP</span>
            </div>
          </GoldLeader>
        )}
        {xpLeaders.length > 2 && (
          <BronzeLeader {...xpLeaders[2]}>
            <div className="flex items-center gap-1 truncate text-sm font-extrabold text-[#FEA313]">
              {numberWithSpaces(xpLeaders[2].nutPassXpBalance)}
              <span>XP</span>
            </div>
          </BronzeLeader>
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
              fetchNextPage={fetchNextPage}
              hasNextPage={hasNextPage}
            >
              <span className="text-white/75">
                {numberWithSpaces(leader.nutPassXpBalance, true)}
              </span>{" "}
              <span className="text-white/50">XP</span>
            </LeaderItem>
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
          <div className="flex h-[55px] w-full items-center gap-2 rounded-xl bg-[#2C3D56] px-3.5">
            <UserAvatar className="h-6 w-6" />
            <UserNickname className="text-sm font-medium" />
            <span className="text-sm font-medium text-white/50">
              {position.toString().includes("+")
                ? numberWithSpaces(position.place)
                : "#" + numberWithSpaces(position.place)}
            </span>
            <div className="ml-auto text-sm font-medium text-white">
              <span className="text-white/75">
                {numberWithSpaces(position.donationCount)}
              </span>{" "}
              <span className="text-white/50">XP</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default XpTop
