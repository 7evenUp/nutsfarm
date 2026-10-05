import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import Fireworks from "react-canvas-confetti/dist/presets/fireworks"
import { TConductorInstance } from "react-canvas-confetti/dist/types"

import CoinPng from "@/assets/wheel/rewards/coin.png"
import Ticket from "@/assets/wheel/rewards/ticket.png"
import Nft from "@/assets/wheel/rewards/nft.png"
import BoosterNutsDuration from "@/assets/wheel/rewards/booster-nuts-duration.png"
import BoosterPerSecond from "@/assets/wheel/rewards/booster-nuts-per-second.png"
import Jackpot from "@/assets/wheel/rewards/jackpot.png"
import Energy from "@/assets/games/shared-icons/energy-full.svg?react"

import { numberWithSpaces } from "@/utils/numberWithSpaces"

import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalTitle,
} from "../shared/Modal"

import GameButton from "@/modules/Games/components/GameButton"

import { useAppSelector } from "@/redux/hooks"
import { useGetJackpotQuery } from "@/redux/api/wheel"

import { WheelReward as IWheelReward } from "@/types/wheel"

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
    <Modal open={open} onOpenChange={setOpen}>
      <ModalContent className="w-72 px-7 pb-5 pt-[26px]">
        <ModalTitle className="sr-only">Wheel Reward</ModalTitle>
        <ModalDescription className="sr-only">Wheel Reward</ModalDescription>

        <h2 className="bg-gradient-to-b from-[#0F0C5A] to-[#564C9F] bg-clip-text font-days-one text-[28px]/[150%] text-transparent drop-shadow-[0px_1px_1px_rgba(0,0,0,0.15)]">
          {t("Получено.колесо")}
        </h2>

        <Reward reward={reward} />

        <GameButton
          appearance="flip-cards"
          className="mt-7 h-10 w-full"
          onClick={() => setOpen(false)}
        >
          {t("Забрать")}
        </GameButton>
      </ModalContent>
    </Modal>
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
      <div className="relative">
        {reward.type === "NUTS" && (
          <img src={CoinPng} className="my-6 h-[102px] w-[102px]" />
        )}
        {reward.type === "GAME_ENERGY" && (
          <>
            <Energy className="mb-7 mt-6 h-[90px] w-[90px] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.4)]" />
            <span className="absolute bottom-0 right-0 -translate-y-5 font-nunito text-2xl font-extrabold text-white [filter:_drop-shadow(0px_1px_1px_rgba(0,0,0,0.4))_drop-shadow(0px_0px_1px_rgba(91,66,174,1))]">
              x{reward.amount}
            </span>
          </>
        )}
        {reward.type === "NUT_PASS_XP" && (
          <img src={Ticket} className="my-4 h-[113px] w-[113px]" />
        )}
        {reward.type === "NFT" && (
          <img
            src={Nft}
            className="my-6 h-[140px] w-[140px] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.2)]"
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
              className="mb-[18px] mt-6 h-[102px] w-[102px] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.2)]"
            />
            <span className="absolute bottom-0 right-1 -translate-y-3 font-nunito text-2xl font-extrabold text-white [filter:_drop-shadow(0px_1px_1px_rgba(0,0,0,0.4))_drop-shadow(0px_0px_1px_rgba(91,66,174,1))]">
              +{reward.amount}
            </span>
          </>
        )}
        {reward.type === "JACKPOT" && (
          <img src={Jackpot} className="my-6 h-[102px] w-[102px]" />
        )}
      </div>

      <h2 className="bg-gradient-to-b from-[#0F0C5A] to-[#564C9F] bg-clip-text text-center font-days-one text-xl/[150%] text-transparent drop-shadow-[0px_1px_1px_rgba(0,0,0,0.15)]">
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
      </h2>

      <p className="mt-2 text-balance text-center font-nunito text-xs font-medium text-[#382E6D]/80">
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
      </p>

      <Fireworks onInit={onInit} />
    </>
  )
}
