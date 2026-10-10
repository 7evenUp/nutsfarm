import React, { useState } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

import WheelIcon from "@/assets/games/shared-icons/wheel.svg?react"
import TicketIcon from "@/assets/games/shared-icons/wheel-ticket-with-border.svg?react"
import EnergyEmptyIcon from "@/assets/games/shared-icons/energy-empty.svg?react"
import EnergyFullIcon from "@/assets/games/shared-icons/energy-full.svg?react"
import CoinIcon from "@/assets/games/shared-icons/coin-icon.svg?react"
import ChevronDownIcon from "@/assets/games/shared-icons/chevron-down.svg?react"
import Loader from "@/assets/icons/loader.svg?react"

import WheelReward from "./WheelReward"

import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalTitle,
  ModalTrigger,
} from "../shared/Modal"

import GameButton from "@/modules/Games/components/GameButton"
import WheelAnimation from "@/modules/Games/components/LuckyNuts/WheelAnimation"

import {
  useGetAvailableSpinsQuery,
  useGetJackpotQuery,
  useSpinWheelMutation,
} from "@/redux/api/wheel"
import { useGetBoostersQuery } from "@/redux/api/items"

import { numberWithSpaces } from "@/utils/numberWithSpaces"
import { sendMetrika } from "@/utils/sendMetrika"

import { WheelReward as IWheelReward } from "@/types/wheel"

const LuckyWheel = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation()

  const [wheelOpen, setWheelOpen] = useState(false)
  const [rewardOpen, setRewardOpen] = useState(false)
  const [wheelReward, setWheelReward] = useState<IWheelReward | null>(null)
  const [animationReward, setAnimationReward] = useState<IWheelReward | null>(
    null,
  )

  const { data: spinsData } = useGetAvailableSpinsQuery()
  const { data: jackpot } = useGetJackpotQuery()
  const { refetch: refetchBoosters } = useGetBoostersQuery()
  const [spin, { isLoading: isSpinLoading }] = useSpinWheelMutation()

  const onStartClick = async () => {
    if (isSpinLoading) return

    sendMetrika("wheel_roll")

    try {
      const [reward] = await spin({}).unwrap()
      if (reward.type === "BOOSTER") refetchBoosters()
      setWheelReward(reward)
      setAnimationReward(reward)
      setWheelOpen(true)
    } catch {
      toast.error(t("Ошибка"), {
        description: t("Упс, что-то пошло не так"),
      })
    }
  }

  return (
    <Modal>
      <ModalTrigger asChild>{children}</ModalTrigger>
      <ModalContent className="w-80" innerClassName="pt-10 pb-3 px-[22px]">
        <ModalTitle className="sr-only">Lucky Nuts modal</ModalTitle>
        <ModalDescription className="sr-only">
          Spend 1 ticket to spin the wheel. Each spin gives you a guaranteed
          prize!
        </ModalDescription>

        <WheelIcon className="absolute left-1/2 top-0 h-[47px] w-[47px] -translate-x-1/2 -translate-y-3.5 drop-shadow-[0px_2px_3px_rgba(0,0,0,0.2)]" />

        <h2 className="mb-0.5 bg-gradient-to-b from-[#FCF4ED] to-[#F6DFCB] bg-clip-text font-koulen text-[42px]/[150%] text-transparent drop-shadow-[0px_2px_3px_rgba(0,0,0,0.25)]">
          Lucky Nuts
        </h2>

        <Collapsible className="mb-6 w-full rounded-lg bg-gradient-to-b from-[#653703]/60 to-[#452501]/60">
          <CollapsibleTrigger className="group relative flex h-9 w-full items-center justify-center">
            <p className="text-sm/none font-semibold text-[#FFDFBF]/50 transition-colors group-data-[state=open]:text-[#FFDFBF]/20">
              {t("Что это такое?")}
            </p>
            <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FFF1E5]/50 transition-transform group-data-[state=open]:rotate-180 group-data-[state=open]:text-[#FFF1E5]/20" />
          </CollapsibleTrigger>
          <CollapsibleContent className="w-full overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
            <div className="flex flex-col gap-2 px-2 pb-5">
              <p className="text-balance text-center text-xs/[14px] font-semibold text-[#FFDFBF]">
                {t(
                  "Потрать 5 энергии в любой из игр и получи 1 билет на колесо.",
                )}
              </p>
              <p className="text-balance text-center text-xs/[14px] font-semibold text-[#FFDFBF]">
                {t(
                  "Потрать 1 билет, чтобы вращать колесо. Каждое вращение дает гарантированный приз!",
                )}
              </p>
              <p className="text-balance text-center text-xs/[14px] font-semibold text-[#FFDFBF]">
                {t(
                  "Джекпот растёт благодаря сумме потраченных NUTS всех игроков.",
                )}
                <br />
                {t("Чем больше участников, тем крупнее награда!")}
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="mb-7 flex gap-[70px]">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm/4 font-semibold text-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.2)]">
              {t("Доступно")}
            </span>
            <div className="flex items-center gap-2">
              <TicketIcon className="h-5 w-5 text-[#6B3B05]/60" />
              {spinsData === undefined ? (
                <Loader className="animate-spin text-white" />
              ) : (
                <span className="text-base/none font-bold text-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.2)]">
                  {spinsData?.spinsCount}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm/4 font-semibold text-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.2)]">
              {t("До след. билета")}
            </span>
            {spinsData === undefined ? (
              <Loader className="animate-spin" />
            ) : (
              <div className="flex items-center gap-[5px]">
                {new Array(5).fill(null).map((_, i) => {
                  if (i + 1 <= 5 - spinsData.energyForNextSpin)
                    return (
                      <EnergyEmptyIcon
                        key={i}
                        className="h-5 w-4 text-[#4F2A05]"
                      />
                    )

                  return <EnergyFullIcon key={i} className="h-5 w-4" />
                })}
              </div>
            )}
          </div>
        </div>

        <p className="mb-2 text-sm/[150%] font-semibold text-[#FFF1E5] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.2)]">
          {t("Текущий Джекпот")}
        </p>
        <div className="flex h-8 items-center gap-2 rounded-md border border-[#6B3B05]/60 bg-gradient-to-b from-[#96550B] to-[#5A3104] pl-2.5 pr-3">
          <CoinIcon className="h-[18px] w-[18px]" />
          {jackpot !== undefined ? (
            <span className="text-sm font-bold text-white">
              {numberWithSpaces(jackpot)}
            </span>
          ) : (
            <Loader className="h-3 w-3 animate-spin text-white" />
          )}
        </div>

        <GameButton
          appearance="puzzles"
          className="mt-6 h-10 px-[57px]"
          onClick={onStartClick}
          disabled={
            isSpinLoading ||
            spinsData === undefined ||
            spinsData.spinsCount === 0
          }
        >
          {isSpinLoading || spinsData === undefined ? (
            <Loader className="animate-spin" />
          ) : (
            t("Испытать удачу")
          )}
        </GameButton>

        {animationReward !== null && (
          <WheelAnimation
            isPremium={false}
            open={wheelOpen}
            setOpen={setWheelOpen}
            openReward={() => {
              setRewardOpen(true)
            }}
            reward={animationReward}
            hideWheel={() => setAnimationReward(null)}
          />
        )}

        {wheelReward !== null && (
          <WheelReward
            open={rewardOpen}
            setOpen={setRewardOpen}
            reward={wheelReward}
          />
        )}
      </ModalContent>
    </Modal>
  )
}

export default LuckyWheel
