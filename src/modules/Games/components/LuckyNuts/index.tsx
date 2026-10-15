import { useLayoutEffect, useState } from "react"
import { Description, Close, DialogTitle } from "@radix-ui/react-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import QuestionIcon from "@/assets/passV2/icons/question-mark-circle.svg?react"
import TicketIcon from "@/assets/games/shared-icons/wheel-ticket.svg?react"
import PremiumTicketIcon from "@/assets/games/shared-icons/wheel-ticket-premium.svg?react"
import PlusButtonIcon from "@/assets/games/shared-icons/plus-square-button.svg?react"
import EnergyEmptyIcon from "@/assets/games/shared-icons/energy-empty.svg?react"
import EnergyFullIcon from "@/assets/games/shared-icons/energy-full.svg?react"
import CoinIcon from "@/assets/games/shared-icons/coin-icon.svg?react"
import CloseIcon from "@/assets/icons/close.svg?react"
import Loader from "@/assets/icons/loader.svg?react"

import WheelPNG from "@/assets/wheel/wheel-preview.png"
import WheelPremiumPNG from "@/assets/wheel/wheel-preview-premium.png"

import WheelAnimation from "./WheelAnimation"
import WheelReward from "./WheelReward"
import WheelInfo from "./WheelInfo"
import BuyTicket from "./BuyTicket"
import TicketPaymentStatus from "./TicketPaymentStatus"
import WheelAnimationMultiple from "./WheelAnimationMultiple"
import WheelRewardMultiple from "./WheelRewardMultiple"
import RewardsList from "./RewardsList"

import { Dialog, DialogContent, DialogTrigger } from "@/shared/ui/Dialog"
import { LargeButton } from "@/shared/ui/LargeButton"
import { Button } from "@/shared/ui/Button"

import {
  useGetAvailableSpinsQuery,
  useGetJackpotQuery,
  useSpinPremiumWheelMutation,
  useSpinWheelMutation,
} from "@/redux/api/wheel"
import { useGetBoostersQuery } from "@/redux/api/items"
import { useGetGameEnergyQuery } from "@/redux/api/games"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { setWheelModalOpened } from "@/redux/slices/wheelModal"

import { numberWithSpaces } from "@/utils/numberWithSpaces"
import { sendMetrika } from "@/utils/sendMetrika"

import { WheelReward as IWheelReward } from "@/types/wheel"

import { cn } from "@/lib/cn"

