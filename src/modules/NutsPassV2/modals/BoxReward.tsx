import {
  Dispatch,
  SetStateAction,
  useEffect,
  useLayoutEffect,
  useState,
} from "react"
import { RiveFile } from "@rive-app/react-webgl2"
import { FileStatus } from "@rive-app/react-webgl2/dist/types/types"
import { Description } from "@radix-ui/react-dialog"
import { useTranslation } from "react-i18next"

import Loader from "@/assets/icons/loader.svg?react"
import TokensRewardPNG from "@/assets/passV2/icons/rewards/tokens-reward.png"
import EnergyReward from "@/assets/passV2/icons/rewards/energy-reward.svg?react"
import BoosterXp from "@/assets/passV2/icons/rewards/booster-xp-free.svg?react"
import BoosterFarmDuration from "@/assets/passV2/icons/rewards/booster-farm-duration-premium.svg?react"
import BoosterPerSecond from "@/assets/passV2/icons/rewards/booster-per-second-premium.svg?react"
import BoosterTokensOncePNG from "@/assets/passV2/icons/rewards/booster-tokens-once.png"
import AssembleNftPNG from "@/assets/passV2/icons/rewards/assemble-nft-premium.png"

import { FreeAnimation, PremiumAnimation } from "./BoxOpening"

import { Dialog, DialogContent, DialogHeader } from "@/shared/ui/Dialog"
import { LargeButton } from "@/shared/ui/LargeButton"

import { useAppSelector } from "@/redux/hooks"

import { Sound } from "@/utils/Sound"
import { numberWithSpaces } from "@/utils/numberWithSpaces"

import { Reward } from "@/types/nutspass"

import { cn } from "@/lib/cn"

