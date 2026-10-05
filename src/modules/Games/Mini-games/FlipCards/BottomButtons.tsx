import { useState } from "react"
import { useTime, useTransform, motion } from "framer-motion"

import CardsIcon from "@/assets/games/flip-cards/icons/cards.svg?react"
import CartIcon from "@/assets/games/flip-cards/icons/cart.svg?react"
import QuestionMarkIcon from "@/assets/games/flip-cards/icons/question-mark.svg?react"

import Store from "./modals/Store"
import Packs from "./modals/Packs"
import HowToPlay from "./modals/HowToPlay"

import { sendMetrika } from "@/utils/sendMetrika"

import { cn } from "@/lib/cn"

const BottomButtons = () => {
  const [packsOpen, setPacksOpen] = useState(false)

  const time = useTime()

  const rotate = useTransform(time, [0, 4000], [0, 360], {
    clamp: false,
  })
  const rotatingBg = useTransform(rotate, (r) => {
    return `conic-gradient(from ${r}deg, #DF8BEA, transparent, transparent, #DF8BEA)`
  })

  return (
    <>
      <div
        className={cn(
          "fixed right-3.5 flex flex-col gap-2",
          Telegram.WebApp.platform === "weba"
            ? "bottom-4"
            : "bottom-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
        )}
      >
        <Packs open={packsOpen} setOpen={setPacksOpen}>
          <button
            className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-[#7060B4]/80 shadow-[0px_1px_6px_0px_rgba(0,0,0,0.15)] transition-colors hover:bg-[#7c64b5]/90 active:bg-[#6455a4]/80"
            onClick={() => {
              sendMetrika("metamatch_store")
            }}
          >
            <CardsIcon className="h-auto w-[34px]" />
          </button>
        </Packs>
        <Store openPacks={() => setPacksOpen(true)}>
          <button className="relative">
            <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-[10px] bg-[#7060B4] shadow-[0px_1px_6px_0px_rgba(0,0,0,0.15)] ring-1 ring-[#DF8BEA]/30 transition-colors hover:bg-[#7c64b5] active:bg-[#6455a4]">
              <CartIcon className="h-7 w-7 -translate-x-0.5" />
            </div>
            <motion.div
              className="absolute -inset-px rounded-[11px]"
              style={{ background: rotatingBg, filter: "blur(6px)" }}
            />
          </button>
        </Store>
      </div>
      <HowToPlay showCloseButton>
        <button
          className={cn(
            "fixed left-3.5 flex h-12 w-12 items-center justify-center rounded-[10px] bg-[#7060B4]/80 shadow-[0px_1px_6px_0px_rgba(0,0,0,0.15)] transition-colors hover:bg-[#7c64b5]/90 active:bg-[#6455a4]/80",
            Telegram.WebApp.platform === "weba"
              ? "bottom-4"
              : "bottom-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
          )}
        >
          <QuestionMarkIcon className="h-7 w-7" />
        </button>
      </HowToPlay>
    </>
  )
}

export default BottomButtons
