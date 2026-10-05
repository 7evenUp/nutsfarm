import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react"
import * as Dialog from "@radix-ui/react-alert-dialog"
import { useTranslation } from "react-i18next"
import Fireworks from "react-canvas-confetti/dist/presets/fireworks"
import { TConductorInstance } from "react-canvas-confetti/dist/types"

import BoxRewardPreview from "./BoxRewardPreview"

import RewardBackgroundPng from "@/assets/wheel/rewards/stars-background.png"
import CoinPng from "@/assets/wheel/rewards/coin.png"
import Ticket from "@/assets/wheel/rewards/ticket.png"
import Nft from "@/assets/wheel/rewards/nft.png"
import BoosterNutsDuration from "@/assets/wheel/rewards/booster-nuts-duration.png"
import BoosterPerSecond from "@/assets/wheel/rewards/booster-nuts-per-second.png"
import Jackpot from "@/assets/wheel/rewards/jackpot.png"
import Energy from "@/assets/games/shared-icons/energy-full.svg?react"
import BoxPremiumClosed from "@/assets/passV2/icons/rewards/box_premium_closed.svg?react"
import PremiumTicketIcon from "@/assets/games/shared-icons/wheel-ticket-premium.svg?react"
import PassTicket from "@/assets/wheel/ticket.svg?react"

import { LargeButton } from "@/shared/ui/LargeButton"

import { useGetJackpotQuery } from "@/redux/api/wheel"

import { numberWithSpaces } from "@/utils/numberWithSpaces"

import { WheelReward as IWheelReward } from "@/types/wheel"

import { cn } from "@/lib/cn"

