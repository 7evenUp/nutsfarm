import * as React from "react"

import { cn } from "@/lib/cn"

const LargeButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    appearance:
      | "white"
      | "blue-radial"
      | "blue-linear"
      | "yellow-radial"
      | "yellow-linear"
      | "green"
      | "gray"
      | "gray-dark"
    contentClassName?: string
    shadowClassName?: string
    hasRing?: boolean
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
        disabled={disabled}
        {...props}
      >
        <div
          className={cn(
            "relative z-50 flex h-[50px] w-full items-center justify-center gap-3 rounded-xl font-tt-hoves-expanded text-base font-semibold text-[#050D12]",
            !disabled && "group-active:translate-y-1.5",
            appearance === "yellow-radial" &&
              "bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#FEED1F] to-[#F8C003]",
            appearance === "yellow-linear" &&
              (disabled
                ? "bg-[#0F1824] text-white/50"
                : "bg-gradient-to-br from-[#FEEE1F] to-[#F9C705]"),
            appearance === "blue-radial" &&
              (disabled
                ? "bg-[#122137] text-white/30"
                : "bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-cyan to-blue text-[#060E13]"),
            appearance === "blue-linear" &&
              (disabled
                ? "bg-gradient-to-br from-[#538d96] to-[#5788c4]"
                : "bg-gradient-to-br from-[#8BEDFC] to-[#6DABF9]"),
            appearance === "white" &&
              (disabled ? "bg-[#0F1824] text-white/50" : "bg-white"),
            appearance === "gray" && "bg-[#283649] text-white",
            appearance === "gray-dark" && "bg-[#17202D] text-white",
            appearance === "green" &&
              "bg-gradient-to-r from-[#81DD5B] to-[#96F48E]",
            contentClassName,
          )}
        >
          {children}
        </div>
        {hasRing && (
          <div className="absolute -inset-0.5 rounded-xl bg-background group-active:top-1" />
        )}
        <div
          className={cn(
            "absolute top-0 h-full w-full rounded-xl group-active:h-[50px] group-active:translate-y-1.5",
            disabled && "opacity-0",
            appearance === "yellow-radial" && "bg-[#E1AF07]",
            appearance === "yellow-linear" && "bg-[#AE9410]",
            appearance === "blue-radial" && "bg-[#438ADC]",
            appearance === "blue-linear" && "bg-[#5B88BA]",
            appearance === "white" && "bg-[#ABABAB]",
            appearance === "gray" && "bg-[#1C2430]",
            appearance === "gray-dark" && "bg-[#27354A]",
            appearance === "green" && "bg-[#589540]",
            shadowClassName,
          )}
        />
      </button>
    )
  },
)
LargeButton.displayName = "LargeButton"

export { LargeButton }
