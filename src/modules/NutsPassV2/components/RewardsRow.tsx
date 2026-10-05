import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { RiveFile } from "@rive-app/react-webgl2"
import { FileStatus } from "@rive-app/react-webgl2/dist/types/types"

import GoldLevelBadgePNG from "@/assets/passV2/icons/level-badge-gold.png"
import DisabledLevelBadgePNG from "@/assets/passV2/icons/level-badge-disabled.png"
import RewardBackgroundFree from "@/assets/passV2/icons/reward-background-free.svg?react"
import RewardBackgroundPremium from "@/assets/passV2/icons/reward-background-premium.svg?react"
import LockIcon from "@/assets/passV2/icons/lock.svg?react"
import CheckIcon from "@/assets/passV2/icons/check.svg?react"

import PremiumReward from "./PremiumReward"
import FreeReward from "./FreeReward"
import { SparklesCore } from "./Sparkles"

import BoxReward from "../modals/BoxReward"
import BoxOpening from "../modals/BoxOpening"
import RewardAfterClaim from "../modals/RewardAfterClaim"

import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { useGetCurrentUserQuery } from "@/redux/api/user"
import {
  useClaimPassRewardMutation,
  useGetLevelRewardsInfiniteQuery,
} from "@/redux/api/nutspass"
import { useGetGameEnergyQuery } from "@/redux/api/games"
import {
  useGetAssemblePartsQuery,
  useGetBoostersQuery,
} from "@/redux/api/items"
import { useGetInventoryQuery } from "@/redux/api/inventory"
import {
  setBoxRewards,
  setIsClaimRewardLocked,
  setOpenedBoxStatus,
  setOpenedBoxType,
  setRewardAbout,
} from "@/redux/slices/passv2"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"
import { Sound } from "@/utils/Sound"

import { LevelRewardItem, Reward } from "@/types/nutspass"

import { cn } from "@/lib/cn"

