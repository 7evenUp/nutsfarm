import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import Loader from "@/assets/icons/loader.svg?react"

import CoinPng from "@/assets/wheel/rewards/coin.png"
import Ticket from "@/assets/wheel/rewards/ticket.png"
import BoosterNutsDuration from "@/assets/wheel/rewards/booster-nuts-duration.png"
import BoosterPerSecond from "@/assets/wheel/rewards/booster-nuts-per-second.png"
import Jackpot from "@/assets/wheel/rewards/jackpot.png"
import Energy from "@/assets/games/shared-icons/energy-full.svg?react"
import PremiumTicketIcon from "@/assets/games/shared-icons/wheel-ticket-premium.svg?react"
import BoxPremiumClosed from "@/assets/passV2/icons/rewards/box_premium_closed.svg?react"

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/shared/ui/Drawer"

import { useGetJackpotQuery, useGetWheelRewardsQuery } from "@/redux/api/wheel"
import { useAppSelector } from "@/redux/hooks"

import { WheelNFT, WheelRewardType } from "@/types/wheel"
import { Booster } from "@/types/item"
import { AssemblePart } from "@/types/assembled-parts"

import { numberWithSpaces } from "@/utils/numberWithSpaces"

const RewardsList = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation()

  const lang = useAppSelector((state) => state.language.value)

  const { data } = useGetWheelRewardsQuery()
  const { data: jackpot } = useGetJackpotQuery()

  const wheelRewards = useMemo(() => {
    if (!data) return []
    if (data.length === 0) return []

    return data.filter((el) => el.isPaidWheel)
  }, [data])

  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent handleDisabled>
        <DrawerHeader className="sr-only">
          <DrawerTitle>Wheel rewards info</DrawerTitle>
          <DrawerDescription>Wheel rewards info</DrawerDescription>
        </DrawerHeader>

        <div className="overflow-y-auto">
          <div
            aria-hidden
            className="mx-auto mb-8 mt-4 h-2 w-[100px] flex-shrink-0 rounded-full bg-white/20"
          />

          <h2 className="text-center font-tt-hoves-expanded text-2xl font-semibold -tracking-[0.02em] text-white">
            {t("Премиум награды")}
          </h2>

          {wheelRewards.length > 0 ? (
            <div className="my-6 flex flex-col gap-2 px-4">
              {wheelRewards.map((reward) => (
                <div
                  key={reward.id}
                  className="flex h-[51px] w-full shrink-0 items-center gap-2 rounded-[10px] bg-[#252E3D] px-3.5 text-sm font-medium text-white"
                >
                  <div className="flex h-6 w-6 items-center justify-center">
                    <RewardIcon
                      type={reward.type}
                      boost={reward.boost}
                      nft={reward.nft}
                      assemblePart={reward.assembleItemPart}
                    />
                  </div>
                  {lang === "RU" ? reward.title : reward.titleEn}
                  <span className="ml-auto">
                    {reward.type === "JACKPOT"
                      ? jackpot !== undefined &&
                        numberWithSpaces(jackpot, true) + " NUTS"
                      : reward.type === "NUT_PASS_XP"
                        ? numberWithSpaces(reward.amount) + " XP"
                        : reward.type === "NUTS"
                          ? numberWithSpaces(reward.amount) + " NUTS"
                          : reward.amount
                            ? "x" + numberWithSpaces(reward.amount)
                            : "x1"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <Loader className="h-20 w-20 animate-spin" />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default RewardsList

const RewardIcon = ({
  type,
  boost,
  nft,
  assemblePart,
}: {
  type: WheelRewardType
  boost: Booster | null
  nft: WheelNFT | null
  assemblePart: AssemblePart | null
}) => {
  if (type === "BOOSTER" && boost) {
    if (boost.bonusType === "FARMING_DURATION")
      return <img src={BoosterNutsDuration} className="h-6 w-auto" />
    if (boost.bonusType === "XP_BONUS")
      return <img src={Ticket} className="h-6 w-auto" />
    if (boost.bonusType === "POINTS_PER_SECOND")
      return <img src={BoosterPerSecond} className="h-6 w-auto" />
    if (boost.bonusType === "POINTS_ONCE_BONUS")
      return <img src={CoinPng} className="h-6 w-auto" />
  }
  if (type === "GAME_ENERGY") return <Energy className="h-6 w-auto" />
  if (type === "JACKPOT") return <img src={Jackpot} className="h-6 w-auto" />
  if (type === "NFT" && nft)
    return <img src={nft.image} className="h-6 w-auto rounded-sm bg-cover" />
  if (type === "NUTS") return <img src={CoinPng} className="h-6 w-auto" />
  if (type === "NUT_PASS_XP" || type === "NUT_PASS" || type === "LEVELS")
    return <img src={Ticket} className="h-6 w-auto" />
  if (type === "PAID_WHEEL_SPIN")
    return <PremiumTicketIcon className="h-6 w-auto" />
  if (type === "BOX") return <BoxPremiumClosed className="h-6 w-auto" />
  if (type === "ASSEMBLE_PART" && assemblePart)
    return (
      <img
        src={assemblePart.image!}
        className="h-6 w-auto rounded-sm bg-cover"
      />
    )
}
