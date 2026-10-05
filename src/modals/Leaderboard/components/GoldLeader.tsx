import CrownGoldIcon from "@/assets/icons/crown-gold.svg?react"
import UserIcon from "@/assets/icons/user.svg?react"
import { useAppDispatch } from "@/redux/hooks"
import { setOpenedProfileId } from "@/redux/slices/public-profile"

import { LeaderboardUser } from "@/types/leaderboard"

const GoldLeader = ({
  children,
  id,
  telegramPicture,
  firstname,
}: LeaderboardUser & { children: React.ReactNode }) => {
  const dispatch = useAppDispatch()
  return (
    <div
      className="relative flex h-[174px] flex-1 flex-col items-center rounded-xl bg-[#1C2430] pb-7 pt-2.5"
      onClick={() => dispatch(setOpenedProfileId(id))}
    >
      <CrownGoldIcon className="mb-2 shrink-0" />
      {telegramPicture ? (
        <img
          src={telegramPicture}
          alt="User's avatar"
          className="h-16 w-16 rounded-full bg-white/10 object-cover"
        />
      ) : firstname ? (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-2xl font-extrabold">
          {firstname[0].toUpperCase()}
        </div>
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
          <UserIcon className="h-7 w-7" />
        </div>
      )}
      <span className="mb-0.5 mt-auto max-w-[90px] truncate text-center text-xs font-medium phone-sm:max-w-[100px] phone-sm-fix:max-w-[110px] phone:max-w-[120px] phone-lg:max-w-[130px] phone-xl:max-w-[170px]">
        {firstname}
      </span>

      {children}

      <div className="absolute bottom-0 left-1/2 flex h-9 w-9 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-[#FEE61A] to-[#F2C509] font-tt-hoves text-2xl font-semibold text-[#060E14]">
        1
      </div>
    </div>
  )
}

export default GoldLeader
