import TokensRewardPNG from "@/assets/passV2/icons/rewards/tokens-reward.png"
import BoxFreeClosed from "@/assets/passV2/icons/rewards/box_free_closed.svg?react"
import BoxFreeOpened from "@/assets/passV2/icons/rewards/box_free_opened.svg?react"
import EnergyReward from "@/assets/passV2/icons/rewards/energy-reward.svg?react"
import AssembleBackground from "@/assets/passV2/icons/rewards/assemble-background-free.svg?react"
import AssembleTicket from "@/assets/passV2/icons/rewards/assemble-ticket.svg?react"
import AssembleFarmDuration from "@/assets/passV2/icons/rewards/assemble-farm-duration-free.svg?react"
import AssembleCoinsOncePNG from "@/assets/passV2/icons/rewards/assemble-coins-once-free.png"
import AssemblePerSecond from "@/assets/passV2/icons/rewards/assemble-per-second-free.svg?react"
import AssembleNftPNG from "@/assets/passV2/icons/rewards/assemble-nft-free.png"
import BoosterXp from "@/assets/passV2/icons/rewards/booster-xp-free.svg?react"
import BoosterFarmDuration from "@/assets/passV2/icons/rewards/booster-farm-duration-free.svg?react"
import BoosterPerSecond from "@/assets/passV2/icons/rewards/booster-per-second-free.svg?react"

import { numberWithSpaces } from "@/utils/numberWithSpaces"

import { Reward } from "@/types/nutspass"
import { AssemblePart } from "@/types/assembled-parts"
import { Booster } from "@/types/item"

import { cn } from "@/lib/cn"

const FreeReward = ({
  type,
  amount,
  assemblePart,
  boost,
  isClaimed,
}: Reward & {
  isClaimed: boolean
}) => {
  if (type === "TOKENS")
    return (
      <>
        <img
          src={TokensRewardPNG}
          className="absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2"
        />
        <span
          className={cn(
            "absolute bottom-2 text-lg/[25px] font-extrabold drop-shadow-[0px_1px_1px_rgba(0,0,0,0.4)] [text-shadow:0.6px_0.6px_0.1px_#5B42AE,-0.6px_0.6px_0.1px_#5B42AE,0.6px_-0.6px_0.1px_#5B42AE,-0.6px_-0.6px_0.1px_#5B42AE]",
            amount > 99999 ? "right-2" : "left-1/2 -translate-x-[10%]",
          )}
        >
          {numberWithSpaces(amount)}
        </span>
      </>
    )

  if (type === "BOX") {
    if (isClaimed) {
      return (
        <BoxFreeOpened className="absolute left-1/2 top-1/2 h-auto w-[66px] -translate-x-1/2 -translate-y-1/2" />
      )
    } else {
      return (
        <BoxFreeClosed className="absolute left-1/2 top-1/2 h-auto w-[66px] -translate-x-1/2 -translate-y-1/2" />
      )
    }
  }

  if (type === "NFT")
    return (
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg/[25px] font-extrabold drop-shadow-[0px_1px_1px_rgba(0,0,0,0.4)] [text-shadow:0.6px_0.6px_0.1px_#5B42AE,-0.6px_0.6px_0.1px_#5B42AE,0.6px_-0.6px_0.1px_#5B42AE,-0.6px_-0.6px_0.1px_#5B42AE]">
        NFT
      </span>
    )

  if (type === "BOOSTER") return <BoosterReward {...boost} amount={amount} />

  if (type === "ASSEMBLE_PART")
    return <AssembleReward {...assemblePart} amount={amount} />

  if (type === "ENERGY")
    return (
      <>
        <EnergyReward className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[#5B42AE] drop-shadow-[0px_1px_2px_rgba(0,0,0,0.25)]" />
        <span className="absolute bottom-2 left-1/2 translate-x-3.5 text-lg/[25px] font-extrabold drop-shadow-[0px_1px_1px_rgba(0,0,0,0.4)] [text-shadow:0.6px_0.6px_0.1px_#2D1A53,-0.6px_0.6px_0.1px_#2D1A53,0.6px_-0.6px_0.1px_#2D1A53,-0.6px_-0.6px_0.1px_#2D1A53]">
          x{amount}
        </span>
      </>
    )
}

export default FreeReward

const AssembleReward = ({
  boost,
  type,
  amount,
  nft,
}: AssemblePart & { amount: number }) => {
  return (
    <>
      <AssembleBackground className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]" />
      {type === "BOOSTER" && boost && (
        <>
          {boost.bonusType === "XP_BONUS" && (
            <AssembleTicket className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
          )}
          {boost.bonusType === "FARMING_DURATION" && (
            <AssembleFarmDuration className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0px_1px_2px_rgba(0,0,0,0.25)]" />
          )}
          {boost.bonusType === "POINTS_ONCE_BONUS" && (
            <img
              src={AssembleCoinsOncePNG}
              className="absolute left-1/2 top-1/2 h-[34px] w-auto -translate-x-1/2 -translate-y-1/2 drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]"
            />
          )}
          {boost.bonusType === "POINTS_PER_SECOND" && (
            <AssemblePerSecond className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]" />
          )}
        </>
      )}

      {type === "NFT" && nft && (
        <img
          src={nft.image || AssembleNftPNG}
          className="absolute left-1/2 top-1/2 h-[50px] w-[50px] -translate-x-1/2 -translate-y-1/2 rounded-lg drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]"
        />
      )}

      <span className="absolute bottom-2 left-1/2 translate-x-3.5 text-lg/[25px] font-extrabold drop-shadow-[0px_1px_1px_rgba(0,0,0,0.4)] [text-shadow:0.6px_0.6px_0.1px_#5B42AE,-0.6px_0.6px_0.1px_#5B42AE,0.6px_-0.6px_0.1px_#5B42AE,-0.6px_-0.6px_0.1px_#5B42AE]">
        x{amount}
      </span>
    </>
  )
}

const BoosterReward = ({ bonusType, amount }: Booster & { amount: number }) => {
  return (
    <>
      {bonusType === "XP_BONUS" && (
        <BoosterXp className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
      )}
      {bonusType === "FARMING_DURATION" && (
        <BoosterFarmDuration className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0px_1px_2px_rgba(0,0,0,0.25)]" />
      )}
      {bonusType === "POINTS_PER_SECOND" && (
        <BoosterPerSecond className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]" />
      )}
      <span className="absolute bottom-2 left-1/2 translate-x-3.5 text-lg/[25px] font-extrabold drop-shadow-[0px_1px_1px_rgba(0,0,0,0.4)] [text-shadow:0.6px_0.6px_0.1px_#5B42AE,-0.6px_0.6px_0.1px_#5B42AE,0.6px_-0.6px_0.1px_#5B42AE,-0.6px_-0.6px_0.1px_#5B42AE]">
        {amount}
      </span>
    </>
  )
}
