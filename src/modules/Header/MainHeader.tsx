import FireImage from "@/assets/images/fire.png"
import LeaderboardStarIcon from "@/assets/icons/leaderboard-star.svg?react"
import ParachuteIcon from "@/assets/icons/parachute.svg?react"

import UserAvatar from "@/components/UserAvatar"
import UserNickname from "@/components/UserNickname"

import LeaderboardDialog from "@/modals/Leaderboard"
import ProfileDialog from "@/modals/Profile"
import CurrentStreakDialog from "@/modals/CurrentStreak"
import RetrodropNew from "@/modals/RetrodropNew"

import { useGetCurrentStreakQuery } from "@/redux/api/streak"
import { useGetCurrentUserQuery } from "@/redux/api/user"
import { useGetDropInfoQuery } from "@/redux/api/farming"

import { cn } from "@/lib/cn"

const MainHeader = () => {
  const { data: currentUser } = useGetCurrentUserQuery()
  const { data: streak } = useGetCurrentStreakQuery({
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  })
  const { data, isSuccess } = useGetDropInfoQuery()

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 flex items-center bg-background",
        Telegram.WebApp.platform === "tdesktop" ||
          Telegram.WebApp.platform === "macos"
          ? "h-16 px-3.5"
          : "h-14 px-4 phone-xsm:h-[62px] phone-sm:h-[68px]",
      )}
    >
      <ProfileDialog>
        <div className="relative">
          <UserAvatar className="h-9 w-9 phone-sm:h-[42px] phone-sm:w-[42px]" />
          {currentUser &&
            (currentUser.isInventoryNotificationReceived === false ||
              currentUser.isNewAchievementReceived === true) && (
              <div className="absolute -bottom-0.5 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-background">
                <div className="h-2 w-2 rounded-full bg-cyan" />
              </div>
            )}
        </div>
        <UserNickname />
      </ProfileDialog>

      {streak && (
        <div className="ml-auto flex gap-1.5">
          {isSuccess && !data.claimed && (
            <RetrodropNew>
              <button className="animate-shake-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#4A4078] to-[#2F2852]/50 phone-sm:h-9 phone-sm:w-9">
                <ParachuteIcon className="text-white" />
              </button>
            </RetrodropNew>
          )}
          <CurrentStreakDialog className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F1824] phone-sm:h-9 phone-sm:w-9">
            <img
              src={FireImage}
              className="h-5 w-5 phone-sm:h-6 phone-sm:w-6"
              alt="Fire icon"
            />
            <div
              className={cn(
                "absolute bottom-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#0F1824] pt-0.5 text-[10px] font-bold text-white",
                streak.todayStreakInfo.dayNumber > 10 && "pl-px text-[9px]",
                streak.todayStreakInfo.dayNumber > 100 &&
                  "pl-0.5 text-[8px] font-normal tracking-tighter",
              )}
            >
              {streak.todayStreakInfo.dayNumber}
            </div>
          </CurrentStreakDialog>

          <LeaderboardDialog className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F1824] phone-sm:h-9 phone-sm:w-9">
            <LeaderboardStarIcon className="h-5 w-5 phone-sm:h-6 phone-sm:w-6" />
          </LeaderboardDialog>
        </div>
      )}
    </header>
  )
}

export default MainHeader