const LuckyNuts = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)
  const [multipleLocked, setMultipleLocked] = useState(false)
  const [oneLocked, setOneLocked] = useState(false)
  const [activeTab, setActiveTab] = useState<"free" | "premium">("free")
  const [paymentStatusOpened, setPaymentStatusOpened] = useState(false)
  const [wheelOpen, setWheelOpen] = useState(false)
  const [multipleWheelOpen, setMultipleWheelOpen] = useState(false)
  const [rewardOpen, setRewardOpen] = useState(false)
  const [rewardOpenMultiple, setRewardOpenMultiple] = useState(false)
  const [wheelReward, setWheelReward] = useState<IWheelReward | null>(null)
  const [wheelRewardMultiple, setWheelRewardMultiple] = useState<
    IWheelReward[] | null
  >(null)
  const [animationReward, setAnimationReward] = useState<IWheelReward | null>(
    null,
  )
  const [multipleAnimationReward, setMultipleAnimationReward] =
    useState<IWheelReward | null>(null)

  const { data: spinsData } = useGetAvailableSpinsQuery()
  const { data: jackpot } = useGetJackpotQuery()
  const { refetch: refetchBoosters } = useGetBoostersQuery()
  const { refetch: refetchEnergy } = useGetGameEnergyQuery()
  const [spin, { isLoading: isSpinLoading }] = useSpinWheelMutation()
  const [spinPremium, { isLoading: isSpinPremiumLoading }] =
    useSpinPremiumWheelMutation()

  const dispatch = useAppDispatch()
  const wasWheelOpened = useAppSelector((state) => state.wheelModal.wasOpened)

  const onStartClick = async () => {
    if (isSpinLoading) return
    if (isSpinPremiumLoading) return
    if (oneLocked) return

    setOneLocked(true)

    sendMetrika("wheel_roll")

    try {
      let reward: IWheelReward
      if (activeTab === "free") {
        const [x] = await spin({ amount: 1 }).unwrap()
        reward = x
      } else {
        const [y] = await spinPremium({ amount: 1 }).unwrap()
        reward = y
      }
      if (reward.type === "BOOSTER") refetchBoosters()
      if (reward.type === "GAME_ENERGY") refetchEnergy()

      setWheelReward(reward)
      setAnimationReward(reward)
      setWheelOpen(true)
    } catch {
      toast.error(t("Ошибка"), {
        description: t("Упс, что-то пошло не так"),
      })
    } finally {
      setOneLocked(false)
    }
  }

  const onMultipleStartClick = async () => {
    if (isSpinLoading) return
    if (isSpinPremiumLoading) return
    if (!spinsData) return
    if (multipleLocked) return

    setMultipleLocked(true)

    sendMetrika("wheel_roll")

    let correctAmount = 10

    if (activeTab === "free") {
      if (spinsData.spinsCount < 10) correctAmount = spinsData.spinsCount
    } else {
      if (spinsData.paidSpins < 10) correctAmount = spinsData.paidSpins
    }

    try {
      let rewards: IWheelReward[]
      if (activeTab === "free") {
        rewards = await spin({ amount: correctAmount }).unwrap()
      } else {
        rewards = await spinPremium({ amount: correctAmount }).unwrap()
      }
      if (rewards.some((reward) => reward.type === "BOOSTER")) {
        refetchBoosters()
      }
      if (rewards.some((reward) => reward.type === "GAME_ENERGY")) {
        refetchEnergy()
      }

      setWheelRewardMultiple(rewards)
      setMultipleAnimationReward(rewards[0])
      setMultipleWheelOpen(true)
    } catch {
      toast.error(t("Ошибка"), {
        description: t("Упс, что-то пошло не так"),
      })
    } finally {
      setMultipleLocked(false)
    }
  }

  useLayoutEffect(() => {
    if (wasWheelOpened) return

    const { start_param } = Telegram.WebApp.initDataUnsafe

    if (!start_param) return

    const openWheelParam = start_param
      .split("-")
      .find((param) => param.startsWith("openWheel"))

    if (!openWheelParam) return

    setOpen(true)
    dispatch(setWheelModalOpened(true))
  }, [])

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent
          className={cn(
            "items-center gap-0 rounded-t-none px-3.5 pt-4",
            Telegram.WebApp.platform === "weba"
              ? "pb-4"
              : "pb-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
          )}
        >
          <DialogTitle className="sr-only">Lucky Nuts modal</DialogTitle>
          <Description className="sr-only">
            Spend 1 ticket to spin the wheel. Each spin gives you a guaranteed
            prize!
          </Description>

          <div className="flex w-full justify-between phone-sm-fix:mb-4">
            <WheelInfo>
              <button className="flex size-9 items-center justify-center rounded-lg bg-[#413577]/40">
                <QuestionIcon />
              </button>
            </WheelInfo>
            <Close className="opacity-70 transition-opacity focus:outline-none active:opacity-100">
              <CloseIcon className="h-6 w-6" />
              <span className="sr-only">Close</span>
            </Close>
          </div>

          <h2 className="font-tt-hoves-expanded text-2xl font-semibold -tracking-[0.02em]">
            Lucky Nuts
          </h2>

          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "free" | "premium")}
            className="mt-6 flex w-full flex-col items-center"
          >
            <TabsList className="flex h-[34px] w-fit items-center gap-1 rounded-[10px] bg-[#17202D] px-1">
              <TabsTrigger
                value="free"
                className="h-[26px] w-[108px] whitespace-nowrap rounded-[10px] text-xs font-medium text-white/30 transition-colors data-[state=active]:bg-[#252E3D] data-[state=active]:text-white"
              >
                Free spin
              </TabsTrigger>
              <TabsTrigger
                value="premium"
                className="h-[26px] w-[108px] whitespace-nowrap rounded-[10px] text-xs font-medium text-white/30 transition-colors data-[state=active]:bg-[#252E3D] data-[state=active]:text-white"
              >
                Premium spin
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="free"
              className="flex w-full flex-col items-center"
            >
              <img
                src={WheelPNG}
                alt="wheel image"
                className="my-5 size-[160px] phone-sm-fix:my-9 phone-sm-fix:size-[230px]"
              />

              <div className="mb-4 flex gap-[70px] phone-sm-fix:mb-6">
                <div className="flex flex-col gap-1">
                  <span className="text-sm/4 font-semibold text-white/50">
                    {t("Доступно")}
                  </span>
                  <div className="flex items-center gap-2">
                    <TicketIcon className="h-5 w-5" />
                    {spinsData === undefined ? (
                      <Loader className="animate-spin" />
                    ) : (
                      <span className="text-base font-bold">
                        {spinsData?.spinsCount}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm/4 font-semibold text-white/50">
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
                              className="h-5 w-4 text-[#33435B]"
                            />
                          )

                        return <EnergyFullIcon key={i} className="h-5 w-4" />
                      })}
                    </div>
                  )}
                </div>
              </div>

              <p className="mb-2 text-sm/[150%] font-semibold">
                {t("Текущий Джекпот")}
              </p>
              <div className="flex h-8 items-center gap-2 rounded-md bg-[#17202D] px-2.5">
                <CoinIcon className="h-[18px] w-[18px]" />
                {jackpot !== undefined ? (
                  <span className="text-sm font-bold">
                    {numberWithSpaces(jackpot)}
                  </span>
                ) : (
                  <Loader className="h-3 w-3 animate-spin" />
                )}
              </div>
            </TabsContent>
            <TabsContent
              value="premium"
              className="flex w-full flex-col items-center"
            >
              <img
                src={WheelPremiumPNG}
                alt="wheel image"
                className="my-5 size-[160px] phone-sm-fix:my-9 phone-sm-fix:size-[230px]"
              />

              <div className="mb-4 flex items-center gap-[50px] phone-sm-fix:mb-6">
                <div className="flex flex-col gap-1">
                  <span className="text-sm/4 font-semibold text-white/50">
                    {t("Доступно")}
                  </span>
                  <div className="relative flex items-center gap-2">
                    <div className="absolute left-1/2 h-5 w-3/4 -translate-x-1/2 [background:_linear-gradient(90deg,_rgba(23,_32,_45,_0.00)_0%,_#252E3D_60.73%)]" />
                    <PremiumTicketIcon className="relative h-5 w-5" />
                    {spinsData === undefined ? (
                      <Loader className="relative animate-spin" />
                    ) : (
                      <span className="relative text-base font-bold">
                        {spinsData?.paidSpins}
                      </span>
                    )}
                    <BuyTicket
                      openSuccessfullPayment={() =>
                        setPaymentStatusOpened(true)
                      }
                    >
                      <button className="relative transition-transform active:scale-95">
                        <PlusButtonIcon className="size-5" />
                      </button>
                    </BuyTicket>
                  </div>
                </div>
                <RewardsList>
                  <Button appearance="yellow-linear">{t("Призы")}</Button>
                </RewardsList>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-auto flex w-full items-center gap-2">
            {activeTab === "free" ? (
              <>
                <LargeButton
                  appearance="white"
                  onClick={onStartClick}
                  disabled={
                    oneLocked ||
                    spinsData === undefined ||
                    spinsData.spinsCount === 0
                  }
                >
                  {oneLocked || spinsData === undefined ? (
                    <Loader className="animate-spin" />
                  ) : (
                    t("Спин") + " x1"
                  )}
                </LargeButton>
                {spinsData && spinsData.spinsCount > 1 && (
                  <LargeButton
                    appearance="yellow-linear"
                    onClick={onMultipleStartClick}
                    disabled={
                      multipleLocked ||
                      spinsData === undefined ||
                      spinsData.spinsCount <= 1
                    }
                  >
                    {multipleLocked || spinsData === undefined ? (
                      <Loader className="animate-spin" />
                    ) : (
                      `${t("Спин")} х${spinsData.spinsCount > 9 ? 10 : spinsData.spinsCount}`
                    )}
                  </LargeButton>
                )}
              </>
            ) : (
              <>
                <LargeButton
                  appearance="white"
                  onClick={onStartClick}
                  disabled={
                    oneLocked ||
                    spinsData === undefined ||
                    spinsData.paidSpins === 0
                  }
                >
                  {oneLocked || spinsData === undefined ? (
                    <Loader className="animate-spin" />
                  ) : (
                    t("Спин") + " x1"
                  )}
                </LargeButton>
                {spinsData && spinsData.paidSpins > 1 && (
                  <LargeButton
                    appearance="yellow-linear"
                    onClick={onMultipleStartClick}
                    disabled={
                      multipleLocked ||
                      spinsData === undefined ||
                      spinsData.paidSpins <= 1
                    }
                  >
                    {multipleLocked || spinsData === undefined ? (
                      <Loader className="animate-spin" />
                    ) : (
                      `${t("Спин")} х${spinsData.paidSpins > 9 ? 10 : spinsData.paidSpins}`
                    )}
                  </LargeButton>
                )}
              </>
            )}
          </div>

          {animationReward !== null && (
            <WheelAnimation
              open={wheelOpen}
              setOpen={setWheelOpen}
              openReward={() => {
                setRewardOpen(true)
              }}
              reward={animationReward}
              hideWheel={() => setAnimationReward(null)}
              isPremium={activeTab === "premium"}
            />
          )}

          {multipleAnimationReward !== null && (
            <WheelAnimationMultiple
              open={multipleWheelOpen}
              setOpen={setMultipleWheelOpen}
              openReward={() => {
                setRewardOpenMultiple(true)
              }}
              reward={multipleAnimationReward}
              hideWheel={() => setMultipleAnimationReward(null)}
              isPremium={activeTab === "premium"}
            />
          )}

          {wheelReward !== null && (
            <WheelReward
              open={rewardOpen}
              setOpen={setRewardOpen}
              reward={wheelReward}
            />
          )}

          {wheelRewardMultiple !== null && (
            <WheelRewardMultiple
              open={rewardOpenMultiple}
              setOpen={setRewardOpenMultiple}
              rewards={wheelRewardMultiple}
            />
          )}

          <TicketPaymentStatus
            open={paymentStatusOpened}
            setOpen={setPaymentStatusOpened}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default LuckyNuts
