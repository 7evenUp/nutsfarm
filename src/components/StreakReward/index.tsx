import { cn } from "@/lib/cn"

const StreakReward = ({
  rewardSrc,
  rewardName,
  className,
}: {
  rewardSrc: string
  rewardName: string
  className?: string
}) => {
  return (
    <div
      className={cn(
        "flex h-[77px] w-[158px] items-center justify-center rounded-[10px] bg-gradient-to-l from-[#20304F] via-[#384E6E] to-[#783B25] text-white phone-sm-fix:h-[84px] phone-sm-fix:w-[187px]",
        className,
      )}
    >
      <div className="flex h-[75px] w-[156px] items-center gap-2.5 rounded-[10px] bg-gradient-to-l from-[#17202D] via-[#192435] to-[#43211F] p-1.5 pr-2.5 phone-sm-fix:h-[82px] phone-sm-fix:w-[185px]">
        <img
          src={rewardSrc}
          alt={rewardName}
          className="aspect-square h-full w-auto rounded"
        />
        <p className="font-tt-hoves-expanded text-xs font-medium text-[#FCD72E] phone-sm-fix:text-sm">
          {rewardName}
        </p>
      </div>
    </div>
  )
}

export default StreakReward
