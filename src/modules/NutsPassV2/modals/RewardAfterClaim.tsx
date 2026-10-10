import { Dispatch, SetStateAction, useEffect } from "react"
import * as Dialog from "@radix-ui/react-alert-dialog"
import { useTranslation } from "react-i18next"

import TokensRewardPNG from "@/assets/passV2/icons/rewards/tokens-reward.png"
import EnergyReward from "@/assets/passV2/icons/rewards/energy-reward.svg?react"
import BoosterXp from "@/assets/passV2/icons/rewards/booster-xp-free.svg?react"
import BoosterFarmDuration from "@/assets/passV2/icons/rewards/booster-farm-duration-free.svg?react"
import BoosterPerSecond from "@/assets/passV2/icons/rewards/booster-per-second-free.svg?react"
import BoosterTokensOncePNG from "@/assets/passV2/icons/rewards/booster-tokens-once.png"
import AssembleNftPNG from "@/assets/passV2/icons/rewards/assemble-nft-premium.png"
import RewardBackgroundPng from "@/assets/wheel/rewards/stars-background.png"

import { LargeButton } from "@/shared/ui/LargeButton"

import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { setIsClaimRewardLocked } from "@/redux/slices/passv2"

import { numberWithSpaces } from "@/utils/numberWithSpaces"

import { cn } from "@/lib/cn"

import {
  BackButton,
  initBackButton,
  RemoveEventListenerFn,
} from "@/demo/telegram-sdk"

let backButton: BackButton

if (true) {
  try {
    const [initializedBackButton] = initBackButton()
    backButton = initializedBackButton
  } catch {
    /* empty */
  }
}

const RewardAfterClaim = ({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}) => {
  const { t } = useTranslation()

  const dispatch = useAppDispatch()

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

  // При закрытии модалки разрешаем клеймить некст награду
  useEffect(() => {
    if (!open) {
      dispatch(setIsClaimRewardLocked(false))
    }
  }, [open])

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal container={document.getElementById("dialogs")}>
        <Dialog.Content className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#17202D]/80 backdrop-blur">
          <Dialog.Title className="sr-only">
            Nuts Pass Reward About Info
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            Nuts Pass Reward About Info
          </Dialog.Description>

          <h2 className="mb-6 font-tt-hoves-expanded text-2xl font-semibold text-white phone-sm-fix:text-[28px]">
            {t("Получено.колесо")}
          </h2>

          <Reward />

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

export default RewardAfterClaim

const Reward = () => {
  const { t } = useTranslation()

  const lang = useAppSelector((state) => state.language.value)
  const reward = useAppSelector((state) => state.passv2.rewardAbout)

  if (reward === null) return

  return (
    <>
      <div className="absolute left-1/2 top-1/2 h-screen w-screen -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,_rgba(224,107,208,1)_0%,_rgba(90,56,129,0.7)_30%,rgba(9,13,18,0.5)_50%)] mix-blend-overlay" />
      <img
        src={RewardBackgroundPng}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mix-blend-screen"
      />

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
            <div className="relative flex size-[140px] items-center justify-center rounded-2xl bg-gradient-to-b from-[#1B1237] to-[#A7A3B2] drop-shadow-[0px_4px_8px_rgba(164,162,225,0.2)] backdrop-blur-sm">
              <div className="absolute inset-px rounded-2xl bg-[#EAEAEA]/30 backdrop-blur-sm" />
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
        {reward.type === "NFT" && "NFT"}
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
