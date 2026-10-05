import {
  Dispatch,
  SetStateAction,
  useEffect,
  useLayoutEffect,
  useState,
} from "react"
import { RiveFile, useRive } from "@rive-app/react-webgl2"
import { FileStatus } from "@rive-app/react-webgl2/dist/types/types"
import { Description } from "@radix-ui/react-dialog"
import { useTranslation } from "react-i18next"
import { motion } from "framer-motion"

import Loader from "@/assets/icons/loader.svg?react"
import TokensRewardPNG from "@/assets/passV2/icons/rewards/tokens-reward.png"
import EnergyReward from "@/assets/passV2/icons/rewards/energy-reward.svg?react"
import BoosterXp from "@/assets/passV2/icons/rewards/booster-xp-free.svg?react"
import BoosterFarmDuration from "@/assets/passV2/icons/rewards/booster-farm-duration-premium.svg?react"
import BoosterPerSecond from "@/assets/passV2/icons/rewards/booster-per-second-premium.svg?react"
import BoosterTokensOncePNG from "@/assets/passV2/icons/rewards/booster-tokens-once.png"
import AssembleNftPNG from "@/assets/passV2/icons/rewards/assemble-nft-premium.png"

import { Dialog, DialogContent, DialogHeader } from "@/shared/ui/Dialog"
import { LargeButton } from "@/shared/ui/LargeButton"

import { useClaimPassRewardMutation } from "@/redux/api/nutspass"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { setIsClaimRewardLocked } from "@/redux/slices/passv2"

import { Sound } from "@/utils/Sound"
import { numberWithSpaces } from "@/utils/numberWithSpaces"

import { cn } from "@/lib/cn"

