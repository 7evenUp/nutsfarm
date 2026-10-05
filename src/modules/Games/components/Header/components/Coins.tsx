import CoinIcon from "@/assets/icons/coin.svg?react"

import { useGetCurrentUserQuery } from "@/redux/api/user"

import { numberWithSpaces } from "@/utils/numberWithSpaces"

import { GameTheme } from "@/types/games"

import { cn } from "@/lib/cn"

export default function Coins({ theme }: { theme: GameTheme }) {
  const { data: currentUser } = useGetCurrentUserQuery()

  if (!currentUser) return

  return (
    <div className="flex h-[30px] items-center">
      <div
        className={cn(
          "relative z-10 flex h-[30px] w-[30px] items-center justify-center rounded-lg border bg-gradient-to-b",
          theme === "default" && "border-[#010036] from-[#695AB8] to-[#393164]",
          theme === "flip-cards" &&
            "border-[#010036] from-[#6254AC] to-[#372E62]",
          theme === "puzzles" &&
            "border-[#094541]/60 from-[#0D5B56] to-[#15857F]",
          theme === "cryptle" && "border-[#3A2485] from-[#7F60E5] to-[#5B41B4]",
        )}
      >
        <CoinIcon className="h-[18px] w-[18px]" />
      </div>
      <div
        className={cn(
          "flex h-[22px] -translate-x-0.5 items-center justify-center truncate rounded-r-md px-2.5 text-xs font-bold text-white phone-xsm:text-sm",
          theme === "default" && "bg-[#2F2852]",
          theme === "flip-cards" &&
            "bg-gradient-to-r from-[#332B58] to-[#443B71]",
          theme === "puzzles" && "bg-gradient-to-r from-[#094541] to-[#0F6963]",
          theme === "cryptle" && "bg-gradient-to-r from-[#3A2585] to-[#402C89]",
        )}
      >
        {numberWithSpaces(
          currentUser.balance +
            (currentUser.balance * currentUser.balanceBonusPercentage) / 100,
        )}
      </div>
    </div>
  )
}