const RewardsRow = ({
  level,
  freeReward,
  premiumReward,
  hasToFetchNew,
  riveFiles,
  sounds,
  openBoxInfo,
  openRewardInfo,
  refetched,
}: {
  level: number
  freeReward: LevelRewardItem | undefined
  premiumReward: LevelRewardItem | undefined
  hasToFetchNew: boolean
  riveFiles: {
    freeBox: RiveFile | null
    premiumBox: RiveFile | null
    freeStatus: FileStatus
    premiumStatus: FileStatus
  }
  sounds: {
    freeSound: Sound
    premiumSound: Sound
    bonusSound: Sound
    coinsSound: Sound
    energySound: Sound
  }
  openBoxInfo: VoidFunction
  openRewardInfo: VoidFunction
  refetched: VoidFunction
}) => {
  const { t } = useTranslation()

  const rowRef = useRef<HTMLDivElement | null>(null)

  const [boxOpen, setBoxOpen] = useState(false)
  const [rewardOpen, setRewardOpen] = useState(false)
  const [claimLocked, setClaimLocked] = useState(false)
  const [boxRewardOpen, setBoxRewardOpen] = useState(false)
  const [boxClaimedReward, setBoxClaimedReward] = useState<Reward | null>(null)
  const [boxType, setBoxType] = useState<"free" | "premium">("free")

  const dispatch = useAppDispatch()
  const { passLevel, isClaimRewardLocked } = useAppSelector(
    (state) => state.passv2,
  )

  const { refetch: refetchInventory } = useGetInventoryQuery()
  const { refetch: refetchBoosters } = useGetBoostersQuery()
  const { refetch: refetchAssembleParts } = useGetAssemblePartsQuery()
  const { data: currentUser, refetch: refetchUser } = useGetCurrentUserQuery()
  const { refetch: refetchEnergy } = useGetGameEnergyQuery()
  const {
    fetchNextPage,
    hasNextPage,
    refetch: refetchRewards,
  } = useGetLevelRewardsInfiniteQuery(undefined)
  const [claimReward] = useClaimPassRewardMutation({
    fixedCacheKey: "pass-reward",
  })

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!rowRef.current) return
    if (!hasToFetchNew) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (hasNextPage) {
            fetchNextPage()
            refetched()
          }
        }
      },
      {
        threshold: 0,
      },
    )

    observer.observe(rowRef.current)

    return () => observer.disconnect()
  }, [rowRef, hasNextPage, fetchNextPage, hasToFetchNew])

  const onFreeRewardClick = async () => {
    if (isClaimRewardLocked) return
    if (claimLocked) return
    if (!freeReward) return

    if (freeReward.status === "NOT_ACHIEVED") {
      makeHapticFeedback({ impactOccured: "soft" })

      if (freeReward.reward.type === "BOX" && freeReward.reward.boxBody) {
        openBoxInfo()
        dispatch(setBoxRewards(freeReward.reward.boxBody))
        dispatch(setOpenedBoxType("free"))
        dispatch(setOpenedBoxStatus(freeReward.status))
        return
      }

      openRewardInfo()
      dispatch(
        setRewardAbout({ ...freeReward.reward, status: freeReward.status }),
      )
      return
    }

    if (freeReward.status === "CLAIMED") {
      makeHapticFeedback({ impactOccured: "soft" })

      if (freeReward.reward.type !== "BOX") return

      if (!freeReward.boxClaimReward) {
        toast.error(t("Ошибка"), {
          description: t("Упс, информация о награде не сохранилась"),
        })
        return
      }
      setBoxType("free")
      setBoxRewardOpen(true)
      setBoxClaimedReward(freeReward.boxClaimReward)
      return
    }

    if (freeReward.status !== "READY_FOR_CLAIM") return

    makeHapticFeedback({ impactOccured: "soft" })
    setClaimLocked(true)
    dispatch(setIsClaimRewardLocked(true))

    const { reward } = freeReward

    try {
      const [claimedReward] = await claimReward({
        rewardId: freeReward.id,
      }).unwrap()
      await refetchRewards()

      makeHapticFeedback({ notificationOccured: "success" })

      // Sounds
      if (reward.type === "TOKENS") sounds.coinsSound.play(false, 0.3)
      else if (reward.type === "ENERGY") sounds.energySound.play(false, 0.2)
      else if (reward.type !== "BOX") sounds.bonusSound.play(false, 0.2)

      if (reward.type === "TOKENS") {
        refetchUser()
        setRewardOpen(true)
        dispatch(
          setRewardAbout({ ...freeReward.reward, status: freeReward.status }),
        )
      } else if (reward.type === "ENERGY") {
        refetchEnergy()
        setRewardOpen(true)
        dispatch(
          setRewardAbout({ ...freeReward.reward, status: freeReward.status }),
        )
      } else if (reward.type === "ASSEMBLE_PART") {
        refetchAssembleParts()
        setRewardOpen(true)
        dispatch(
          setRewardAbout({ ...freeReward.reward, status: freeReward.status }),
        )
      } else if (reward.type === "BOOSTER") {
        refetchBoosters()
        setRewardOpen(true)
        dispatch(
          setRewardAbout({ ...freeReward.reward, status: freeReward.status }),
        )
      } else if (reward.type === "NFT") {
        refetchInventory()
        setRewardOpen(true)
        dispatch(
          setRewardAbout({ ...freeReward.reward, status: freeReward.status }),
        )
      } else if (reward.type === "BOX") {
        setBoxType("free")
        setBoxOpen(true)
        if (claimedReward.type === "TOKENS") {
          refetchUser()
        } else if (claimedReward.type === "ENERGY") {
          refetchEnergy()
        } else if (claimedReward.type === "ASSEMBLE_PART") {
          refetchAssembleParts()
        } else if (claimedReward.type === "BOOSTER") {
          refetchBoosters()
        } else if (claimedReward.type === "NFT") {
          refetchInventory()
        }
      }
    } catch {
      toast.error(t("Ошибка"), {
        description: t("Упс, что-то пошло не так"),
      })
    } finally {
      setClaimLocked(false)
    }
  }

  const onPremiumRewardClick = async () => {
    if (isClaimRewardLocked) return
    if (claimLocked) return
    if (!premiumReward) return
    if (!currentUser) return

    if (!currentUser.isNutPassActive) {
      makeHapticFeedback({ impactOccured: "soft" })

      if (premiumReward.reward.type === "BOX" && premiumReward.reward.boxBody) {
        openBoxInfo()
        dispatch(setBoxRewards(premiumReward.reward.boxBody))
        dispatch(setOpenedBoxType("premium"))
        dispatch(setOpenedBoxStatus(premiumReward.status))
        return
      }

      openRewardInfo()
      dispatch(
        setRewardAbout({
          ...premiumReward.reward,
          status: premiumReward.status,
        }),
      )
      return
    } else {
      if (premiumReward.status === "NOT_ACHIEVED") {
        makeHapticFeedback({ impactOccured: "soft" })

        if (
          premiumReward.reward.type === "BOX" &&
          premiumReward.reward.boxBody
        ) {
          openBoxInfo()
          dispatch(setBoxRewards(premiumReward.reward.boxBody))
          dispatch(setOpenedBoxType("premium"))
          dispatch(setOpenedBoxStatus(premiumReward.status))
          return
        }

        openRewardInfo()
        dispatch(
          setRewardAbout({
            ...premiumReward.reward,
            status: premiumReward.status,
          }),
        )
        return
      }
    }

    if (premiumReward.status === "CLAIMED") {
      makeHapticFeedback({ impactOccured: "soft" })

      if (premiumReward.reward.type !== "BOX") return

      if (!premiumReward.boxClaimReward) {
        toast.error(t("Ошибка"), {
          description: t("Упс, информация о награде не сохранилась"),
        })
        return
      }
      setBoxType("premium")
      setBoxRewardOpen(true)
      setBoxClaimedReward(premiumReward.boxClaimReward)
      return
    }

    if (premiumReward.status !== "READY_FOR_CLAIM") return
    if (!currentUser.isNutPassActive) return

    makeHapticFeedback({ impactOccured: "soft" })
    setClaimLocked(true)
    dispatch(setIsClaimRewardLocked(true))

    const { reward } = premiumReward

    try {
      const [claimedReward] = await claimReward({
        rewardId: premiumReward.id,
      }).unwrap()
      await refetchRewards()

      makeHapticFeedback({ notificationOccured: "success" })

      // Sounds
      if (reward.type === "TOKENS") sounds.coinsSound.play(false, 0.3)
      else if (reward.type === "ENERGY") sounds.energySound.play(false, 0.2)
      else if (reward.type !== "BOX") sounds.bonusSound.play(false, 0.2)

      if (reward.type === "TOKENS") {
        refetchUser()
        setRewardOpen(true)
        dispatch(
          setRewardAbout({
            ...premiumReward.reward,
            status: premiumReward.status,
          }),
        )
      } else if (reward.type === "ENERGY") {
        refetchEnergy()
        setRewardOpen(true)
        dispatch(
          setRewardAbout({
            ...premiumReward.reward,
            status: premiumReward.status,
          }),
        )
      } else if (reward.type === "ASSEMBLE_PART") {
        refetchAssembleParts()
        setRewardOpen(true)
        dispatch(
          setRewardAbout({
            ...premiumReward.reward,
            status: premiumReward.status,
          }),
        )
      } else if (reward.type === "BOOSTER") {
        refetchBoosters()
        setRewardOpen(true)
        dispatch(
          setRewardAbout({
            ...premiumReward.reward,
            status: premiumReward.status,
          }),
        )
      } else if (reward.type === "NFT") {
        refetchInventory()
        setRewardOpen(true)
        dispatch(
          setRewardAbout({
            ...premiumReward.reward,
            status: premiumReward.status,
          }),
        )
      } else if (reward.type === "BOX") {
        setBoxType("premium")
        setBoxOpen(true)
        if (claimedReward.type === "TOKENS") {
          refetchUser()
        } else if (claimedReward.type === "ENERGY") {
          refetchEnergy()
        } else if (claimedReward.type === "ASSEMBLE_PART") {
          refetchAssembleParts()
        } else if (claimedReward.type === "BOOSTER") {
          refetchBoosters()
        } else if (claimedReward.type === "NFT") {
          refetchInventory()
        }
      }
    } catch {
      toast.error(t("Ошибка"), {
        description: t("Упс, что-то пошло не так"),
      })
    } finally {
      setClaimLocked(false)
    }
  }

  if (!currentUser) return null

  const isLevelAvailable = passLevel >= level

  return (
    <>
      <div className="relative flex" ref={rowRef}>
        <button
          className={cn(
            "group relative flex h-[124px] flex-1 items-center justify-center bg-gradient-to-r from-[#3B3170] to-[#6A5CB7]",
            freeReward === undefined ||
              (freeReward.status === "CLAIMED" &&
                freeReward.reward.type !== "BOX")
              ? "pointer-events-none"
              : "transition-shadow active:shadow-[-3px_0_10px_6px_inset_rgba(0,0,0,0.4)]",
            freeReward
              ? freeReward.status === "NOT_ACHIEVED" && "opacity-70"
              : !isLevelAvailable && "opacity-70",
          )}
          onClick={onFreeRewardClick}
        >
          {freeReward && (
            <>
              {freeReward.reward.type === "BOX" && (
                <div
                  className={cn(
                    "absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#B49AF6] to-[#6657B6] to-[110%] transition-opacity group-active:opacity-75",
                    freeReward
                      ? freeReward.status === "NOT_ACHIEVED" &&
                          "from-[#B49AF6]/50 to-[#6657B6]/50"
                      : "from-[#B49AF6]/50 to-[#6657B6]/50",
                  )}
                />
              )}
              <div
                className={cn(
                  "relative scale-90 transition-transform group-active:scale-[0.8] phone-xsm:scale-100 phone-xsm:group-active:scale-95",
                  freeReward
                    ? freeReward.status === "NOT_ACHIEVED" && "opacity-70"
                    : "opacity-70",
                )}
              >
                <div
                  className={cn(
                    freeReward.status === "CLAIMED" && "opacity-30",
                  )}
                >
                  <RewardBackgroundFree className="drop-shadow-[0px_1px_2px_rgba(0,0,0,0.3)]" />
                  <FreeReward
                    isClaimed={freeReward.status === "CLAIMED"}
                    {...freeReward.reward}
                  />
                </div>
                {freeReward.status === "CLAIMED" && (
                  <CheckIcon className="absolute -right-2.5 top-1" />
                )}
              </div>
            </>
          )}
        </button>
        <button
          className={cn(
            "group relative flex h-[124px] flex-1 items-center justify-center bg-gradient-to-r from-[#9743A8] to-[#5F136F]",
            premiumReward === undefined ||
              (premiumReward.status === "CLAIMED" &&
                premiumReward.reward.type !== "BOX")
              ? "pointer-events-none"
              : "transition-shadow active:shadow-[2px_0_10px_6px_inset_rgba(0,0,0,0.4)]",
            premiumReward
              ? premiumReward.status === "NOT_ACHIEVED" && "opacity-70"
              : "opacity-70",
          )}
          onClick={onPremiumRewardClick}
        >
          {premiumReward && (
            <>
              {premiumReward.reward.type === "BOX" && (
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#F7FD94] from-[-50%] to-[#AC5AA8] to-[70%] group-active:opacity-75" />
              )}

              {premiumReward.status === "READY_FOR_CLAIM" &&
                currentUser.isNutPassActive && (
                  <SparklesCore
                    background="transparent"
                    minSize={1.2}
                    maxSize={2}
                    particleDensity={50}
                    className="absolute inset-0 blur-[1px]"
                    particleColor="#FFFFAA"
                  />
                )}

              <div className="relative scale-90 transition-transform group-active:scale-[0.8] phone-xsm:scale-100 phone-xsm:group-active:scale-95">
                <div
                  className={cn(
                    premiumReward.status === "CLAIMED" && "opacity-30",
                  )}
                >
                  <RewardBackgroundPremium className="drop-shadow-[0px_1px_2px_rgba(0,0,0,0.3)]" />
                  <PremiumReward
                    isClaimed={premiumReward.status === "CLAIMED"}
                    {...premiumReward.reward}
                  />
                </div>
                {!currentUser.isNutPassActive && (
                  <LockIcon className="absolute -right-1.5 -top-1" />
                )}
                {premiumReward.status === "CLAIMED" && (
                  <CheckIcon className="absolute -right-2.5 top-1" />
                )}
              </div>
            </>
          )}
        </button>

        <div className="absolute inset-y-0 left-1/2 w-2 -translate-x-1/2 border-x border-[#2D1A53] bg-[#453A7D]" />

        {/* Полоска посередине */}
        {isLevelAvailable && (
          <div
            className={cn(
              "absolute inset-y-0 left-1/2 w-2 -translate-x-1/2 bg-gradient-to-r from-[#FEE422] to-[#FA9B39]",
              passLevel === level && "bottom-[2.5px] top-0",
            )}
          />
        )}

        {/* Полоска-тень */}
        <div className="absolute bottom-0 h-px w-full bg-[#E9E4F2]/20" />
        <div className="absolute bottom-[0.5px] h-0.5 w-full bg-[#130C21]/40" />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {isLevelAvailable ? (
            <img src={GoldLevelBadgePNG} className="h-auto w-[45px]" />
          ) : (
            <img src={DisabledLevelBadgePNG} className="h-auto w-[45px]" />
          )}
          <span
            className={cn(
              "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-tt-hoves-expanded font-medium",
              isLevelAvailable ? "text-[#050D12]" : "text-[#C3B7FF]",
            )}
          >
            {level}
          </span>
        </div>
      </div>

      <BoxOpening
        open={boxOpen}
        setOpen={setBoxOpen}
        boxType={boxType}
        riveFiles={riveFiles}
        sounds={sounds}
      />

      <BoxReward
        open={boxRewardOpen}
        setOpen={setBoxRewardOpen}
        boxType={boxType}
        rewardData={boxClaimedReward}
        riveFiles={riveFiles}
        sounds={sounds}
      />

      <RewardAfterClaim open={rewardOpen} setOpen={setRewardOpen} />
    </>
  )
}

export default RewardsRow
