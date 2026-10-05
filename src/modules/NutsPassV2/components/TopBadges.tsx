import React from "react"

import BadgeFree from "@/assets/passV2/icons/badge-free.svg?react"
import BadgePremium from "@/assets/passV2/icons/badge-premium.svg?react"

import { useGetCurrentUserQuery } from "@/redux/api/user"

import { cn } from "@/lib/cn"

const TopBadges = React.memo(() => {
  const { data: currentUser } = useGetCurrentUserQuery()

  if (!currentUser) return null

  return (
    <div
      className={cn(
        "sticky z-50 flex",
        currentUser.isNutPassActive
          ? "top-[176px] phone-sm-fix:top-[180px]"
          : "top-[192px] phone-xsm:top-[200px] phone-sm-fix:top-[204px]",
      )}
    >
      <div className="relative flex h-[60px] flex-1 items-center justify-center bg-gradient-to-r from-[#3B3170] to-[#6A5CB7] phone-sm-fix:h-[71px]">
        <BadgeFree className="relative z-10 h-[41px] w-[116px]" />
        <p className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 font-tt-hoves text-sm font-semibold text-[#463F6A]">
          FREE
        </p>
        <div className="absolute inset-0 bg-gradient-to-b from-[#211723] to-[#423745]/0 opacity-40" />
      </div>
      <div className="relative flex h-[60px] flex-1 items-center justify-center bg-gradient-to-r from-[#9743A8] to-[#5F136F] phone-sm-fix:h-[71px]">
        <BadgePremium className="relative z-10 h-[41px] w-[116px]" />
        <p className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 font-tt-hoves text-sm font-semibold text-[#AE7C03]">
          PREMIUM
        </p>
        <div className="absolute inset-0 bg-gradient-to-b from-[#211723] to-[#423745]/0 opacity-40" />
      </div>

      {/* Золотая полоска по середине */}
      <div className="absolute inset-y-0 left-1/2 w-2 -translate-x-1/2 bg-gradient-to-r from-[#FEE422] to-[#FA9B39]" />

      {/* Полоска-тень */}
      <div className="absolute bottom-0 h-px w-full bg-[#E9E4F2]/20" />
      <div className="absolute bottom-[0.5px] h-0.5 w-full bg-[#130C21]/40" />
    </div>
  )
})

export default TopBadges
