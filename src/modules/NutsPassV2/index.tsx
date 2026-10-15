import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useRiveFile } from "@rive-app/react-webgl2"

import DisabledLevelBadgePNG from "@/assets/passV2/icons/level-badge-disabled.png"
// import EndOfFreeLevelIcon from "@/assets/passV2/icons/end-of-free-level.svg?react"

import BoxInfo from "./modals/BoxInfo"
import RewardInfo from "./modals/RewardInfo"
import BuyLevels from "./modals/buy-levels"
import BuyLevelsPaymentStatus from "./modals/BuyLevelsPaymentStatus"

import BelowNavPlaceholder from "./components/BelowNavPlaceholder"
import PassHeader from "./components/PassHeader"
import RewardsRow from "./components/RewardsRow"
import TopBadges from "./components/TopBadges"

import {
  useGetLevelRewardsInfiniteQuery,
  useHidePassNotificationMutation,
} from "@/redux/api/nutspass"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { setIsBuyLevelOpened } from "@/redux/slices/passv2"
import { useGetCurrentUserQuery, useSendPushMutation } from "@/redux/api/user"

import { Sound } from "@/utils/Sound"
import { sendMetrika } from "@/utils/sendMetrika"

import { LevelRewardItem } from "@/types/nutspass"

import { cn } from "@/lib/cn"

const freeSound = new Sound("/sounds/nutspass/free-opening.mp3")
const premiumSound = new Sound("/sounds/nutspass/premium-opening.mp3")
const bonusSound = new Sound("/sounds/nutspass/bonus-claimed.mp3")
const coinsSound = new Sound("/sounds/nutspass/coins-claimed.mp3")
const energySound = new Sound("/sounds/nutspass/energy-claimed.mp3")

