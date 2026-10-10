import { Dispatch, SetStateAction, useEffect } from "react"
import { Description, Title } from "@radix-ui/react-dialog"
import { useTranslation } from "react-i18next"

import FreeBoxPNG from "@/assets/passV2/images/free-box-modal-background.png"
import PremiumBoxPNG from "@/assets/passV2/images/premium-box-modal-background.png"

import TokensRewardPNG from "@/assets/passV2/icons/rewards/tokens-reward.png"
import EnergyReward from "@/assets/passV2/icons/rewards/energy-reward.svg?react"
import BoosterXp from "@/assets/passV2/icons/rewards/booster-xp-free.svg?react"
import BoosterFarmDuration from "@/assets/passV2/icons/rewards/booster-farm-duration-free.svg?react"
import BoosterPerSecond from "@/assets/passV2/icons/rewards/booster-per-second-free.svg?react"
import BoosterTokensOncePNG from "@/assets/passV2/icons/rewards/booster-tokens-once.png"
import ArrowRight from "@/assets/passV2/icons/move-right.svg?react"
import CloseIcon from "@/assets/icons/close.svg?react"

import { Sheet, SheetContent } from "@/shared/ui/SideSheet"
import { LargeButton } from "@/shared/ui/LargeButton"

import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { setIsBuyLevelOpened, setRewardAbout } from "@/redux/slices/passv2"

import { Reward } from "@/types/nutspass"

import {
  BackButton,
  initBackButton,
  RemoveEventListenerFn,
} from "@/demo/telegram-sdk"
import { cn } from "@/lib/cn"

let backButton: BackButton

if (true) {
  try {
    const [initializedBackButton] = initBackButton()
    backButton = initializedBackButton
  } catch {
    /* empty */
  }
}

