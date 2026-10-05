import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import * as Dialog from "@radix-ui/react-alert-dialog"
import {
  motion,
  useMotionValue,
  animate,
  useMotionValueEvent,
} from "framer-motion"

import WheelCenter from "@/assets/wheel/wheel-center.svg?react"
import Wheel from "@/assets/wheel/wheel.svg?react"
import Jackpot from "@/assets/wheel/jackpot.svg?react"
import Boosters from "@/assets/wheel/boosters.svg?react"
import NFT from "@/assets/wheel/NFT-ticket.svg?react"
import Ticket from "@/assets/wheel/ticket.svg?react"
import Coin from "@/assets/wheel/coin.svg?react"
import Energy from "@/assets/wheel/energy.svg?react"
import Level from "@/assets/wheel/level.svg?react"
import AssemblePNG from "@/assets/wheel/assemble.png"
import Chest from "@/assets/wheel/chest.svg?react"
import PremiumTicket from "@/assets/wheel/premium-ticket.svg?react"

import { Sound } from "@/utils/Sound"
import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

import { WheelReward } from "@/types/wheel"

const clickSound = new Sound(
  import.meta.env.VITE_IS_DEV_LOCAL === undefined
    ? "https://s3-nutsfarm.crypton.xyz/sounds/games/wheel-click-new-1.mp3"
    : "https://s3-nutsfarm-dev.crypton.xyz/sounds/games/wheel-click-new-1.mp3",
)
const winSound = new Sound(
  import.meta.env.VITE_IS_DEV_LOCAL === undefined
    ? "https://s3-nutsfarm.crypton.xyz/sounds/games/wheel-win.mp3"
    : "https://s3-nutsfarm-dev.crypton.xyz/sounds/games/wheel-win.mp3",
)

const SPIN_COUNT = 9
const DURATION_IN_SECONDS = 7

const WheelAnimation = ({
  open,
  setOpen,
  openReward,
  reward,
  hideWheel,
  isPremium,
}: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  openReward: VoidFunction
  reward: WheelReward
  hideWheel: VoidFunction
  isPremium: boolean
}) => {
  const [isAnimationStarted, setIsAnimationStarted] = useState(false)

  const itemPassedRef = useRef(0)

  const position = useMemo(() => {
    if (reward.type === "JACKPOT") return 1
    if (reward.type === "GAME_ENERGY") return 2
    if (reward.type === "NUTS") return 3
    if (reward.type === "NUT_PASS_XP") return 4
    if (reward.type === "NFT") return 5
    if (reward.type === "BOOSTER") return 6

    return 6
  }, [reward, open])

  const offset = (360 / 6) * position
  const endValue = useMotionValue(360 * SPIN_COUNT - offset - 30)
  const rotate = useMotionValue(0)

  useMotionValueEvent(rotate, "change", (latestRotate) => {
    const itemPassed = Math.floor(Math.abs(latestRotate) / (360 / 6))

    if (itemPassed === itemPassedRef.current) return

    makeHapticFeedback({ impactOccured: "soft" })
    clickSound.play(false, 0.5)

    itemPassedRef.current = itemPassed
  })

  const onAnimationStart = () => {
    if (!isAnimationStarted) {
      setIsAnimationStarted(true)
      animate(rotate, endValue.get(), {
        duration: DURATION_IN_SECONDS,
        ease: [0.5, 0.1, 0.1, 1],
        type: "tween",
      })
    }

    if (isPremium) {
      setTimeout(
        () => {
          // animate(rotate, endValue.get(), {
          //   duration: 0,
          //   type: "tween",
          // })
          winSound.play(false, 0.3)
          setIsAnimationStarted(false)
          setOpen(false)
          openReward()
        },
        DURATION_IN_SECONDS * 1000 - 2250,
      )
    } else {
      setTimeout(
        () => {
          animate(rotate, endValue.get(), {
            duration: 0,
            type: "tween",
          })
          winSound.play(false, 0.3)
          setIsAnimationStarted(false)
          setOpen(false)
          openReward()
        },
        DURATION_IN_SECONDS * 1000 + 750,
      )
    }
  }

  useEffect(() => {
    Promise.all([clickSound.load(), winSound.load()])

    if (!open) {
      hideWheel()
      return
    }

    setTimeout(() => {
      onAnimationStart()
    }, 1000)
  }, [open])

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal container={document.getElementById("dialogs")}>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[#17202D]/70 backdrop-blur" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
          <Dialog.Title className="sr-only">Wheel animation</Dialog.Title>
          <Dialog.Description className="sr-only">
            Wheel animation
          </Dialog.Description>

          <div className="relative">
            <div className="absolute h-[304px] w-[304px] rounded-full bg-[#F7A835] opacity-20 blur-[80px]" />
            <div className="absolute inset-0 rounded-full bg-[#E38928] opacity-20 blur-[60px]" />
            <div className="absolute inset-2.5 rounded-full bg-[#FFF462] opacity-10 blur-[60px]" />
            {/* Обводка колеса */}
            <motion.div
              style={{ rotate: rotate }}
              className="will-change-transform"
            >
              <Wheel className="relative" />
            </motion.div>

            <motion.div
              style={{ rotate: rotate }}
              className="absolute inset-0 will-change-transform"
            >
              <div className="absolute left-1/2 top-1/2 flex h-[120px] w-[125px] origin-left -translate-y-1/2 items-center">
                <Jackpot className="ml-4" />
              </div>
              <div className="absolute left-1/2 top-1/2 flex h-[120px] w-[125px] origin-left -translate-y-1/2 rotate-[300deg] items-center">
                {isPremium ? (
                  <Level className="ml-12 rotate-[60deg]" />
                ) : (
                  <Boosters className="ml-[45px] rotate-[60deg]" />
                )}
              </div>
              <div className="absolute left-1/2 top-1/2 flex h-[120px] w-[125px] origin-left -translate-y-1/2 rotate-[240deg] items-center">
                {isPremium ? (
                  <img src={AssemblePNG} className="ml-12 rotate-[120deg]" />
                ) : (
                  <NFT className="ml-7 rotate-[120deg]" />
                )}
              </div>
              <div className="absolute left-1/2 top-1/2 flex h-[120px] w-[125px] origin-left -translate-y-1/2 rotate-[180deg] items-center">
                <Ticket className="ml-[46px] rotate-[180deg]" />
              </div>
              <div className="absolute left-1/2 top-1/2 flex h-[120px] w-[125px] origin-left -translate-y-1/2 rotate-[120deg] items-center">
                {isPremium ? (
                  <Chest className="ml-[45px] rotate-[240deg]" />
                ) : (
                  <Coin className="ml-[50px] rotate-[240deg]" />
                )}
              </div>
              <div className="absolute left-1/2 top-1/2 flex h-[120px] w-[125px] origin-left -translate-y-1/2 rotate-[60deg] items-center">
                {isPremium ? (
                  <PremiumTicket className="ml-[50px] rotate-[300deg]" />
                ) : (
                  <Energy className="ml-[42px] rotate-[300deg]" />
                )}
              </div>
            </motion.div>

            {/* Штучка указывающая на приз */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <WheelCenter className="-translate-y-2 drop-shadow-[0px_2px_7px_rgba(72,19,102,0.4)]" />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default WheelAnimation
