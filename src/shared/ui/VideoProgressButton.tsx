import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/cn"

const ProgressLargeButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    appearance: "white"
    contentClassName?: string
    shadowClassName?: string
    hasRing?: boolean
    isEnabled: boolean
    progress: number
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
      isEnabled,
      progress,
      ...props
    },
    forwardedRef,
  ) => {
    return (
      <button
        className={cn(
          "group relative flex h-14 w-full items-start outline-none",
          className,
        )}
        ref={forwardedRef}
        disabled={disabled || !isEnabled}
        {...props}
      >
        <motion.div
          animate={{
            backgroundImage: `linear-gradient(to right, white ${progress}%, #ABABAB ${progress}%)`,
          }}
          transition={{ duration: 0.15, ease: "linear" }}
          className={cn(
            "relative z-50 flex h-[50px] w-full items-center justify-center gap-3 rounded-xl font-tt-hoves-expanded text-base font-semibold",
            !disabled && isEnabled && "group-active:translate-y-1.5",
            appearance === "white" &&
              (disabled || !isEnabled
                ? "bg-red-500 text-black"
                : "bg-white text-black"),
            contentClassName,
          )}
        >
          {children}
        </motion.div>
        {hasRing && (
          <div
            className={cn(
              "absolute -inset-0.5 rounded-xl bg-background",
              !disabled && isEnabled && "group-active:top-1",
            )}
          />
        )}
        <div
          className={cn(
            "absolute top-0 h-full w-full rounded-xl",
            !disabled &&
              isEnabled &&
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
ProgressLargeButton.displayName = "ProgressLargeButton"

export { ProgressLargeButton }
