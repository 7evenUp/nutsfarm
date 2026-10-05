import { Dispatch, SetStateAction, useEffect } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { useTranslation } from "react-i18next"

import TokensRewardPNG from "@/assets/passV2/icons/rewards/tokens-reward.png"
import EnergyReward from "@/assets/passV2/icons/rewards/energy-reward.svg?react"
import ArrowRight from "@/assets/passV2/icons/move-right.svg?react"
import BoosterXp from "@/assets/passV2/icons/rewards/booster-xp-free.svg?react"
import BoosterFarmDuration from "@/assets/passV2/icons/rewards/booster-farm-duration-free.svg?react"
import BoosterPerSecond from "@/assets/passV2/icons/rewards/booster-per-second-free.svg?react"
import BoosterTokensOncePNG from "@/assets/passV2/icons/rewards/booster-tokens-once.png"
import AssembleNftPNG from "@/assets/passV2/icons/rewards/assemble-nft-premium.png"
import QuestionIcon from "@/assets/passV2/icons/question-mark-circle.svg?react"
import CloseIcon from "@/assets/icons/close.svg?react"

import { LargeButton } from "@/shared/ui/LargeButton"

import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { setIsBuyLevelOpened } from "@/redux/slices/passv2"

import { numberWithSpaces } from "@/utils/numberWithSpaces"
import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

import { cn } from "@/lib/cn"

import {
  BackButton,
  initBackButton,
  RemoveEventListenerFn,
} from "@telegram-apps/sdk"
import MerchPhotos from "./MerchPhotos"

let backButton: BackButton

if (import.meta.env.VITE_IS_DEV_LOCAL === undefined) {
  try {
    const [initializedBackButton] = initBackButton()
    backButton = initializedBackButton
  } catch {
    /* empty */
  }
}

const RewardInfo = ({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const reward = useAppSelector((state) => state.passv2.rewardAbout)

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
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Content className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050D12]">
          <Dialog.Title className="sr-only">
            Nuts Pass Reward About Info
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            Nuts Pass Reward About Info
          </Dialog.Description>

          <button
            className={cn(
              "absolute right-4 top-4 opacity-70 transition-opacity focus:outline-none active:opacity-100",
            )}
            onClick={() => setOpen(false)}
          >
            <CloseIcon className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </button>

          <Reward />

          <div
            className={cn(
              "fixed inset-x-3.5 flex w-auto flex-col gap-2",
              Telegram.WebApp.platform === "weba"
                ? "bottom-4"
                : "bottom-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
            )}
          >
            {reward?.status === "NOT_ACHIEVED" && (
              <LargeButton
                appearance="yellow-radial"
                onClick={() => {
                  dispatch(setIsBuyLevelOpened(true))
                }}
              >
                {t("Открыть награду")} <ArrowRight />
              </LargeButton>
            )}

            <LargeButton appearance="white" onClick={() => setOpen(false)}>
              {t("К пропуску")}
            </LargeButton>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default RewardInfo

const Reward = () => {
  const { t } = useTranslation()

  const lang = useAppSelector((state) => state.language.value)
  const reward = useAppSelector((state) => state.passv2.rewardAbout)

  if (reward === null) return

  return (
    <>
      {reward.type === "NFT" && (
        <img
          src={reward.image}
          className="size-[100px] rounded-2xl drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]"
        />
      )}
      {reward.type === "TOKENS" && (
        <img src={TokensRewardPNG} className="size-[100px]" />
      )}
      {reward.type === "ENERGY" && (
        <EnergyReward className="size-[100px] text-background/30 drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]" />
      )}
      {reward.type === "BOOSTER" && reward.boost && (
        <>
          {reward.boost.bonusType === "FARMING_DURATION" && (
            <BoosterFarmDuration className="size-[100px] drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]" />
          )}
          {reward.boost.bonusType === "POINTS_ONCE_BONUS" && (
            <img
              src={BoosterTokensOncePNG}
              className="h-[100px] w-auto drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]"
            />
          )}
          {reward.boost.bonusType === "POINTS_PER_SECOND" && (
            <BoosterPerSecond className="size-[100px] drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]" />
          )}
          {reward.boost.bonusType === "XP_BONUS" && (
            <BoosterXp className="size-[100px] drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]" />
          )}
        </>
      )}
      {reward.type === "ASSEMBLE_PART" && reward.assemblePart && (
        <>
          {reward.assemblePart.type === "NFT" && (
            <img
              src={reward.assemblePart.image || AssembleNftPNG}
              className="size-[100px] rounded-2xl drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]"
            />
          )}
          {reward.assemblePart.type === "BOOSTER" && (
            <div className="relative flex size-[140px] items-center justify-center rounded-2xl bg-gradient-to-b from-[#1B1237] to-[#A7A3B2] drop-shadow-[0px_4px_8px_rgba(164,162,225,0.2)]">
              <div className="absolute inset-px rounded-2xl bg-[#4A4F53]" />
              {reward.assemblePart.boost?.bonusType === "FARMING_DURATION" && (
                <BoosterFarmDuration className="size-[100px] drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]" />
              )}
              {reward.assemblePart.boost?.bonusType === "POINTS_ONCE_BONUS" && (
                <img
                  src={BoosterTokensOncePNG}
                  className="h-[100px] w-auto drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]"
                />
              )}
              {reward.assemblePart.boost?.bonusType === "POINTS_PER_SECOND" && (
                <BoosterPerSecond className="size-[100px] drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]" />
              )}
              {reward.assemblePart.boost?.bonusType === "XP_BONUS" && (
                <BoosterXp className="size-[100px] drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]" />
              )}
            </div>
          )}
        </>
      )}

      <h2 className="mt-6 font-tt-hoves-expanded text-xl font-semibold text-white phone-sm-fix:text-2xl">
        {reward.type === "TOKENS" && `${numberWithSpaces(reward.amount)} NUTS`}
        {reward.type === "ENERGY" && t("Энергия")}
        {reward.type === "NFT" && (
          <div className="relative">
            NFT
            {reward.name.includes("Merch NFT") && (
              <MerchPhotos>
                <button
                  className="absolute left-full top-1/2 z-20 flex size-7 -translate-y-1/2 translate-x-4 items-center justify-center rounded-md bg-[#413577]/40"
                  onClick={() => {
                    makeHapticFeedback({ impactOccured: "soft" })
                  }}
                >
                  <QuestionIcon className="size-5" />
                </button>
              </MerchPhotos>
            )}
          </div>
        )}
        {reward.type === "BOOSTER" && t("Бустер")}
        {reward.type === "ASSEMBLE_PART" &&
          reward.assemblePart &&
          (reward.assemblePart.type === "NFT"
            ? t("Часть NFT")
            : t("Часть бустера"))}
      </h2>

      <p className="mt-3.5 w-48 text-balance text-center font-nunito text-sm font-medium text-white/75">
        {reward.type === "TOKENS" && t("Дополнительные NUTS на твой баланс")}
        {reward.type === "ENERGY" && t("Дополнительная энергия для игр")}
        {reward.type === "NFT" &&
          (lang === "RU" ? reward.description : reward.descriptionEn)}
        {reward.type === "BOOSTER" &&
          reward.boost &&
          (lang === "RU"
            ? reward.boost.description
            : reward.boost.descriptionEn)}
        {reward.type === "ASSEMBLE_PART" &&
          reward.assemblePart &&
          (lang === "RU"
            ? reward.assemblePart.description
            : reward.assemblePart.descriptionEn)}
      </p>
    </>
  )
}
