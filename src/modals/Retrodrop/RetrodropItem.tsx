import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"

import Coin from "@/assets/icons/coin.svg?react"
import CoinSpecialPng from "@/assets/images/coin-special.png"

import { numberWithSpaces } from "@/utils/numberWithSpaces"

import { cn } from "@/lib/cn"

const item = {
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.5,
    },
  },
  hidden: { opacity: 0, x: -100 },
}

const bar = {
  visible: () => ({
    width: "100%",
    transition: {
      ease: "easeInOut",
      duration: 1,
    },
  }),
  hidden: { width: 0 },
}

const points = {
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 1,
    },
  },
  hidden: { opacity: 0, y: 20 },
}

const RetrodropItem = ({
  children,
  title,
  reward,
  isEligible = true,
  isSpecial,
}: {
  children: React.ReactNode
  title: string
  reward: number
  isEligible?: boolean
  isSpecial?: boolean
}) => {
  const { ref, inView } = useInView({
    root: document.querySelector("#retrodrop-modal"),
    threshold: 0.25,
    triggerOnce: true,
  })

  return (
    <motion.div
      ref={ref}
      variants={item}
      className="relative flex items-center gap-3.5 rounded-[14px] py-1.5 pl-1.5 pr-2.5"
    >
      <div
        className={cn(
          "relative z-10 flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-xl bg-[#1C2430]",
          !isEligible && "opacity-50",
        )}
      >
        {children}
      </div>
      <span
        className={cn(
          "relative z-10 mr-3 text-sm font-semibold",
          isSpecial && "text-background",
          !isEligible && "text-white/50",
        )}
      >
        {title}
      </span>
      <motion.div
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={points}
        className={cn(
          "relative z-10 ml-auto flex shrink-0 items-center gap-1 text-sm font-bold",
          isSpecial ? "text-background" : "text-[#FED900]",
          !isEligible && "text-[#FED900]/50",
        )}
      >
        {isSpecial ? (
          <img
            src={CoinSpecialPng}
            alt="Coin image"
            className={cn("h-4 w-4", !isEligible && "opacity-50")}
          />
        ) : (
          <Coin className={cn("h-4 w-4", !isEligible && "opacity-50")} />
        )}
        <span>{reward > 0 ? `+${numberWithSpaces(reward, true)}` : 0}</span>
      </motion.div>
      <motion.div
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={bar}
        className={cn(
          "absolute left-0 top-0 h-full origin-left rounded-[14px]",
          isSpecial
            ? "bg-gradient-to-r from-[#FEEE1F] to-[#FACB08]"
            : "bg-[#0F1824]",
        )}
      />
    </motion.div>
  )
}

export default RetrodropItem
