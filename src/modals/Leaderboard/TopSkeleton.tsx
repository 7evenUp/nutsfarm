import CrownSilverIcon from "@/assets/icons/crown-silver.svg?react"
import CrownGoldIcon from "@/assets/icons/crown-gold.svg?react"
import CrownBronzeIcon from "@/assets/icons/crown-bronze.svg?react"

import { Skeleton } from "@/shared/ui/Skeleton"

const TopSkeleton = () => {
  return (
    <>
      <div className="mb-10 flex h-[174px] items-end gap-2.5 px-2">
        <div className="relative flex h-[164px] flex-1 flex-col items-center rounded-xl bg-[#0F1824] pb-7 pt-2.5">
          <CrownSilverIcon className="mb-2 shrink-0" />
          <Skeleton className="h-[52px] w-[52px] rounded-full bg-white/30" />
          <Skeleton className="mb-1.5 mt-auto h-3 w-14 bg-white/30" />
          <Skeleton className="h-4 w-16 bg-white/30" />
          <div className="absolute bottom-0 left-1/2 flex h-[26px] w-[26px] -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-[#E7E2C6] to-[#DCD4A2] font-tt-hoves font-semibold text-[#060E14]">
            2
          </div>
        </div>
        <div className="relative flex h-[174px] w-32 flex-col items-center rounded-xl bg-[#1C2430] pb-7 pt-2.5">
          <CrownGoldIcon className="mb-2 shrink-0" />
          <Skeleton className="h-16 w-16 rounded-full bg-white/30" />
          <Skeleton className="mb-1.5 mt-auto h-3 w-20 bg-white/30" />
          <Skeleton className="h-4 w-16 bg-white/30" />
          <div className="absolute bottom-0 left-1/2 flex h-9 w-9 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-[#FEE61A] to-[#F2C509] font-tt-hoves text-2xl font-semibold text-[#060E14]">
            1
          </div>
        </div>
        <div className="relative flex h-[164px] flex-1 flex-col items-center rounded-xl bg-[#0F1824] pb-7 pt-2.5">
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
        <div className="flex h-[55px] items-center rounded-xl bg-[#0F1824] px-3.5">
          <Skeleton className="h-5 w-[19px]" />
          <Skeleton className="ml-2.5 h-6 w-6 rounded-full" />
          <Skeleton className="mx-2 h-5 w-12" />
          <Skeleton className="ml-auto h-5 w-16" />
        </div>
        <div className="flex h-[55px] items-center rounded-xl bg-[#0F1824] px-3.5">
          <Skeleton className="h-5 w-[19px]" />
          <Skeleton className="ml-2.5 h-6 w-6 rounded-full" />
          <Skeleton className="mx-2 h-5 w-14" />
          <Skeleton className="ml-auto h-5 w-16" />
        </div>
        <div className="flex h-[55px] items-center rounded-xl bg-[#0F1824] px-3.5">
          <Skeleton className="h-5 w-[19px]" />
          <Skeleton className="ml-2.5 h-6 w-6 rounded-full" />
          <Skeleton className="mx-2 h-5 w-10" />
          <Skeleton className="ml-auto h-5 w-14" />
        </div>
        <div className="flex h-[55px] items-center rounded-xl bg-[#0F1824] px-3.5">
          <Skeleton className="h-5 w-[19px]" />
          <Skeleton className="ml-2.5 h-6 w-6 rounded-full" />
          <Skeleton className="mx-2 h-5 w-16" />
          <Skeleton className="ml-auto h-5 w-14" />
        </div>
      </div>
    </>
  )
}

export default TopSkeleton