const NutsPassV2 = () => {
  const dispatch = useAppDispatch()

  const maxFreeLevelBlockRef = useRef<HTMLDivElement | null>(null)
  const firstClaimableRef = useRef<HTMLDivElement>(null)
  const isInitialMount = useRef(true)
  const metrikaWasSent = useRef(false)

  const [boxOpen, setBoxOpen] = useState(false)
  const [reachedRow, setReachedRow] = useState(false)
  const [rewardInfoOpen, setRewardInfoOpen] = useState(false)
  const [paymentStatusOpen, setPaymentStatusOpen] = useState(false)

  const { isBuyLevelOpened } = useAppSelector((state) => state.passv2)

  const { data: levelRewards, isLoading: isLevelsLoading } =
    useGetLevelRewardsInfiniteQuery(undefined)
  const { data: currentUser } = useGetCurrentUserQuery()
  const [sendPush] = useSendPushMutation()
  const [hideNotification] = useHidePassNotificationMutation()

  const { riveFile: freeBox, status: freeStatus } = useRiveFile({
    src: "/box-free.riv",
  })
  const { riveFile: premiumBox, status: premiumStatus } = useRiveFile({
    src: "/box-premium.riv",
  })

  // const { passLevel } = useAppSelector((state) => state.passv2)

  useLayoutEffect(() => {
    freeSound.load()
    premiumSound.load()
    bonusSound.load()
    coinsSound.load()
    energySound.load()
  }, [])

  useEffect(() => {
    if (!currentUser) return

    if (!currentUser.isNutPassStartPushReceived) sendPush()
    if (currentUser.isNewNutPassReward) hideNotification()
  }, [currentUser])

  const groupedByLevelRewards = useMemo(() => {
    if (!levelRewards) return null

    const flatedRewards = levelRewards.pages.flatMap((r) => r.items)
    if (flatedRewards.length === 0) return null

    const uniqueLevels = new Set<number>()

    flatedRewards.forEach((reward) => uniqueLevels.add(reward.level))

    const resultArray: {
      level: number
      freeReward: LevelRewardItem | undefined
      premiumReward: LevelRewardItem | undefined
    }[] = []

    Array.from(uniqueLevels).forEach((uniqueLevel) => {
      const freeReward = flatedRewards.find(
        (reward) => reward.level === uniqueLevel && !reward.isNutPassRequired,
      )
      const premiumReward = flatedRewards.find(
        (reward) => reward.level === uniqueLevel && reward.isNutPassRequired,
      )

      resultArray.push({
        level: uniqueLevel,
        freeReward,
        premiumReward,
      })
    })

    return resultArray
  }, [levelRewards])

  const firstClaimableReward: number | string | null = useMemo(() => {
    if (!groupedByLevelRewards) return null
    if (!isInitialMount.current) return null

    if (reachedRow) return null

    for (const levelReward of groupedByLevelRewards) {
      if (levelReward.freeReward && levelReward.freeReward.status !== "CLAIMED")
        return levelReward.level
      if (
        levelReward.premiumReward &&
        currentUser?.isNutPassActive === true &&
        levelReward.premiumReward.status !== "CLAIMED"
      )
        return levelReward.level
    }

    // На случай если все получено в пакете данных итерации пагинации
    return groupedByLevelRewards[
      groupedByLevelRewards.length - 1
    ].level.toString()
  }, [groupedByLevelRewards])

  useEffect(() => {
    if (
      isInitialMount.current &&
      firstClaimableReward &&
      firstClaimableRef.current
    ) {
      const timer = setTimeout(() => {
        firstClaimableRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })
        isInitialMount.current = false

        if (typeof firstClaimableReward === "number") setReachedRow(true)
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [firstClaimableReward])

  // Observer For Metrika
  useEffect(() => {
    if (!maxFreeLevelBlockRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!metrikaWasSent.current) {
            sendMetrika("40lvl_pass_scroll_down")

            metrikaWasSent.current = true
          }
        }
      },
      {
        threshold: 0,
      },
    )

    observer.observe(maxFreeLevelBlockRef.current)

    return () => observer.disconnect()
  }, [maxFreeLevelBlockRef, groupedByLevelRewards])

  const onRefetched = () => {
    isInitialMount.current = true
  }

  let firstRowAfterMaxFreeLevelWasFound = false

  return (
    <>
      <PassHeader />

      <main className="flex flex-col">
        <TopBadges />

        {isLevelsLoading && (
          <>
            <Skeleton className="delay-150" />
            <Skeleton className="delay-300" />
            <Skeleton className="[animation-delay:450ms;]" />
            <Skeleton className="[animation-delay:600ms;]" />
            <Skeleton className="[animation-delay:750ms;]" />
            <Skeleton className="[animation-delay:900ms;]" />
          </>
        )}

        {groupedByLevelRewards &&
          groupedByLevelRewards.map((item, i) => {
            const isFirstClaimable =
              firstClaimableReward === item.level ||
              (typeof firstClaimableReward === "string" &&
                groupedByLevelRewards.length - 1 === i)
            if (!firstRowAfterMaxFreeLevelWasFound) {
              firstRowAfterMaxFreeLevelWasFound = true
              return (
                <Fragment key={item.level}>
                  {/* <div className="relative flex" ref={maxFreeLevelBlockRef}>
                    <div className="relative flex h-[124px] flex-1 items-center justify-center bg-gradient-to-r from-[#3B3170] to-[#6A5CB7]">
                      <EndOfFreeLevelIcon className="absolute top-0 -translate-y-1/2 rounded-md drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)] backdrop-blur-[1px]" />
                      <div className="flex flex-col gap-1.5 px-6">
                        <p className="text-balance text-center text-[10px]/[12px] font-semibold text-[#D2C9FF]">
                          Трек бесплатных наград пройден
                        </p>
                        <p className="text-balance text-center text-[10px]/[12px] font-semibold text-[#D2C9FF]">
                          Приобретай Premium и открой эксклюзивные награды!
                        </p>
                      </div>
                    </div>
                    <div className="group relative flex h-[124px] flex-1 items-center justify-center bg-gradient-to-r from-[#9743A8] to-[#5F136F]">
                      <EndOfFreeLevelIcon className="absolute top-0 -translate-y-1/2 rounded-md drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)] backdrop-blur-[1px]" />
                      <div className="flex flex-col gap-1.5 px-6">
                        <p className="text-balance text-center text-[10px]/[12px] font-semibold text-[#D2C9FF]">
                          Трек эксклюзивных наград пройден
                        </p>
                        <p className="text-balance text-center text-[10px]/[12px] font-semibold text-[#D2C9FF]">
                          Приобретай уровни и получай больше наград!
                        </p>
                      </div>
                    </div>

                    <div className="absolute inset-y-0 left-1/2 w-2 -translate-x-1/2 border-x border-[#2D1A53] bg-[#453A7D]" />

                    {passLevel >= item.level && (
                      <div
                        className={cn(
                          "absolute inset-y-0 left-1/2 w-2 -translate-x-1/2 bg-gradient-to-r from-[#FEE422] to-[#FA9B39]",
                          passLevel === item.level && "bottom-[2.5px] top-0",
                        )}
                      />
                    )}

                    <div className="absolute bottom-0 h-px w-full bg-[#E9E4F2]/20" />
                    <div className="absolute bottom-[0.5px] h-0.5 w-full bg-[#130C21]/40" />
                  </div> */}
                  <div ref={isFirstClaimable ? firstClaimableRef : null}>
                    <RewardsRow
                      key={i}
                      level={item.level}
                      freeReward={item.freeReward}
                      premiumReward={item.premiumReward}
                      hasToFetchNew={i === groupedByLevelRewards.length - 1}
                      riveFiles={{
                        freeBox,
                        premiumBox,
                        freeStatus,
                        premiumStatus,
                      }}
                      sounds={{
                        freeSound,
                        premiumSound,
                        bonusSound,
                        coinsSound,
                        energySound,
                      }}
                      openBoxInfo={() => setBoxOpen(true)}
                      openRewardInfo={() => setRewardInfoOpen(true)}
                      refetched={onRefetched}
                    />
                  </div>
                </Fragment>
              )
            }

            return (
              <div ref={isFirstClaimable ? firstClaimableRef : null}>
                <RewardsRow
                  key={i}
                  level={item.level}
                  freeReward={item.freeReward}
                  premiumReward={item.premiumReward}
                  hasToFetchNew={i === groupedByLevelRewards.length - 1}
                  riveFiles={{
                    freeBox,
                    premiumBox,
                    freeStatus,
                    premiumStatus,
                  }}
                  sounds={{
                    freeSound,
                    premiumSound,
                    bonusSound,
                    coinsSound,
                    energySound,
                  }}
                  openBoxInfo={() => setBoxOpen(true)}
                  openRewardInfo={() => setRewardInfoOpen(true)}
                  refetched={onRefetched}
                />
              </div>
            )
          })}

        <BelowNavPlaceholder />
      </main>

      {/* Градиент под навигацией */}
      <div className="fixed bottom-0 h-[120px] w-full max-w-[500px] bg-gradient-to-b from-[#433845]/0 to-[#383139]" />

      <BoxInfo
        open={boxOpen}
        setOpen={setBoxOpen}
        openRewardInfo={() => setRewardInfoOpen(true)}
      />

      <BuyLevels
        open={isBuyLevelOpened}
        setOpen={(value) => dispatch(setIsBuyLevelOpened(value))}
        openPaymentStatus={() => {
          dispatch(setIsBuyLevelOpened(false))
          setPaymentStatusOpen(true)
        }}
      />

      <BuyLevelsPaymentStatus
        open={paymentStatusOpen}
        setOpen={setPaymentStatusOpen}
      />

      <RewardInfo open={rewardInfoOpen} setOpen={setRewardInfoOpen} />
    </>
  )
}

export default NutsPassV2

const Skeleton = ({ className }: { className: string }) => (
  <div className={cn("relative flex animate-pulse", className)}>
    <div className="relative flex h-[124px] flex-1 items-center justify-center bg-gradient-to-r from-[#3B3170] to-[#6A5CB7]" />
    <div className="relative flex h-[124px] flex-1 items-center justify-center bg-gradient-to-r from-[#9743A8] to-[#5F136F]" />

    <div className="absolute inset-y-0 left-1/2 w-2 -translate-x-1/2 border-x border-[#2D1A53] bg-[#453A7D]" />

    {/* Полоска-тень */}
    <div className="absolute bottom-0 h-px w-full bg-[#E9E4F2]/20" />
    <div className="absolute bottom-px h-0.5 w-full bg-[#130C21]/40" />

    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <img src={DisabledLevelBadgePNG} className="h-auto w-[45px]" />
    </div>
  </div>
)