const WheelRewardMultiple = ({
  open,
  setOpen,
  rewards,
}: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  rewards: IWheelReward[]
}) => {
  const { t } = useTranslation()

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal container={document.getElementById("dialogs")}>
        <Dialog.Content className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-1 bg-[#17202D]/80 backdrop-blur">
          <Dialog.Title className="sr-only">Wheel Reward</Dialog.Title>
          <Dialog.Description className="sr-only">
            Wheel Reward
          </Dialog.Description>

          <h2 className="font-tt-hoves-expanded text-2xl font-semibold text-white phone-sm-fix:text-[28px]">
            {t("Получено.колесо")}
          </h2>

          <Rewards rewards={rewards} />

          <Dialog.AlertDialogCancel asChild>
            <LargeButton
              appearance="yellow-linear"
              className={cn(
                "fixed inset-x-3.5 w-auto",
                Telegram.WebApp.platform === "weba"
                  ? "bottom-4"
                  : "bottom-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
              )}
            >
              {t("Забрать")}
            </LargeButton>
          </Dialog.AlertDialogCancel>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default WheelRewardMultiple

const Rewards = ({ rewards }: { rewards: IWheelReward[] }) => {
  const { data: jackpot } = useGetJackpotQuery()

  const [conductor, setConductor] = useState<TConductorInstance>()
  const onInit = ({ conductor }: { conductor: TConductorInstance }) => {
    setConductor(conductor)
  }

  const assembleRewards = useMemo(() => {
    return rewards.filter((reward) => reward.type === "ASSEMBLE_PART")
  }, [rewards])
  const boxRewards = useMemo(() => {
    return rewards.filter((reward) => reward.type === "BOX")
  }, [rewards])
  const paidSpinRewards = useMemo(() => {
    return rewards.filter((reward) => reward.type === "PAID_WHEEL_SPIN")
  }, [rewards])
  const levelsRewards = useMemo(() => {
    return rewards.filter((reward) => reward.type === "LEVELS")
  }, [rewards])
  const nutPassRewards = useMemo(() => {
    return rewards.filter((reward) => reward.type === "NUT_PASS")
  }, [rewards])
  const nutsRewards = useMemo(() => {
    return rewards.filter((reward) => reward.type === "NUTS")
  }, [rewards])
  const energyRewards = useMemo(() => {
    return rewards.filter((reward) => reward.type === "GAME_ENERGY")
  }, [rewards])
  const xpRewards = useMemo(() => {
    return rewards.filter((reward) => reward.type === "NUT_PASS_XP")
  }, [rewards])
  const nftRewards = useMemo(() => {
    return rewards.filter((reward) => reward.type === "NFT")
  }, [rewards])
  const farmingBoosterRewards = useMemo(() => {
    return rewards.filter(
      (reward) =>
        reward.type === "BOOSTER" &&
        reward.boost !== null &&
        reward.boost.bonusType === "FARMING_DURATION",
    )
  }, [rewards])
  const perSecondBoosterRewards = useMemo(() => {
    return rewards.filter(
      (reward) =>
        reward.type === "BOOSTER" &&
        reward.boost !== null &&
        reward.boost.bonusType === "POINTS_PER_SECOND",
    )
  }, [rewards])
  const xpBoosterRewards = useMemo(() => {
    return rewards.filter(
      (reward) =>
        reward.type === "BOOSTER" &&
        reward.boost !== null &&
        reward.boost.bonusType === "XP_BONUS",
    )
  }, [rewards])
  const onceBoosterRewards = useMemo(() => {
    return rewards.filter(
      (reward) =>
        reward.type === "BOOSTER" &&
        reward.boost !== null &&
        reward.boost.bonusType === "POINTS_ONCE_BONUS",
    )
  }, [rewards])
  const jackpotRewards = useMemo(() => {
    return rewards.filter((reward) => reward.type === "JACKPOT")
  }, [rewards])

  useEffect(() => {
    if (rewards.some((reward) => reward.type === "JACKPOT")) {
      conductor?.run({ speed: 2 })
    }
  }, [conductor])

  return (
    <>
      <div className="relative h-[170px] w-full">
        <div className="absolute left-1/2 top-1/2 h-[374px] w-[374px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(224,107,208,1)_0%,_rgba(90,56,129,0.3)_60%,transparent_100%)] mix-blend-overlay" />
        <img
          src={RewardBackgroundPng}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mix-blend-screen"
        />
        <div className="mx-auto mt-4 flex w-[332px] flex-wrap items-center justify-center gap-4">
          {nutPassRewards.length > 0 && (
            <div className="flex w-[100px] flex-col items-center gap-1">
              <div className="relative">
                <PassTicket className="size-16" />
              </div>
              <span className="font-nunito text-sm font-extrabold text-white [filter:_drop-shadow(0px_1px_1px_rgba(0,0,0,0.4))_drop-shadow(0px_0px_1px_#050D12)]">
                Nuts Pass
              </span>
            </div>
          )}
          {levelsRewards.length > 0 && (
            <div className="flex w-[100px] flex-col items-center gap-1">
              <div className="relative">
                <img src={Ticket} className="size-16" />
                <span className="absolute bottom-0 right-0 whitespace-nowrap font-nunito text-xs font-extrabold text-white [filter:_drop-shadow(0px_1px_1px_rgba(0,0,0,0.4))_drop-shadow(0px_0px_1px_#050D12)]">
                  x{levelsRewards.length}
                </span>
              </div>
              <span className="font-nunito text-sm font-extrabold text-white [filter:_drop-shadow(0px_1px_1px_rgba(0,0,0,0.4))_drop-shadow(0px_0px_1px_#050D12)]">
                Pass Levels
              </span>
            </div>
          )}
          {paidSpinRewards.length > 0 && (
            <div className="flex w-[100px] flex-col items-center gap-1">
              <div className="relative">
                <PremiumTicketIcon className="size-16" />
                <span className="absolute bottom-0 right-0 whitespace-nowrap font-nunito text-xs font-extrabold text-white [filter:_drop-shadow(0px_1px_1px_rgba(0,0,0,0.4))_drop-shadow(0px_0px_1px_#050D12)]">
                  x
                  {paidSpinRewards.reduce(
                    (acc, current) => acc + current.amount,
                    0,
                  )}
                </span>
              </div>
              <span className="font-nunito text-sm font-extrabold text-white [filter:_drop-shadow(0px_1px_1px_rgba(0,0,0,0.4))_drop-shadow(0px_0px_1px_#050D12)]">
                Premium Spins
              </span>
            </div>
          )}
          {boxRewards.length > 0 && (
            <BoxRewardPreview boxRewards={boxRewards}>
              <button className="flex w-[100px] flex-col items-center gap-1">
                <div className="relative z-10">
                  <BoxPremiumClosed className="size-16" />
                  <span className="absolute bottom-0 right-0 whitespace-nowrap font-nunito text-xs font-extrabold text-white [filter:_drop-shadow(0px_1px_1px_rgba(0,0,0,0.4))_drop-shadow(0px_0px_1px_#050D12)]">
                    x{boxRewards.length}
                  </span>
                </div>
                <span className="relative z-10 font-nunito text-sm font-extrabold text-white [filter:_drop-shadow(0px_1px_1px_rgba(0,0,0,0.4))_drop-shadow(0px_0px_1px_#050D12)]">
                  Box
                </span>
                <div className="absolute size-14 animate-pulse rounded-full bg-[#F7A835] blur-lg" />
              </button>
            </BoxRewardPreview>
          )}
          {assembleRewards.length > 0 && (
            <div className="flex w-[100px] flex-col items-center gap-1">
              <div className="relative">
                <img
                  src={assembleRewards[0].assembleItemPart?.image || ""}
                  className="size-16"
                />
                <span className="absolute bottom-0 right-0 whitespace-nowrap font-nunito text-xs font-extrabold text-white [filter:_drop-shadow(0px_1px_1px_rgba(0,0,0,0.4))_drop-shadow(0px_0px_1px_#050D12)]">
                  x{assembleRewards.length}
                </span>
              </div>
              <span className="font-nunito text-sm font-extrabold text-white [filter:_drop-shadow(0px_1px_1px_rgba(0,0,0,0.4))_drop-shadow(0px_0px_1px_#050D12)]">
                Assemble Part
              </span>
            </div>
          )}
          {nutsRewards.length > 0 && (
            <div className="flex w-[100px] flex-col items-center gap-1">
              <div className="relative">
                <img src={CoinPng} className="size-16" />
                <span className="absolute bottom-0 right-0 whitespace-nowrap font-nunito text-xs font-extrabold text-white [filter:_drop-shadow(0px_1px_1px_rgba(0,0,0,0.4))_drop-shadow(0px_0px_1px_#050D12)]">
                  {numberWithSpaces(
                    nutsRewards.reduce(
                      (acc, current) => acc + current.amount,
                      0,
                    ),
                  )}
                </span>
              </div>
              <span className="font-nunito text-sm font-extrabold text-white [filter:_drop-shadow(0px_1px_1px_rgba(0,0,0,0.4))_drop-shadow(0px_0px_1px_#050D12)]">
                NUTS
              </span>
            </div>
          )}
          {energyRewards.length > 0 && (
            <div className="flex w-[100px] flex-col items-center gap-1">
              <div className="relative">
                <Energy className="size-16" />
                <span className="absolute bottom-0 right-0 whitespace-nowrap font-nunito text-xs font-extrabold text-white [filter:_drop-shadow(0px_1px_1px_rgba(0,0,0,0.4))_drop-shadow(0px_0px_1px_#050D12)]">
                  x
                  {energyRewards.reduce(
                    (acc, current) => acc + current.amount,
                    0,
                  )}
                </span>
              </div>
              <span className="font-nunito text-sm font-extrabold text-white [filter:_drop-shadow(0px_1px_1px_rgba(0,0,0,0.4))_drop-shadow(0px_0px_1px_#050D12)]">
                Energy
              </span>
            </div>
          )}
          {xpRewards.length > 0 && (
            <div className="flex w-[100px] flex-col items-center gap-1">
              <div className="relative">
                <img src={Ticket} className="size-16" />
                <span className="absolute bottom-0 right-0 whitespace-nowrap font-nunito text-xs font-extrabold text-white [filter:_drop-shadow(0px_1px_1px_rgba(0,0,0,0.4))_drop-shadow(0px_0px_1px_#050D12)]">
                  x{xpRewards.reduce((acc, current) => acc + current.amount, 0)}
                </span>
              </div>
              <span className="font-nunito text-sm font-extrabold text-white [filter:_drop-shadow(0px_1px_1px_rgba(0,0,0,0.4))_drop-shadow(0px_0px_1px_#050D12)]">
                XP
              </span>
            </div>
          )}
          {nftRewards.length > 0 && (
            <div className="flex w-[100px] flex-col items-center gap-1">
              <div className="relative">
                <img src={Nft} className="size-16" />
                <span className="absolute bottom-0 right-0 whitespace-nowrap font-nunito text-xs font-extrabold text-white [filter:_drop-shadow(0px_1px_1px_rgba(0,0,0,0.4))_drop-shadow(0px_0px_1px_#050D12)]">
                  x{nftRewards.length}
                </span>
              </div>
              <span className="font-nunito text-sm font-extrabold text-white [filter:_drop-shadow(0px_1px_1px_rgba(0,0,0,0.4))_drop-shadow(0px_0px_1px_#050D12)]">
                NFT
              </span>
            </div>
          )}
          {farmingBoosterRewards.length > 0 && (
            <div className="flex w-[100px] flex-col items-center gap-1">
              <div className="relative">
                <img src={BoosterNutsDuration} className="size-16" />
                <span className="absolute bottom-0 right-0 whitespace-nowrap font-nunito text-xs font-extrabold text-white [filter:_drop-shadow(0px_1px_1px_rgba(0,0,0,0.4))_drop-shadow(0px_0px_1px_#050D12)]">
                  x{farmingBoosterRewards.length}
                </span>
              </div>
              <span className="font-nunito text-sm font-extrabold text-white [filter:_drop-shadow(0px_1px_1px_rgba(0,0,0,0.4))_drop-shadow(0px_0px_1px_#050D12)]">
                Booster
              </span>
            </div>
          )}
          {perSecondBoosterRewards.length > 0 && (
            <div className="flex w-[100px] flex-col items-center gap-1">
              <div className="relative">
                <img src={BoosterPerSecond} className="size-16" />
                <span className="absolute bottom-0 right-0 whitespace-nowrap font-nunito text-xs font-extrabold text-white [filter:_drop-shadow(0px_1px_1px_rgba(0,0,0,0.4))_drop-shadow(0px_0px_1px_#050D12)]">
                  x{perSecondBoosterRewards.length}
                </span>
              </div>
              <span className="font-nunito text-sm font-extrabold text-white [filter:_drop-shadow(0px_1px_1px_rgba(0,0,0,0.4))_drop-shadow(0px_0px_1px_#050D12)]">
                Booster
              </span>
            </div>
          )}
          {xpBoosterRewards.length > 0 && (
            <div className="flex w-[100px] flex-col items-center gap-1">
              <div className="relative">
                <img src={Ticket} className="size-16" />
                <span className="absolute bottom-0 right-0 whitespace-nowrap font-nunito text-xs font-extrabold text-white [filter:_drop-shadow(0px_1px_1px_rgba(0,0,0,0.4))_drop-shadow(0px_0px_1px_#050D12)]">
                  x{xpBoosterRewards.length}
                </span>
              </div>
              <span className="font-nunito text-sm font-extrabold text-white [filter:_drop-shadow(0px_1px_1px_rgba(0,0,0,0.4))_drop-shadow(0px_0px_1px_#050D12)]">
                Booster
              </span>
            </div>
          )}
          {onceBoosterRewards.length > 0 && (
            <div className="flex w-[100px] flex-col items-center gap-1">
              <div className="relative">
                <img src={CoinPng} className="size-16" />
                <span className="absolute bottom-0 right-0 whitespace-nowrap font-nunito text-xs font-extrabold text-white [filter:_drop-shadow(0px_1px_1px_rgba(0,0,0,0.4))_drop-shadow(0px_0px_1px_#050D12)]">
                  x{onceBoosterRewards.length}
                </span>
              </div>
              <span className="font-nunito text-sm font-extrabold text-white [filter:_drop-shadow(0px_1px_1px_rgba(0,0,0,0.4))_drop-shadow(0px_0px_1px_#050D12)]">
                Booster
              </span>
            </div>
          )}
          {jackpotRewards.length > 0 && (
            <div className="flex w-[100px] flex-col items-center gap-1">
              <div className="relative">
                <img src={Jackpot} className="size-16" />
                <span className="absolute bottom-0 right-0 whitespace-nowrap font-nunito text-xs font-extrabold text-white [filter:_drop-shadow(0px_1px_1px_rgba(0,0,0,0.4))_drop-shadow(0px_0px_1px_#050D12)]">
                  {jackpot !== undefined &&
                    numberWithSpaces(jackpot, true) + " NUTS"}
                </span>
              </div>
              <span className="font-nunito text-sm font-extrabold text-white [filter:_drop-shadow(0px_1px_1px_rgba(0,0,0,0.4))_drop-shadow(0px_0px_1px_#050D12)]">
                Jackpot
              </span>
            </div>
          )}
        </div>
      </div>

      <Fireworks onInit={onInit} />
    </>
  )
}
