import { useEffect, useState } from "react"
import Lottie from "lottie-react"

import HomeImage from "@/assets/images/home-image.png"

import LottieAnimationV1 from "@/assets/animations/nutcracker_1.json"
import LottieAnimationV2 from "@/assets/animations/nutcracker_2.json"
import LottieAnimationV3 from "@/assets/animations/nutcracker_3.json"
import LottieAnimationV4 from "@/assets/animations/nutcracker_4.json"
import LottieAnimationV5 from "@/assets/animations/nutcracker_5.json"

import Drop from "./components/Drop"
import FarmButtons from "./components/FarmButtons"
import Stories from "./components/Stories"
import Points from "./components/Points"
import HomeButtonsGroup from "./components/HomeButtonsGroup"
import LoadingScreen from "../LoadingScreen"

import StoriesDialog from "@/modals/Stories"

import { useAppSelector } from "@/redux/hooks"
import { useGetCurrentUserQuery } from "@/redux/api/user"
import { useGetFarmingStatusQuery } from "@/redux/api/farming"
import {
  useGetCurrentStoriesQuery,
  useGetStoriesQuery,
} from "@/redux/api/stories"
import { useClickEasterEggMutation } from "@/redux/api/achievement"

import { cn } from "@/lib/cn"

const TIME_BEFORE_ASLEEP = 10000
const NUTCRACKER_ANIMATION_DELAY = 5000
// const NUTCRACKER_ANIMATION_DELAY = 5800

const Home = () => {
  const [isAsleep, setIsAsleep] = useState(false)
  const [isClaimed, setIsClaimed] = useState(false)
  const [isStarted, setIsStarted] = useState(false)
  const [waitForEnd, setWaitForEnd] = useState(false)
  const [isStartedDelay, setIsStartedDelay] = useState(false)
  const [isAnimationEnded, setIsAnimationEnded] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  const { telegramPerformanceClass } = useAppSelector(
    (state) => state.performance,
  )

  const { isLoading: isCurrentUserLoading } = useGetCurrentUserQuery()
  const { data: farmingStatus, isLoading: isFarmingStatusLoading } =
    useGetFarmingStatusQuery(undefined, { refetchOnMountOrArgChange: true })
  const { isLoading: isStoriesLoading } = useGetStoriesQuery()
  const { isLoading: isCurrentStoriesLoading } = useGetCurrentStoriesQuery()
  const [easterClick] = useClickEasterEggMutation()

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPrefersReducedMotion(true)
    }
  }, [])

  useEffect(() => {
    if (isAnimationEnded) {
      setIsAsleep(true)
      setIsAnimationEnded(false)
      setWaitForEnd(false)
    }
  }, [isAnimationEnded])

  useEffect(() => {
    if (!farmingStatus) return

    if (farmingStatus.status === "FARMING") return

    if (!isAsleep) {
      setTimeout(() => {
        setWaitForEnd(true)
      }, TIME_BEFORE_ASLEEP)
    }
  }, [])

  useEffect(() => {
    if (isClaimed) {
      setIsAsleep(false)
      setTimeout(() => setIsClaimed(false), NUTCRACKER_ANIMATION_DELAY)
    }
  }, [isClaimed])

  useEffect(() => {
    if (isStarted) {
      setIsAsleep(false)
      setIsStartedDelay(true)
      setTimeout(() => {
        setIsStarted(false)
        setIsStartedDelay(false)
      }, NUTCRACKER_ANIMATION_DELAY)
    }
  }, [isStarted])

  if (
    isCurrentUserLoading ||
    isFarmingStatusLoading ||
    isStoriesLoading ||
    isCurrentStoriesLoading
  )
    return <LoadingScreen />

  return (
    <>
      <main
        className={cn(
          "no-scroll flex flex-1 flex-col overflow-hidden",
          Telegram.WebApp.platform === "tdesktop" ||
            Telegram.WebApp.platform === "macos"
            ? "pt-16"
            : "pt-16 phone-xsm:pt-[72px] phone-sm:pt-20",
        )}
      >
        <div className="fixed left-1/2 top-1/2 h-screen w-screen -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#216698] via-[#050D12] to-[#050D12]" />

        <Stories />
        <Points />

        <button
          className="EASTER_EGG"
          style={{ display: "none" }}
          onClick={() => easterClick()}
        >
          Easter Egg
        </button>

        {prefersReducedMotion || telegramPerformanceClass === "LOW" ? (
          <img
            src={HomeImage}
            alt="Nutcracker image"
            className={cn(
              "fixed left-1/2 top-1/2 mt-6 max-w-[340px] -translate-x-1/2 -translate-y-1/2 object-cover",
              Telegram.WebApp.platform === "tdesktop" ||
                Telegram.WebApp.platform === "macos"
                ? "h-[190px] w-[200px]"
                : "w-[50vw] phone-xsm:w-[55vw] phone-sm:w-[65vw] phone:w-[70vw] phone:max-w-[350px] phone-lg:w-[360px] phone-lg:max-w-[370px]",
            )}
          />
        ) : (
          <Lottie
            animationData={
              farmingStatus &&
              farmingStatus.status === "FARMING" &&
              !isStartedDelay
                ? LottieAnimationV4
                : isClaimed
                  ? LottieAnimationV5
                  : isStarted
                    ? LottieAnimationV3
                    : isAsleep
                      ? LottieAnimationV2
                      : LottieAnimationV1
            }
            onLoopComplete={() => {
              if (waitForEnd) {
                setIsAnimationEnded(true)
              }
            }}
            autoplay
            loop
            className={cn(
              "fixed left-1/2 top-1/2 z-[1] mt-8 max-w-[340px] -translate-x-1/2 -translate-y-1/2 object-cover phone-xsm:mt-6 phone-xl:mt-10",
              Telegram.WebApp.platform === "tdesktop" ||
                Telegram.WebApp.platform === "macos"
                ? "h-[280px] w-[280px]"
                : "w-[70vw] phone-xsm:w-[80vw] phone-sm:w-[85vw] phone:w-screen phone:max-w-[400px] phone-lg:w-[475px] phone-lg:max-w-[475px] phone-xl:w-[440px] phone-xl:max-w-[440px]",
            )}
          />
        )}

        <HomeButtonsGroup />

        <Drop />
        <FarmButtons setIsClaimed={setIsClaimed} setIsStarted={setIsStarted} />
      </main>

      <StoriesDialog />
    </>
  )
}

export default Home