const BoxInfo = ({
  open,
  setOpen,
  openRewardInfo,
}: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  openRewardInfo: VoidFunction
}) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const { boxRewards, openedBoxType, openedBoxStatus } = useAppSelector(
    (state) => state.passv2,
  )

  // TMA Back Button
  useEffect(() => {
    if (!backButton) return

    let rmListener: RemoveEventListenerFn
    if (open) {
      backButton.show()
      rmListener = backButton.on("click", () => {
        setOpen(false)
      })
    } else {
      backButton.hide()
    }

    return () => {
      if (rmListener) {
        rmListener()
      }
    }
  }, [open])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        className={cn(
          "gap-0 overflow-y-auto rounded-t-none bg-[#20142D] px-0 pb-20 pt-[44px] h-screen-700:pt-12",
          Telegram.WebApp.initData ? "h-screen" : "h-[100svh]",
        )}
      >
        <Title className="sr-only">Box Info Modal</Title>
        <Description className="sr-only">Box Info Modal</Description>

        <button
          className={cn(
            "absolute right-4 top-4 z-10 opacity-70 transition-opacity focus:outline-none active:opacity-100",
          )}
          onClick={() => setOpen(false)}
        >
          <CloseIcon className="h-6 w-6" />
          <span className="sr-only">Close</span>
        </button>

        <img
          src={openedBoxType === "free" ? FreeBoxPNG : PremiumBoxPNG}
          className="absolute right-0"
        />

        <div className="fixed inset-0 bg-[radial-gradient(circle_at_120%_-30%,_var(--tw-gradient-stops))] from-[#5B40A0]/70 from-[-50%] to-[#141A2D]/70 to-[50%]" />

        <div className="pointer-events-none fixed inset-0 bottom-0 top-auto z-10 h-28 bg-gradient-to-b from-[#544871]/0 to-[#050D12]" />

        <h2 className="relative mx-auto mb-[18px] flex items-center gap-2 bg-gradient-to-b from-[#FFFFFF] to-[#E6DDFF] bg-clip-text text-center font-tt-hoves-expanded text-xl font-semibold text-white phone-sm-fix:mb-6 phone-sm-fix:text-2xl">
          {t("Содержимое бокса")}
        </h2>

        <p className="relative mb-9 text-balance px-10 text-center text-xs font-medium text-white/75 phone-sm-fix:mb-14 phone-sm-fix:text-sm">
          {t("Получи одну случайную награду из содержимого этого бокса")}
        </p>

        <div className="relative flex flex-col gap-2 px-3.5">
          {boxRewards.map((i) => (
            <BoxItem key={i.id} reward={i} openRewardInfo={openRewardInfo} />
          ))}
        </div>

        <div
          className={cn(
            "fixed inset-x-3.5 z-50 flex w-auto flex-col gap-2",
            Telegram.WebApp.platform === "weba"
              ? "bottom-4"
              : "bottom-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
          )}
        >
          {openedBoxStatus === "NOT_ACHIEVED" && (
            <LargeButton
              appearance="yellow-radial"
              onClick={() => {
                dispatch(setIsBuyLevelOpened(true))
              }}
            >
              {t("Открыть награду")} <ArrowRight />
            </LargeButton>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default BoxInfo

const BoxItem = ({
  reward,
  openRewardInfo,
}: {
  reward: Reward
  openRewardInfo: VoidFunction
}) => {
  const {
    name,
    nameEn,
    description,
    descriptionEn,
    type,
    amount,
    assemblePart,
    boost,
    image,
  } = reward

  const dispatch = useAppDispatch()
  const lang = useAppSelector((state) => state.language.value)

  return (
    <button
      className="flex h-[76px] items-center gap-4 rounded-[10px] border border-[#050D12]/40 bg-gradient-to-r from-[#31235C]/70 to-[#3D3068]/70 pl-2 pr-3.5 text-left"
      onClick={() => {
        openRewardInfo()
        dispatch(setRewardAbout(reward))
      }}
    >
      <div className="relative h-[60px] w-[60px] shrink-0 rounded bg-[#EAEAEA]/30">
        {type === "ENERGY" && (
          <EnergyReward className="absolute left-1/2 top-1/2 h-10 w-auto -translate-x-1/2 -translate-y-1/2 text-[#050D12]/60 drop-shadow-[0px_1px_2px_rgba(0,0,0,0.25)]" />
        )}
        {type === "TOKENS" && (
          <img
            src={TokensRewardPNG}
            className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2"
          />
        )}
        {type === "ASSEMBLE_PART" && assemblePart && (
          <>
            {assemblePart.boost?.bonusType === "FARMING_DURATION" && (
              <BoosterFarmDuration className="absolute left-1/2 top-1/2 h-10 w-auto -translate-x-1/2 -translate-y-1/2 drop-shadow-[0px_1px_2px_rgba(0,0,0,0.25)]" />
            )}
            {assemblePart.boost?.bonusType === "POINTS_ONCE_BONUS" && (
              <img
                src={BoosterTokensOncePNG}
                className="absolute left-1/2 top-1/2 h-10 w-auto -translate-x-1/2 -translate-y-1/2 drop-shadow-[0px_1px_2px_rgba(0,0,0,0.25)]"
              />
            )}
            {assemblePart.boost?.bonusType === "POINTS_PER_SECOND" && (
              <BoosterPerSecond className="absolute left-1/2 top-1/2 h-10 w-auto -translate-x-1/2 -translate-y-1/2 drop-shadow-[0px_1px_2px_rgba(0,0,0,0.25)]" />
            )}
            {assemblePart.boost?.bonusType === "XP_BONUS" && (
              <BoosterXp className="absolute left-1/2 top-1/2 h-10 w-auto -translate-x-1/2 -translate-y-1/2 drop-shadow-[0px_1px_2px_rgba(0,0,0,0.25)]" />
            )}
          </>
        )}
        {type === "BOOSTER" && boost && (
          <>
            {boost.bonusType === "FARMING_DURATION" && (
              <BoosterFarmDuration className="absolute left-1/2 top-1/2 h-10 w-auto -translate-x-1/2 -translate-y-1/2 drop-shadow-[0px_1px_2px_rgba(0,0,0,0.25)]" />
            )}
            {boost.bonusType === "POINTS_ONCE_BONUS" && (
              <img
                src={BoosterTokensOncePNG}
                className="absolute left-1/2 top-1/2 h-10 w-auto -translate-x-1/2 -translate-y-1/2 drop-shadow-[0px_1px_2px_rgba(0,0,0,0.25)]"
              />
            )}
            {boost.bonusType === "POINTS_PER_SECOND" && (
              <BoosterPerSecond className="absolute left-1/2 top-1/2 h-10 w-auto -translate-x-1/2 -translate-y-1/2 drop-shadow-[0px_1px_2px_rgba(0,0,0,0.25)]" />
            )}
            {boost.bonusType === "XP_BONUS" && (
              <BoosterXp className="absolute left-1/2 top-1/2 h-10 w-auto -translate-x-1/2 -translate-y-1/2 drop-shadow-[0px_1px_2px_rgba(0,0,0,0.25)]" />
            )}
          </>
        )}
        {type === "NFT" && (
          <img
            className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 rounded drop-shadow-[0px_1px_2px_rgba(0,0,0,0.25)]"
            src={image}
          />
        )}
        <span className="absolute bottom-0 right-0 translate-x-1 translate-y-2 text-base font-extrabold drop-shadow-[0px_1px_1px_rgba(0,0,0,0.4)] [text-shadow:0.6px_0.6px_0.1px_#050D12,-0.6px_0.6px_0.1px_#050D12,0.6px_-0.6px_0.1px_#050D12,-0.6px_-0.6px_0.1px_#050D12]">
          {type !== "TOKENS" && `x${amount}`}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="line-clamp-1 font-tt-hoves-expanded text-sm font-medium text-white">
          {lang === "RU" ? name : nameEn}
        </h3>
        <p className="line-clamp-1 text-xs font-medium text-[#E9DEFF]">
          {lang === "RU" ? description : descriptionEn}
        </p>
      </div>
    </button>
  )
}
