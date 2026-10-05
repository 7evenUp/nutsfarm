import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { Description } from "@radix-ui/react-dialog"

import Star from "@/assets/icons/leaderboard-donation.svg?react"

import DonationPodium from "@/assets/icons/donation-podium.svg?react"

import TopSkeleton from "../Leaderboard/TopSkeleton"
import LeaderItem from "../Leaderboard/components/LeaderItem"
import SilverLeader from "../Leaderboard/components/SilverLeader"
import BronzeLeader from "../Leaderboard/components/BronzeLeader"
import GoldLeader from "../Leaderboard/components/GoldLeader"

import UserAvatar from "@/components/UserAvatar"
import UserNickname from "@/components/UserNickname"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/shared/ui/SideSheet"
import { Skeleton } from "@/shared/ui/Skeleton"

import {
  useGetDonationLeaderboardInfiniteQuery,
  useGetDonationPositionQuery,
} from "@/redux/api/leaderboard"
import { useGetCurrentUserQuery } from "@/redux/api/user"
import { setOpenedProfileId } from "@/redux/slices/public-profile"
import { useAppDispatch } from "@/redux/hooks"

import { numberWithSpaces } from "@/utils/numberWithSpaces"
import { sendMetrika } from "@/utils/sendMetrika"

import { cn } from "@/lib/cn"

const DonateLeaderboard = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)

  const dispatch = useAppDispatch()

  const {
    data: leaderboardData,
    isFetchingNextPage,
    isLoading: isDonateLoading,
    fetchNextPage,
    hasNextPage,
  } = useGetDonationLeaderboardInfiniteQuery()
  const { data: currentUser } = useGetCurrentUserQuery()
  const { data: position, isLoading: isGetDonatePositionLoading } =
    useGetDonationPositionQuery()

  const donationLeaders = useMemo(() => {
    if (!leaderboardData) return undefined

    return leaderboardData.pages.flatMap((r) => r.items)
  }, [leaderboardData])

  if (isGetDonatePositionLoading || isDonateLoading) return <TopSkeleton />

  if (!donationLeaders || donationLeaders.length === 0 || !currentUser)
    return null

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        onClick={() => {
          sendMetrika("donate_leaderboard", {
            userBalance: currentUser.balance,
          })
        }}
      >
        {children}
      </SheetTrigger>
      <SheetContent className="h-[100dvh] gap-0 overflow-y-auto rounded-t-none px-0 pb-4 pt-6">
        <Description className="sr-only">
          Donation leaderboard modal
        </Description>

        <SheetHeader className="mb-6">
          <div className="flex w-full items-center justify-center gap-2.5">
            <DonationPodium />
            <span className="text-xl">{t("Доска почёта")}</span>
          </div>
        </SheetHeader>

        {isDonateLoading ? (
          <TopSkeleton />
        ) : (
          <>
            <div className="mb-10 flex h-[174px] items-end gap-2.5 px-2">
              {donationLeaders.length > 1 && (
                <SilverLeader {...donationLeaders[1]}>
                  <div className="flex items-center gap-1 truncate text-sm font-extrabold text-[#E2DCB6]">
                    {numberWithSpaces(donationLeaders[1].donationCount, true)}
                    <Star className="max-phone-sm:hidden h-3.5 w-3.5" />
                  </div>
                </SilverLeader>
              )}
              {donationLeaders.length > 0 && (
                <GoldLeader {...donationLeaders[0]}>
                  <div className="flex items-center gap-1 truncate text-sm font-extrabold text-[#F8D712]">
                    {numberWithSpaces(donationLeaders[0].donationCount, true)}
                    <Star className="max-phone-sm:hidden h-3.5 w-3.5" />
                  </div>
                </GoldLeader>
              )}
              {donationLeaders.length > 2 && (
                <BronzeLeader {...donationLeaders[2]}>
                  <div className="flex items-center gap-1 truncate text-sm font-extrabold text-[#FEA313]">
                    {numberWithSpaces(donationLeaders[2].donationCount, true)}
                    <Star className="max-phone-sm:hidden h-3.5 w-3.5" />
                  </div>
                </BronzeLeader>
              )}
            </div>

            {donationLeaders.length > 3 && (
              <div className="relative mx-3.5 mb-20 flex flex-col gap-2">
                <div className="fixed inset-x-0 bottom-0 h-28 bg-gradient-to-b from-[#050D12]/0 to-[#050D12]" />

                {donationLeaders.slice(3).map((leader, i) => (
                  <LeaderItem
                    key={i}
                    index={i}
                    {...leader}
                    hasToFetchNew={i === donationLeaders.length - 5}
                    fetchNextPage={fetchNextPage}
                    hasNextPage={hasNextPage}
                  >
                    <span className="text-[#FBDE16]/75">
                      {numberWithSpaces(leader.donationCount, true)}
                    </span>
                    <Star className="h-3.5 w-3.5 opacity-50" />
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
                  <div className="ml-auto flex items-center gap-1">
                    <span className="text-sm font-medium text-[#FBDE16]/75">
                      {numberWithSpaces(position.donationCount)}
                    </span>
                    <Star className="h-3.5 w-3.5 opacity-50" />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default DonateLeaderboard
