import { Dispatch, SetStateAction, useEffect, useState } from "react"
import * as Dialog from "@radix-ui/react-alert-dialog"
import { useTranslation } from "react-i18next"
import Fireworks from "react-canvas-confetti/dist/presets/fireworks"
import { TConductorInstance } from "react-canvas-confetti/dist/types"

import RewardBackgroundPng from "@/assets/wheel/rewards/stars-background.png"
import CoinPng from "@/assets/wheel/rewards/coin.png"
import Ticket from "@/assets/wheel/rewards/ticket.png"
import Nft from "@/assets/wheel/rewards/nft.png"
import BoosterNutsDuration from "@/assets/wheel/rewards/booster-nuts-duration.png"
import BoosterPerSecond from "@/assets/wheel/rewards/booster-nuts-per-second.png"
import Jackpot from "@/assets/wheel/rewards/jackpot.png"
import AssembePart from "@/assets/wheel/rewards/assemble-part.png"
import Energy from "@/assets/games/shared-icons/energy-full.svg?react"
import BoxPremiumClosed from "@/assets/passV2/icons/rewards/box_premium_closed.svg?react"
import PremiumTicketIcon from "@/assets/games/shared-icons/wheel-ticket-premium.svg?react"

import BoxRewardPreview from "./BoxRewardPreview"

import { LargeButton } from "@/shared/ui/LargeButton"

import { useAppSelector } from "@/redux/hooks"
import { useGetJackpotQuery } from "@/redux/api/wheel"

import { numberWithSpaces } from "@/utils/numberWithSpaces"

import { WheelReward as IWheelReward } from "@/types/wheel"

import { cn } from "@/lib/cn"

