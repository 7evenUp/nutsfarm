import CrownBronzeIcon from "@/assets/icons/crown-bronze.svg?react"
import UserIcon from "@/assets/icons/user.svg?react"
import { useAppDispatch } from "@/redux/hooks"
import { setOpenedProfileId } from "@/redux/slices/public-profile"

import { LeaderboardUser } from "@/types/leaderboard"

const BronzeLeader = ({
  children,
  id,
  telegramPicture,
  firstname,
}: LeaderboardUser & { children: React.ReactNode }) => {
  const dispatch = useAppDispatch()
  return (
    <div
      className="relative flex h-[164px] w-[90px] flex-col items-center rounded-xl bg-[#0F1824] pb-7 pt-2.5 phone-xsm:w-[100px] phone-sm:w-[110px] phone-sm-fix:w-[115px]"
      onClick={() => dispatch(setOpenedProfileId(id))}
    >
      <CrownBronzeIcon className="mb-2 shrink-0" />
      {telegramPicture ? (
        <img
          src={telegramPicture}
          alt="User's avatar"
          className="h-[52px] w-[52px] rounded-full bg-white/10 object-cover"
        />
      ) : firstname ? (
        <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white/10 text-xl font-extrabold">
          {firstname[0].toUpperCase()}
        </div>
      ) : (
        <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white/10">
          <UserIcon className="h-6 w-6" />
        </div>
      )}
      <span className="mb-0.5 mt-auto w-full truncate px-2 text-center text-xs font-medium">
        {firstname}
      </span>

      {children}

      <div className="absolute bottom-0 left-1/2 flex h-[26px] w-[26px] -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-[#F79B16] to-[#FCD610] font-tt-hoves font-semibold text-[#060E14]">
        3
      </div>
    </div>
  )
}

export default BronzeLeader
