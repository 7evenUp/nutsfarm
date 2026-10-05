import { ComponentProps, forwardRef } from "react"

import WheelIcon from "@/assets/games/shared-icons/wheel.svg?react"

import HeaderButton from "../shared/HeaderButton"

import { useAppSelector } from "@/redux/hooks"

import { sendMetrika } from "@/utils/sendMetrika"

import { GameTheme } from "@/types/games"

const Wheel = forwardRef<
  HTMLButtonElement,
  ComponentProps<"button"> & {
    theme: GameTheme
    isGamePlay: boolean
  }
>(({ className, theme, isGamePlay, ...rest }, forwardedRef) => {
  const skin = useAppSelector((state) => state.game.skin)
  return (
    <HeaderButton
      ref={forwardedRef}
      className={className}
      theme={theme}
      cryptlSkin={theme === "cryptle" ? skin : undefined}
      isGamePlay={isGamePlay}
      onClick={() => {
        sendMetrika("wheel_click")
        if (theme === "cryptle") sendMetrika("wheel_wordle")
        if (theme === "flip-cards") sendMetrika("wheel_metamatch")
        if (theme === "puzzles") sendMetrika("wheel_nuts_blocks")
      }}
      {...rest}
    >
      <WheelIcon className="h-[18px] w-[18px] drop-shadow-[0px_0px_4px_rgba(0,0,0,0.15)]" />
    </HeaderButton>
  )
})

export default Wheel
