import * as React from "react"

import { motion } from "framer-motion"

import { cn } from "@/lib/cn"

const TimerLargeButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    appearance: "white"
    contentClassName?: string
    shadowClassName?: string
    hasRing?: boolean
    isEasyMode?: boolean
  }
>(
  (
    {
      className,
      children,
      disabled,
      appearance,
      contentClassName,
      shadowClassName,
      hasRing,
      isEasyMode,
      ...props
    },
    forwardedRef,
  ) => {
    const [isActive, setIsActive] = React.useState(false)

    const LOCK_TIME_IN_SECONDS =
      import.meta.env.VITE_ENVIRONMENT === "PROD" ? (isEasyMode ? 0 : 3) : 0

    React.useEffect(() => {
      const timer = setTimeout(() => {
        setIsActive(true)
      }, LOCK_TIME_IN_SECONDS * 1000)

      return () => {
        clearTimeout(timer)
      }
    }, [])

    return (
      <button
        className={cn(
          "group relative flex h-14 w-full items-start outline-none",
          className,
        )}
        ref={forwardedRef}
        disabled={disabled || !isActive}
        {...props}
      >
        <motion.div
          initial={{
            backgroundImage: "linear-gradient(to right, white 0%, #ABABAB 0%)",
          }}
          animate={{
            backgroundImage:
              "linear-gradient(to right, white 100%, #ABABAB 100%)",
          }}
          transition={{
            duration: LOCK_TIME_IN_SECONDS,
          }}
          className={cn(
            "relative z-50 flex h-[50px] w-full items-center justify-center gap-3 rounded-xl font-tt-hoves-expanded text-base font-semibold",
            !disabled && isActive && "group-active:translate-y-1.5",
            appearance === "white" &&
              (disabled ? "bg-[#0F1824] text-white/50" : "bg-white text-black"),
            contentClassName,
          )}
        >
          {children}
        </motion.div>
        {hasRing && (
          <div
            className={cn(
              "absolute -inset-0.5 rounded-xl bg-background",
              !disabled && isActive && "group-active:top-1",
            )}
          />
        )}
        <div
          className={cn(
            "absolute top-0 h-full w-full rounded-xl",
            !disabled &&
              isActive &&
              "group-active:h-[50px] group-active:translate-y-1.5",
            disabled && "opacity-0",
            appearance === "white" && "bg-[#ABABAB]",
            shadowClassName,
          )}
        />
      </button>
    )
  },
)
TimerLargeButton.displayName = "LargeButton"

export { TimerLargeButton }