const WheelReward = ({
  open,
  setOpen,
  reward,
}: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  reward: IWheelReward
}) => {
  const { t } = useTranslation()

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal container={document.getElementById("dialogs")}>
        <Dialog.Content className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#17202D]/80 backdrop-blur">
          <Dialog.Title className="sr-only">Wheel Reward</Dialog.Title>
          <Dialog.Description className="sr-only">
            Wheel Reward
          </Dialog.Description>

          <h2 className="font-tt-hoves-expanded text-2xl font-semibold text-white phone-sm-fix:text-[28px]">
            {t("Получено.колесо")}
          </h2>

          <Reward reward={reward} />

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

export default WheelReward

const Reward = ({ reward }: { reward: IWheelReward }) => {
  const { t } = useTranslation()

  const lang = useAppSelector((state) => state.language.value)

  const { data: jackpot } = useGetJackpotQuery()

  const [conductor, setConductor] = useState<TConductorInstance>()
  const onInit = ({ conductor }: { conductor: TConductorInstance }) => {
    setConductor(conductor)
  }

  useEffect(() => {
    if (reward.type === "JACKPOT") {
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
        {reward.type === "NUTS" && (
          <img
            src={CoinPng}
            className="absolute left-1/2 top-1/2 h-[102px] w-[102px] -translate-x-1/2 -translate-y-1/2"
          />
        )}
        {reward.type === "GAME_ENERGY" && (
          <>
            <Energy className="absolute left-1/2 top-1/2 h-[90px] w-[90px] -translate-x-1/2 -translate-y-1/2" />
            <span className="absolute left-1/2 top-1/2 translate-x-10 translate-y-10 font-nunito text-xl font-extrabold text-white [filter:_drop-shadow(0px_1px_1px_rgba(0,0,0,0.4))_drop-shadow(0px_0px_1px_#050D12)]">
              x{reward.amount}
            </span>
          </>
        )}
        {reward.type === "NUT_PASS_XP" && (
          <img
            src={Ticket}
            className="absolute left-1/2 top-1/2 h-[102px] w-[102px] -translate-x-1/2 -translate-y-1/2"
          />
        )}
        {reward.type === "NFT" && (
          <img
            src={Nft}
            className="absolute left-1/2 top-1/2 h-[140px] w-[140px] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0px_4px_7px_rgba(164,162,225,0.3)]"
          />
        )}
        {reward.type === "BOOSTER" && reward.boost !== null && (
          <>
            <img
              src={
                reward.boost.bonusType === "FARMING_DURATION"
                  ? BoosterNutsDuration
                  : reward.boost.bonusType === "POINTS_PER_SECOND"
                    ? BoosterPerSecond
                    : reward.boost.bonusType === "XP_BONUS"
                      ? Ticket
                      : CoinPng
              }
              className="absolute left-1/2 top-1/2 h-[102px] w-[102px] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0px_4px_7px_rgba(164,162,225,0.3)]"
            />
            <span className="absolute left-1/2 top-1/2 translate-x-10 translate-y-10 font-nunito text-xl font-extrabold text-white [filter:_drop-shadow(0px_1px_1px_rgba(0,0,0,0.4))_drop-shadow(0px_0px_1px_rgba(91,66,174,1))]">
              +{reward.amount}
            </span>
          </>
        )}
        {reward.type === "JACKPOT" && (
          <img
            src={Jackpot}
            className="absolute left-1/2 top-1/2 h-[102px] w-[102px] -translate-x-1/2 -translate-y-1/2"
          />
        )}
        {reward.type === "BOX" && (
          <BoxRewardPreview boxRewards={[reward]}>
            <button>
              <BoxPremiumClosed className="absolute left-1/2 top-1/2 z-10 size-[102px] -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute left-1/2 top-1/2 size-[102px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-[#F7A835] blur-lg" />
            </button>
          </BoxRewardPreview>
        )}
        {reward.type === "ASSEMBLE_PART" && (
          <img
            src={AssembePart}
            className="absolute left-1/2 top-1/2 h-[102px] w-[102px] -translate-x-1/2 -translate-y-1/2"
          />
        )}
        {reward.type === "LEVELS" && (
          <>
            <img
              src={Ticket}
              className="absolute left-1/2 top-1/2 h-[102px] w-[102px] -translate-x-1/2 -translate-y-1/2"
            />
            <span className="absolute left-1/2 top-1/2 translate-x-10 translate-y-10 font-nunito text-xl font-extrabold text-white [filter:_drop-shadow(0px_1px_1px_rgba(0,0,0,0.4))_drop-shadow(0px_0px_1px_#050D12)]">
              x{reward.amount}
            </span>
          </>
        )}
        {reward.type === "NUT_PASS" && (
          <img
            src={Ticket}
            className="absolute left-1/2 top-1/2 h-[102px] w-[102px] -translate-x-1/2 -translate-y-1/2"
          />
        )}
        {reward.type === "PAID_WHEEL_SPIN" && (
          <>
            <PremiumTicketIcon className="absolute left-1/2 top-1/2 size-[102px] -translate-x-1/2 -translate-y-1/2" />
            <span className="absolute left-1/2 top-1/2 translate-x-10 translate-y-10 font-nunito text-xl font-extrabold text-white [filter:_drop-shadow(0px_1px_1px_rgba(0,0,0,0.4))_drop-shadow(0px_0px_1px_#050D12)]">
              x{reward.amount}
            </span>
          </>
        )}
      </div>

      <h2 className="font-tt-hoves-expanded text-xl font-semibold text-white phone-sm-fix:text-2xl">
        {reward.type === "NUTS" && `${numberWithSpaces(reward.amount)} NUTS`}
        {reward.type === "GAME_ENERGY" && t("Энергия")}
        {reward.type === "NUT_PASS_XP" &&
          `${numberWithSpaces(reward.amount)} XP`}
        {reward.type === "NFT" &&
          reward.nft &&
          (lang === "RU" ? reward.nft.title : reward.nft?.titleEn)}
        {reward.type === "BOOSTER" && t("Бустер")}
        {reward.type === "JACKPOT" &&
          jackpot !== undefined &&
          numberWithSpaces(jackpot, true) + " NUTS"}
        {reward.type === "BOX" && "Premium Box"}
        {reward.type === "ASSEMBLE_PART" && t("Сборная часть")}
        {reward.type === "LEVELS" && t("Уровни пропуска")}
        {reward.type === "NUT_PASS" && "Nuts Pass"}
        {reward.type === "PAID_WHEEL_SPIN" && t("Премиум спины")}
      </h2>

      <p className="mt-3.5 w-48 text-balance text-center font-nunito text-sm font-medium text-white/75">
        {reward.type === "NUTS" && t("Дополнительные NUTS на твой баланс")}
        {reward.type === "GAME_ENERGY" && t("Дополнительная энергия для игр")}
        {reward.type === "NUT_PASS_XP" && t("Дополнительные XP")}
        {reward.type === "NFT" && reward.nft && lang === "RU"
          ? reward.nft.description
          : reward.nft?.descriptionEn}
        {reward.type === "BOOSTER" && reward.boost && lang === "RU"
          ? reward.boost.description
          : reward.boost?.descriptionEn}
        {reward.type === "JACKPOT" && t("Ты выиграл джекпот!")}
        {reward.type === "BOX" && t("Нажми на сундук!")}
      </p>

      <Fireworks onInit={onInit} />
    </>
  )
}
