import LeaderboardStarIcon from "@/assets/icons/leaderboard-star.svg?react"

import HealthIconComponent from "./Healths/HeaderIcon"

import UserAvatar from "@/components/UserAvatar"
import UserNickname from "@/components/UserNickname"

import LeaderboardDialog from "@/modals/Leaderboard"
import ProfileDialog from "@/modals/Profile"

import { useAppSelector } from "@/redux/hooks"

import { useGetCurrentUserQuery } from "@/redux/api/user"

import { cn } from "@/lib/cn"
import { useGetActiveModulesQuery } from "@/redux/api/learn"
import { useMemo } from "react"

const LearnHeader = () => {
  const healthPoints = useAppSelector((state) => state.health.healthPoints)

  const selectedModuleId = useAppSelector(
    (state) => state.selectedModule.selectedModuleId,
  )
  const lang = useAppSelector((state) => state.language.value)
  const countryCode = useAppSelector((state) => state.countryCode.value)

  const { data: modules } = useGetActiveModulesQuery({
    lang,
    region: countryCode,
  })

  const selectedModule = useMemo(() => {
    if (!modules) return null

    if (!selectedModuleId) return null

    return modules.find((module) => module.id === selectedModuleId)
  }, [modules, selectedModuleId])

  const { data: currentUser } = useGetCurrentUserQuery()

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 flex items-center",
        Telegram.WebApp.platform === "tdesktop" ||
          Telegram.WebApp.platform === "macos"
          ? "h-16 px-3.5"
          : "h-14 px-4 phone-xsm:h-[62px] phone-sm:h-[68px]",
        selectedModule &&
          selectedModule.isPurchased !== undefined &&
          selectedModule.isPurchased !== null
          ? "bg-transparent"
          : "bg-background",
      )}
    >
      <ProfileDialog>
        <div className="relative">
          <UserAvatar className="h-9 w-9 phone-sm:h-[42px] phone-sm:w-[42px]" />
          {currentUser &&
            (currentUser.isInventoryNotificationReceived === false ||
              currentUser.isNewAchievementReceived === true) && (
              <div
                className={cn(
                  "absolute -bottom-0.5 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full",
                  selectedModule &&
                    selectedModule.isPurchased !== undefined &&
                    selectedModule.isPurchased !== null
                    ? "bg-[#435192]"
                    : "bg-background",
                )}
              >
                <div className="h-2 w-2 rounded-full bg-cyan" />
              </div>
            )}
        </div>
        <UserNickname />
      </ProfileDialog>

      <div className="ml-auto flex gap-1.5">
        {healthPoints != null && (
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg phone-sm:h-9 phone-sm:w-9">
            <HealthIconComponent
              maxHealth={5}
              currentHealth={healthPoints}
              classname={"h-5 w-5 phone-sm:h-6 phone-sm:w-6"}
            />
            <div
              className={cn(
                "absolute bottom-1 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full pt-0.5 text-[10px] font-bold text-white",
                healthPoints > 10 && "pl-px text-[9px]",
                healthPoints > 100 &&
                  "pl-0.5 text-[8px] font-normal tracking-tighter",
                selectedModule &&
                  selectedModule.isPurchased !== undefined &&
                  selectedModule.isPurchased !== null
                  ? "bg-[#435192]"
                  : "bg-background",
              )}
            >
              {healthPoints}
            </div>
          </div>
        )}

        <LeaderboardDialog className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F1824] phone-sm:h-9 phone-sm:w-9">
          <LeaderboardStarIcon className="h-5 w-5 phone-sm:h-6 phone-sm:w-6" />
        </LeaderboardDialog>
      </div>
    </header>
  )
}

export default LearnHeader
