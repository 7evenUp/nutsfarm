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
      const [reward] = await spin().unwrap()
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
      <ModalContent className="w-80 px-7 pb-6 pt-[54px]">
        <ModalTitle className="sr-only">Lucky Nuts modal</ModalTitle>
        <ModalDescription className="sr-only">
          Spend 1 ticket to spin the wheel. Each spin gives you a guaranteed
          prize!
        </ModalDescription>

        <div className="absolute left-1/2 top-0 flex h-14 w-14 -translate-x-1/2 -translate-y-3.5 items-center justify-center rounded-xl border border-[#3A2485] bg-gradient-to-b from-[#473391] to-[#3C2786]">
          <WheelIcon className="h-[34px] w-[34px]" />
        </div>

        <h2 className="mb-3.5 bg-gradient-to-b from-[#7354D3] to-[#5239A7] bg-clip-text font-days-one text-[28px]/none text-transparent">
          Lucky Nuts
        </h2>

        <Collapsible className="mb-6 w-full rounded-[10px] border border-[#463190]/20">
          <CollapsibleTrigger className="group relative flex h-9 w-full items-center justify-center">
            <p className="text-sm/none font-semibold text-[#463190]/75 transition-colors group-data-[state=open]:text-[#463190]/40">
              {t("Что это такое?")}
            </p>
            <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-[#463190] transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="w-full overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
            <div className="flex flex-col gap-2 px-2 pb-5">
              <p className="text-balance text-center text-xs/[14px] font-semibold text-[#382E6D]/80">
                {t(
                  "Потрать 5 энергии в любой из игр и получи 1 билет на колесо.",
                )}
              </p>
              <p className="text-balance text-center text-xs/[14px] font-semibold text-[#382E6D]/80">
                {t(
                  "Потрать 1 билет, чтобы вращать колесо. Каждое вращение дает гарантированный приз!",
                )}
              </p>
              <p className="text-balance text-center text-xs/[14px] font-semibold text-[#382E6D]/80">
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
            <span className="text-sm/4 font-semibold text-[#463190]/75">
              {t("Доступно")}
            </span>
            <div className="flex items-center gap-2">
              <TicketIcon className="h-5 w-5 text-[#008D38]" />
              {spinsData === undefined ? (
                <Loader className="animate-spin" />
              ) : (
                <span className="text-base/none font-bold text-[#463190]">
                  {spinsData?.spinsCount}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm/4 font-semibold text-[#463190]/75">
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
                        className="h-5 w-4 text-[#D7DBFF]"
                      />
                    )

                  return <EnergyFullIcon key={i} className="h-5 w-4" />
                })}
              </div>
            )}
          </div>
        </div>

        <p className="mb-2.5 text-sm/[150%] font-bold text-[#463190]/75">
          {t("Текущий Джекпот")}
        </p>
        <div className="flex h-8 items-center gap-1.5 rounded-md border border-[#3A2485]/75 bg-gradient-to-b from-[#7F60E5]/90 to-[#573DAE]/90 pl-2.5 pr-3">
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
          appearance="cryptle"
          className="mt-6 h-10 px-[68px]"
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
