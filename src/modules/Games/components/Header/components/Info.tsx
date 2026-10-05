import { ComponentProps, forwardRef } from "react"

import InfoCryptleIcon from "@/assets/games/cryptle/icons/question-icon.svg?react"
import GreenInfoCryptleIcon from "@/assets/games/cryptle/icons/question-icon-green.svg?react"
import PurpleInfoCryptleIcon from "@/assets/games/cryptle/icons/question-icon-purple.svg?react"
import InfoPuzzlesIcon from "@/assets/games/puzzles/icons/question-icon.svg?react"
import InfoFlipCardsIcon from "@/assets/games/flip-cards/icons/question-icon.svg?react"

import HeaderButton from "../shared/HeaderButton"
import { GameTheme } from "@/types/games"
import { useAppSelector } from "@/redux/hooks"

const Info = forwardRef<
  HTMLButtonElement,
  ComponentProps<"button"> & {
    theme: GameTheme
    isGamePlay: boolean
  }
>(({ className, theme, isGamePlay, ...rest }, forwardedRef) => {
  const skin = useAppSelector((state) => state.game.skin)

  const CorrectInfoIcon =
    theme === "cryptle"
      ? skin === "GREEN"
        ? GreenInfoCryptleIcon
        : skin === "PURPLE"
          ? PurpleInfoCryptleIcon
          : InfoCryptleIcon
      : theme === "flip-cards"
        ? InfoFlipCardsIcon
        : InfoPuzzlesIcon

  return (
    <HeaderButton
      ref={forwardedRef}
      className={className}
      theme={theme}
      isGamePlay={isGamePlay}
      cryptlSkin={theme === "cryptle" ? skin : undefined}
      {...rest}
    >
      <CorrectInfoIcon className="h-[18px] w-[18px]" />
    </HeaderButton>
  )
})

export default Info
