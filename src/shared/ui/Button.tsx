import * as React from "react"

import { cn } from "@/lib/cn"

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    contentClassName?: string
    shadowClassName?: string
    appearance?:
      | "yellow-linear"
      | "gray"
      | "gray-dark"
      | "white"
      | "blue-linear"
      | "white"
  }
>(
  (
    {
      className,
      children,
      disabled,
      contentClassName,
      shadowClassName,
      appearance = "yellow-linear",
      ...props
    },
    forwardedRef,
  ) => {
    return (
      <button
        className={cn(
          "group relative flex h-9 items-start focus:outline-none",
          className,
        )}
        disabled={disabled}
        ref={forwardedRef}
        {...props}
      >
        <div
          className={cn(
            "relative z-40 flex h-8 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-[#050D12]",
            !disabled && "group-active:translate-y-1",
            appearance === "yellow-linear" &&
              (disabled
                ? "pointer-events-none bg-[#1C2430] text-white/30"
                : "bg-gradient-to-br from-[#FEEE1F] to-[#F9C705] text-[#053355]"),
            appearance === "blue-linear" &&
              (disabled
                ? "bg-[#283649] text-white/75"
                : "bg-gradient-to-r from-cyan to-blue"),
            appearance === "gray-dark" && "bg-[#17202D] text-white",
            appearance === "gray" && "bg-[#283649] text-white",
            appearance === "white" &&
              (disabled ? "bg-[#283649] text-white/75" : "bg-white"),
            contentClassName,
          )}
        >
          {children}
        </div>
        <div
          className={cn(
            "absolute top-0 h-9 w-full rounded-xl group-active:h-8 group-active:translate-y-1",
            disabled && "opacity-0",
            appearance === "yellow-linear" && "bg-[#AE9410]",
            appearance === "blue-linear" && "bg-[#4D98D9]",
            appearance === "gray-dark" && "bg-[#27354A]",
            appearance === "gray" && "bg-[#40526C]",
            appearance === "white" && "bg-[#ABABAB]",
            shadowClassName,
          )}
        />
      </button>
    )
  },
)
Button.displayName = "Button"

export { Button }
