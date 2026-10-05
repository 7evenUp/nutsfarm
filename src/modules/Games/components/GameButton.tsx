import { ComponentProps, forwardRef } from "react"

import { cn } from "@/lib/cn"

const GameButton = forwardRef<
  HTMLButtonElement,
  ComponentProps<"button"> & {
    appearance: "puzzles" | "flip-cards" | "cryptle"
  }
>(({ className, children, appearance, ...rest }, forwardedRef) => {
  return (
    <button
      className={cn(
        "flex items-center justify-center rounded-lg text-base/[150%] font-bold tracking-[-0.01em] shadow-[0px_1px_0px_0px_rgba(0,0,0,0.5)] active:translate-y-px active:shadow-none disabled:pointer-events-none disabled:shadow-none",
        appearance === "puzzles" &&
          "bg-gradient-to-b from-[#FEEE1F] to-[#FCBF2E] text-[#572E05] disabled:opacity-50",
        appearance === "flip-cards" &&
          "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#DB8AE5] to-[#CB73D6] text-[#340954] disabled:opacity-50",
        appearance === "cryptle" &&
          "bg-[radial-gradient(ellipse_at_center,#FEEE1F,#FA9B39_150%)] text-[#2F2852] disabled:text-[#aa9246] disabled:opacity-75",
        className,
      )}
      ref={forwardedRef}
      {...rest}
    >
      {children}
    </button>
  )
})

export default GameButton
