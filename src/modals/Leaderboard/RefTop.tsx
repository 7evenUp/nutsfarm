import { useState } from "react"
import { useTranslation } from "react-i18next"

import UserIcon from "@/assets/icons/user.svg?react"
import LoaderIcon from "@/assets/icons/loader.svg?react"
import Refs from "@/assets/icons/group.svg?react"

import CrownSilverIcon from "@/assets/icons/crown-silver.svg?react"
import CrownGoldIcon from "@/assets/icons/crown-gold.svg?react"
import CrownBronzeIcon from "@/assets/icons/crown-bronze.svg?react"

import TopSkeleton from "./TopSkeleton"

import UserAvatar from "@/components/UserAvatar"
import UserNickname from "@/components/UserNickname"

import {
  useGetRefLeaderboardQuery,
  useGetRefsPositionQuery,
} from "@/redux/api/leaderboard"
import { useGetCurrentUserQuery, useGetReferralsQuery } from "@/redux/api/user"

import { numberWithSpaces } from "@/utils/numberWithSpaces"

import { cn } from "@/lib/cn"

const DEFAULT_PAGINATION_SIZE = 100

const RefTop = () => {
  const { t } = useTranslation()

  const [page, setPage] = useState(1)

  const { data: position, isLoading: isRefPositionLoading } =
    useGetRefsPositionQuery()
  const {
    data,
    isFetching,
    isLoading: isRefsLoading,
  } = useGetRefLeaderboardQuery({
    page,
    size: DEFAULT_PAGINATION_SIZE,
  })
  const { data: currentUser } = useGetCurrentUserQuery()
  const { data: referralInfo, isLoading: isReferralsLoading } =
    useGetReferralsQuery({ page: 1, size: 15 })

  if (isRefPositionLoading || isRefsLoading || isReferralsLoading)
    return <TopSkeleton />

  if (!data || data.total === 0 || !currentUser) return null

  const { items: refLeaders } = data

  return (
    <>
      {position && referralInfo && (
        <div className="mb-6 px-4">
          <div className="flex h-[50px] w-full items-center gap-2 rounded-xl bg-[#1C2430] px-3.5">
            <UserAvatar className="h-6 w-6" />
            <UserNickname className="text-sm font-medium" />
            <span className="text-sm font-medium text-white/50">
              {position.toString().includes("+")
                ? numberWithSpaces(position)
                : "#" + numberWithSpaces(position)}
            </span>
            <div className="ml-auto flex items-center gap-1">
              <span className="text-sm font-medium">
                {numberWithSpaces(referralInfo.total)}
              </span>
              <Refs className="h-3.5 w-3.5 text-white/50" />
            </div>
          </div>
        </div>
      )}
      <div className="mb-10 flex h-[174px] items-end gap-2.5 px-2">
        {refLeaders.length > 1 && (
          <div className="relative flex h-[164px] w-[90px] flex-col items-center rounded-xl bg-[#0F1824] pb-7 pt-2.5 phone-xsm:w-[100px] phone-sm:w-[110px] phone-sm-fix:w-[115px]">
            <CrownSilverIcon className="mb-2 shrink-0" />
            {refLeaders[1].telegramPicture ? (
              <img
                src={refLeaders[1].telegramPicture}
                alt="User's avatar"
                className="h-[52px] w-[52px] rounded-full bg-white/10 object-cover"
              />
            ) : refLeaders[1].firstname ? (
              <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white/10 text-xl font-extrabold">
                {refLeaders[1].firstname[0].toUpperCase()}
              </div>
            ) : (
              <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white/10">
                <UserIcon className="h-6 w-6" />
              </div>
            )}
            <span className="mb-0.5 mt-auto w-full truncate px-2 text-center text-xs font-medium">
              {refLeaders[1].firstname}
            </span>
            <div className="flex items-center gap-1 truncate text-sm font-extrabold text-[#E2DCB6]">
              {numberWithSpaces(refLeaders[1].referralCount)}
              <Refs className="max-phone-sm:hidden h-3.5 w-3.5" />
            </div>
            <div className="absolute bottom-0 left-1/2 flex h-[26px] w-[26px] -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-[#E7E2C6] to-[#DCD4A2] font-tt-hoves font-semibold text-[#060E14]">
              2
            </div>
          </div>
        )}
        {refLeaders.length > 0 && (
          <div className="relative flex h-[174px] flex-1 flex-col items-center rounded-xl bg-[#1C2430] pb-7 pt-2.5">
            <CrownGoldIcon className="mb-2 shrink-0" />
            {refLeaders[0].telegramPicture ? (
              <img
                src={refLeaders[0].telegramPicture}
                alt="User's avatar"
                className="h-16 w-16 rounded-full bg-white/10 object-cover"
              />
            ) : refLeaders[0].firstname ? (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-2xl font-extrabold">
                {refLeaders[0].firstname[0].toUpperCase()}
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                <UserIcon className="h-7 w-7" />
              </div>
            )}
            <span className="mb-0.5 mt-auto max-w-[90px] truncate text-center text-xs font-medium phone-sm:max-w-[100px] phone-sm-fix:max-w-[110px] phone:max-w-[120px] phone-lg:max-w-[130px] phone-xl:max-w-[170px]">
              {refLeaders[0].firstname}
            </span>
            <div className="flex items-center gap-1 truncate text-sm font-extrabold text-[#F8D712]">
              {numberWithSpaces(refLeaders[0].referralCount)}
              <Refs className="max-phone-sm:hidden h-3.5 w-3.5" />
            </div>
            <div className="absolute bottom-0 left-1/2 flex h-9 w-9 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-[#FEE61A] to-[#F2C509] font-tt-hoves text-2xl font-semibold text-[#060E14]">
              1
            </div>
          </div>
        )}
        {refLeaders.length > 2 && (
          <div className="relative flex h-[164px] w-[90px] flex-col items-center rounded-xl bg-[#0F1824] pb-7 pt-2.5 phone-xsm:w-[100px] phone-sm:w-[110px] phone-sm-fix:w-[115px]">
            <CrownBronzeIcon className="mb-2 shrink-0" />
            {refLeaders[2].telegramPicture ? (
              <img
                src={refLeaders[2].telegramPicture}
                alt="User's avatar"
                className="h-[52px] w-[52px] rounded-full bg-white/10 object-cover"
              />
            ) : refLeaders[2].firstname ? (
              <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white/10 text-xl font-extrabold">
                {refLeaders[2].firstname[0].toUpperCase()}
              </div>
            ) : (
              <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white/10">
                <UserIcon className="h-6 w-6" />
              </div>
            )}
            <span className="mb-0.5 mt-auto w-full truncate px-2 text-center text-xs font-medium">
              {refLeaders[2].firstname}
            </span>
            <div className="flex items-center gap-1 truncate text-sm font-extrabold text-[#FEA313]">
              {numberWithSpaces(refLeaders[2].referralCount)}
              <Refs className="max-phone-sm:hidden h-3.5 w-3.5" />
            </div>
            <div className="absolute bottom-0 left-1/2 flex h-[26px] w-[26px] -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-[#F79B16] to-[#FCD610] font-tt-hoves font-semibold text-[#060E14]">
              3
            </div>
          </div>
        )}
      </div>
      {refLeaders.length > 3 && (
        <div
          className={cn(
            "mx-4 flex flex-col gap-6 rounded-[18px] bg-[#0F1824] px-4 py-[18px]",
            DEFAULT_PAGINATION_SIZE * page < data.total ? "mb-2" : "mb-10",
          )}
        >
          {refLeaders.slice(3).map((leader, i) => (
            <div key={i} className="flex h-6 shrink-0 items-center">
              <span
                className={cn(
                  "w-[19px] shrink-0 text-center text-sm font-medium text-white/50",
                  i + 4 >= 100 && "w-6",
                  i + 4 >= 1000 && "w-8",
                )}
              >
                {i + 4}
              </span>
              {leader.telegramPicture ? (
                <img
                  src={leader.telegramPicture}
                  alt="User's avatar"
                  loading="lazy"
                  className="ml-2.5 h-6 w-6 shrink-0 rounded-full bg-white/10 object-cover"
                />
              ) : leader.firstname ? (
                <div className="ml-2.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-medium">
                  {leader.firstname[0].toUpperCase()}
                </div>
              ) : (
                <div className="ml-2.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <UserIcon className="h-4 w-4" />
                </div>
              )}
              <span className="mx-2 truncate text-sm font-medium">
                {leader.firstname ? leader.firstname : "-"}
              </span>
              <div className="ml-auto flex shrink-0 items-center gap-1 text-sm font-medium">
                {numberWithSpaces(leader.referralCount, true)}
                <Refs className="h-3.5 w-3.5" />
              </div>
            </div>
          ))}
        </div>
      )}
      {DEFAULT_PAGINATION_SIZE * page < data.total && (
        <button
          className="mx-2 mb-10 flex h-12 items-center justify-center gap-4 rounded-[14px] bg-[#17202D] font-tt-hoves-expanded text-sm font-semibold text-white transition-colors active:bg-[#202936]"
          onClick={() => {
            if (isFetching) return
            setPage((prev) => prev + 1)
          }}
        >
          {isFetching && <LoaderIcon className="h-5 w-5 animate-spin" />}
          {t("Загрузить ещё")}
        </button>
      )}
    </>
  )
}

export default RefTop