const BoxOpening = ({
  open,
  setOpen,
  boxType,
  riveFiles,
  sounds,
}: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  boxType: "free" | "premium"
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

  const dispatch = useAppDispatch()
  const lang = useAppSelector((state) => state.language.value)

  const [, { data: claimedData, reset }] = useClaimPassRewardMutation({
    fixedCacheKey: "pass-reward",
  })

  // При закрытии модалки разрешаем клеймить некст награду
  useEffect(() => {
    if (!open) {
      dispatch(setIsClaimRewardLocked(false))
    }
  }, [open])

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
          Opening Nuts Pass Box modal
        </DialogHeader>
        <Description className="sr-only">
          Opening Nuts Pass Box modal
        </Description>

        <div className="relative flex h-screen w-screen flex-col items-center justify-center gap-10">
          {isLoading ? (
            <Loader className="h-32 w-32 animate-spin" />
          ) : (
            <>
              <motion.div
                initial={{ scale: 1, y: 0, opacity: 1 }}
                animate={{ scale: 0.7, y: 170, opacity: 0.7 }}
                transition={{ delay: 1.9 }}
                className="absolute top-1/2"
              >
                {boxType === "free" && riveFiles.freeBox && (
                  <FreeAnimation riveFile={riveFiles.freeBox} />
                )}
                {boxType === "premium" && riveFiles.premiumBox && (
                  <PremiumAnimation riveFile={riveFiles.premiumBox} />
                )}
              </motion.div>

              {claimedData && (
                <motion.div
                  initial={{ scale: 0.1, opacity: 0, rotate: 180 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ delay: 2 }}
                  className="relative mb-40 flex h-[300px] w-[300px] flex-col items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#231436]/90 to-transparent to-[70%]"
                >
                  <motion.h1
                    initial={{ scale: 0, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ delay: 2.1 }}
                    className="mb-6 font-tt-hoves-expanded text-2xl font-semibold text-white"
                  >
                    {t("Получено")}
                  </motion.h1>

                  {claimedData[0].type === "TOKENS" && (
                    <img src={TokensRewardPNG} className="size-[100px]" />
                  )}
                  {claimedData[0].type === "ENERGY" && (
                    <EnergyReward className="size-[100px] text-background/30 drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]" />
                  )}
                  {claimedData[0].type === "BOOSTER" &&
                    claimedData[0].boost && (
                      <>
                        {claimedData[0].boost.bonusType ===
                          "FARMING_DURATION" && (
                          <BoosterFarmDuration className="size-[100px] drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]" />
                        )}
                        {claimedData[0].boost.bonusType ===
                          "POINTS_ONCE_BONUS" && (
                          <img
                            src={BoosterTokensOncePNG}
                            className="h-[100px] w-auto drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]"
                          />
                        )}
                        {claimedData[0].boost.bonusType ===
                          "POINTS_PER_SECOND" && (
                          <BoosterPerSecond className="size-[100px] drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]" />
                        )}
                        {claimedData[0].boost.bonusType === "XP_BONUS" && (
                          <BoosterXp className="size-[100px] drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]" />
                        )}
                      </>
                    )}
                  {claimedData[0].type === "ASSEMBLE_PART" &&
                    claimedData[0].assemblePart && (
                      <>
                        {claimedData[0].assemblePart.type === "NFT" && (
                          <img
                            src={AssembleNftPNG}
                            className="size-[100px] drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]"
                          />
                        )}
                        {claimedData[0].assemblePart.boost?.bonusType ===
                          "FARMING_DURATION" && (
                          <BoosterFarmDuration className="size-[100px] drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]" />
                        )}
                        {claimedData[0].assemblePart.boost?.bonusType ===
                          "POINTS_ONCE_BONUS" && (
                          <img
                            src={BoosterTokensOncePNG}
                            className="h-[100px] w-auto drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]"
                          />
                        )}
                        {claimedData[0].assemblePart.boost?.bonusType ===
                          "POINTS_PER_SECOND" && (
                          <BoosterPerSecond className="size-[100px] drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]" />
                        )}
                        {claimedData[0].assemblePart.boost?.bonusType ===
                          "XP_BONUS" && (
                          <BoosterXp className="size-[100px] drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]" />
                        )}
                      </>
                    )}
                  {claimedData[0].type === "NFT" && (
                    <img
                      className="h-[100px] w-auto rounded-xl"
                      src={claimedData[0].image}
                    />
                  )}

                  <motion.h2
                    initial={{ scale: 0, opacity: 0, y: -50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ delay: 2.2 }}
                    className="mb-4 mt-6 font-tt-hoves-expanded text-xl font-semibold text-white drop-shadow-[0px_1px_1px_rgba(0,0,0,1)] phone-sm-fix:text-2xl"
                  >
                    {claimedData[0].type === "TOKENS" &&
                      `${numberWithSpaces(claimedData[0].amount)} NUTS`}
                    {claimedData[0].type === "ENERGY" && t("Энергия")}
                    {claimedData[0].type === "NFT" && "NFT"}
                    {claimedData[0].type === "BOOSTER" && t("Бустер")}
                    {claimedData[0].type === "ASSEMBLE_PART" &&
                      claimedData[0].assemblePart &&
                      (claimedData[0].assemblePart.type === "NFT"
                        ? t("Часть NFT")
                        : t("Часть бустера"))}
                  </motion.h2>

                  <motion.p
                    initial={{ scale: 0, opacity: 0, y: -100 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ delay: 2.25 }}
                    className="w-48 text-balance text-center font-nunito text-sm font-medium text-white/75"
                  >
                    {claimedData[0].type === "TOKENS" &&
                      t("Дополнительные NUTS на твой баланс")}
                    {claimedData[0].type === "ENERGY" &&
                      t("Дополнительная энергия для игр")}
                    {claimedData[0].type === "NFT" && t("Проверь инвентарь")}
                    {claimedData[0].type === "BOOSTER" &&
                      claimedData[0].boost &&
                      (lang === "RU"
                        ? claimedData[0].boost.description
                        : claimedData[0].boost.descriptionEn)}
                    {claimedData[0].type === "ASSEMBLE_PART" &&
                      claimedData[0].assemblePart &&
                      (lang === "RU"
                        ? claimedData[0].assemblePart.description
                        : claimedData[0].assemblePart.descriptionEn)}
                  </motion.p>
                </motion.div>
              )}
            </>
          )}
        </div>

        {open && !isLoading && (
          <motion.div
            initial={{ y: 200 }}
            animate={{ y: 0 }}
            transition={{ delay: 2 }}
            className={cn(
              "absolute inset-x-3.5 w-auto phone-sm-fix:inset-x-4",
              Telegram.WebApp.platform === "weba"
                ? "bottom-4"
                : "bottom-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
            )}
          >
            <LargeButton
              appearance="yellow-linear"
              onClick={() => {
                setOpen(false)
                setTimeout(() => {
                  reset()
                }, 100)
              }}
            >
              {t("Забрать")}
            </LargeButton>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default BoxOpening

export const FreeAnimation = ({ riveFile }: { riveFile: RiveFile }) => {
  const { RiveComponent, rive } = useRive({
    riveFile,
    autoplay: true,
  })

  useEffect(() => {
    if (!rive) return
    rive.play()
    setTimeout(() => rive.pause(), 2500)
  }, [rive])

  return (
    <RiveComponent className="absolute left-1/2 top-1/2 aspect-video h-[400px] -translate-x-1/2 -translate-y-3/4" />
  )
}

export const PremiumAnimation = ({ riveFile }: { riveFile: RiveFile }) => {
  const { RiveComponent, rive } = useRive({
    riveFile,
    autoplay: true,
  })

  useEffect(() => {
    if (!rive) return
    rive.play()
    setTimeout(() => rive.pause(), 2500)
  }, [rive])

  return (
    <RiveComponent className="absolute left-1/2 top-1/2 aspect-video h-[400px] -translate-x-1/2 -translate-y-3/4" />
  )
}