const BoxReward = ({
  open,
  setOpen,
  boxType,
  rewardData,
  riveFiles,
  sounds,
}: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  boxType: "free" | "premium"
  rewardData: Reward | null
  riveFiles: {
    freeBox: RiveFile | null
    premiumBox: RiveFile | null
    freeStatus: FileStatus
    premiumStatus: FileStatus
  }
  sounds: {
    freeSound: Sound
    premiumSound: Sound
  }
}) => {
  const { t } = useTranslation()

  const [isLoading, setIsLoading] = useState(true)

  const lang = useAppSelector((state) => state.language.value)

  // Определение правильной музыки открытия бокса
  useEffect(() => {
    if (!isLoading && open) {
      setTimeout(() => {
        if (boxType === "free") sounds.freeSound.play(false, 0.1)
        if (boxType === "premium") sounds.premiumSound.play(false, 0.1)
      }, 300)
    }
  }, [open, isLoading])

  // Загрузка rive анимаций
  useLayoutEffect(() => {
    if (
      riveFiles.freeStatus === "success" &&
      riveFiles.premiumStatus === "success"
    ) {
      setIsLoading(false)
    }
  }, [riveFiles])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="items-center overflow-hidden rounded-t-none p-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-top-0 data-[state=open]:slide-in-from-top-0"
        onEscapeKeyDown={(evt) => evt.preventDefault()}
        onPointerDownOutside={(evt) => evt.preventDefault()}
        onInteractOutside={(evt) => evt.preventDefault()}
      >
        <DialogHeader className="sr-only">
          Claimed Box Reward modal
        </DialogHeader>
        <Description className="sr-only">Claimed Box Reward modal</Description>

        <div className="relative flex h-screen w-screen flex-col items-center justify-center gap-10">
          {isLoading ? (
            <Loader className="h-32 w-32 animate-spin" />
          ) : (
            <>
              <div className="absolute bottom-[100px] top-1/2 scale-75">
                {boxType === "free" && riveFiles.freeBox && (
                  <FreeAnimation riveFile={riveFiles.freeBox} />
                )}
                {boxType === "premium" && riveFiles.premiumBox && (
                  <PremiumAnimation riveFile={riveFiles.premiumBox} />
                )}
              </div>

              {rewardData && (
                <div className="relative mb-60 flex h-[300px] w-[300px] flex-col items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#231436]/90 to-transparent to-[70%]">
                  <h1 className="mb-6 font-tt-hoves-expanded text-2xl font-semibold text-white">
                    {t("Получено")}
                  </h1>

                  {rewardData.type === "TOKENS" && (
                    <img src={TokensRewardPNG} className="size-[100px]" />
                  )}
                  {rewardData.type === "ENERGY" && (
                    <EnergyReward className="size-[100px] text-background/30 drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]" />
                  )}
                  {rewardData.type === "BOOSTER" && rewardData.boost && (
                    <>
                      {rewardData.boost.bonusType === "FARMING_DURATION" && (
                        <BoosterFarmDuration className="size-[100px] drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]" />
                      )}
                      {rewardData.boost.bonusType === "POINTS_ONCE_BONUS" && (
                        <img
                          src={BoosterTokensOncePNG}
                          className="h-[100px] w-auto drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]"
                        />
                      )}
                      {rewardData.boost.bonusType === "POINTS_PER_SECOND" && (
                        <BoosterPerSecond className="size-[100px] drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]" />
                      )}
                      {rewardData.boost.bonusType === "XP_BONUS" && (
                        <BoosterXp className="size-[100px] drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]" />
                      )}
                    </>
                  )}
                  {rewardData.type === "ASSEMBLE_PART" &&
                    rewardData.assemblePart && (
                      <>
                        {rewardData.assemblePart.type === "NFT" && (
                          <img
                            src={AssembleNftPNG}
                            className="size-[100px] drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]"
                          />
                        )}
                        {rewardData.assemblePart.boost?.bonusType ===
                          "FARMING_DURATION" && (
                          <BoosterFarmDuration className="size-[100px] drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]" />
                        )}
                        {rewardData.assemblePart.boost?.bonusType ===
                          "POINTS_ONCE_BONUS" && (
                          <img
                            src={BoosterTokensOncePNG}
                            className="h-[100px] w-auto drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]"
                          />
                        )}
                        {rewardData.assemblePart.boost?.bonusType ===
                          "POINTS_PER_SECOND" && (
                          <BoosterPerSecond className="size-[100px] drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]" />
                        )}
                        {rewardData.assemblePart.boost?.bonusType ===
                          "XP_BONUS" && (
                          <BoosterXp className="size-[100px] drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]" />
                        )}
                      </>
                    )}
                  {rewardData.type === "NFT" && (
                    <img
                      className="h-[100px] w-auto rounded-xl"
                      src={rewardData.image}
                    />
                  )}

                  <h2 className="mb-4 mt-6 font-tt-hoves-expanded text-xl font-semibold text-white drop-shadow-[0px_1px_1px_rgba(0,0,0,1)] phone-sm-fix:text-2xl">
                    {rewardData.type === "TOKENS" &&
                      `${numberWithSpaces(rewardData.amount)} NUTS`}
                    {rewardData.type === "ENERGY" && t("Энергия")}
                    {rewardData.type === "NFT" && "NFT"}
                    {rewardData.type === "BOOSTER" && t("Бустер")}
                    {rewardData.type === "ASSEMBLE_PART" &&
                      rewardData.assemblePart &&
                      (rewardData.assemblePart.type === "NFT"
                        ? t("Часть NFT")
                        : t("Часть бустера"))}
                  </h2>

                  <p className="w-48 text-balance text-center font-nunito text-sm font-medium text-white/75">
                    {rewardData.type === "TOKENS" &&
                      t("Дополнительные NUTS на твой баланс")}
                    {rewardData.type === "ENERGY" &&
                      t("Дополнительная энергия для игр")}
                    {rewardData.type === "NFT" && t("Проверь инвентарь")}
                    {rewardData.type === "BOOSTER" &&
                      rewardData.boost &&
                      (lang === "RU"
                        ? rewardData.boost.description
                        : rewardData.boost.descriptionEn)}
                    {rewardData.type === "ASSEMBLE_PART" &&
                      rewardData.assemblePart &&
                      (lang === "RU"
                        ? rewardData.assemblePart.description
                        : rewardData.assemblePart.descriptionEn)}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {open && !isLoading && (
          <div
            className={cn(
              "absolute inset-x-3.5 w-auto phone-sm-fix:inset-x-4",
              Telegram.WebApp.platform === "weba"
                ? "bottom-4"
                : "bottom-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
            )}
          >
            <LargeButton
              appearance="white"
              onClick={() => {
                setOpen(false)
              }}
            >
              {t("К пропуску")}
            </LargeButton>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default BoxReward
