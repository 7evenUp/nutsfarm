import { ComponentProps, forwardRef } from "react"

import { cn } from "@/lib/cn"
import { GameTheme } from "@/types/games"
import { SkinType } from "@/types/cryptle"

const HeaderButton = forwardRef<
  HTMLButtonElement,
  ComponentProps<"button"> & {
    theme: GameTheme
    cryptlSkin?: SkinType
    isGamePlay?: boolean
  }
>(
  (
    { className, children, cryptlSkin, isGamePlay, theme, ...rest },
    forwardedRef,
  ) => {
    return (
      <button
        ref={forwardedRef}
        className={cn(
          "flex h-[30px] w-[30px] items-center justify-center rounded-lg border bg-gradient-to-b transition-opacity active:opacity-80",
          theme === "default" && "border-[#010036] from-[#695AB8] to-[#393163]",
          theme === "flip-cards" &&
            "border-[#010036] from-[#4A4078] to-[#2F2852] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.2)]",
          theme === "puzzles" &&
            "border-[#094541]/60 from-[#0D5F5A] to-[#15857F]",
          theme === "puzzles-gameplay" &&
            "border-[#492C06] from-[#96550B] to-[#4F2B02]",
          theme === "cryptle" &&
            "border-[#3A2485] from-[#473391] to-[#3C2787] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.2)]",
          theme === "cryptle" &&
            cryptlSkin === "DEFAULT" &&
            isGamePlay &&
            "border-[#3A2485] from-[#473391] to-[#3C2787] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.2)]",
          theme === "cryptle" &&
            cryptlSkin === "GREEN" &&
            isGamePlay &&
            "border-[#15351B] from-[#68974A] to-[#37603D] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.2)]",
          theme === "cryptle" &&
            cryptlSkin === "PURPLE" &&
            isGamePlay &&
            "border-[#301F49] from-[#653B95] to-[#3A1D5D] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.2)]",
          className,
        )}
        {...rest}
      >
        {children}
      </button>
    )
  },
)

export default HeaderButton
