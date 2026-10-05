import {
  ComponentProps,
  forwardRef,
  useEffect,
  useLayoutEffect,
  useState,
} from "react"
import { useLocation } from "react-router-dom"

import MusicCryptleIcon from "@/assets/games/cryptle/icons/music.svg?react"
import GreenMusicCryptleIcon from "@/assets/games/cryptle/icons/music-green.svg?react"
import PurpleMusicCryptleIcon from "@/assets/games/cryptle/icons/music-purple.svg?react"
import MusicPuzzlesIcon from "@/assets/games/puzzles/icons/music.svg?react"
import MusicFlipCardsIcon from "@/assets/games/flip-cards/icons/music.svg?react"

import HeaderButton from "../shared/HeaderButton"

import { useAppSelector } from "@/redux/hooks"

import { Sound } from "@/utils/Sound"
import { sendMetrika } from "@/utils/sendMetrika"

import { GameTheme } from "@/types/games"

import { cn } from "@/lib/cn"

const LOCAL_STORAGE_KEY = "music-setting"

const S3CloudUrl =
  import.meta.env.VITE_IS_DEV_LOCAL === undefined
    ? "https://s3-nutsfarm.crypton.xyz"
    : "https://s3-nutsfarm-dev.crypton.xyz"

const PuzzleMenuMusic = new Sound(
  `${S3CloudUrl}/sounds/games/puzzles/puzzles-menu.mp3`,
)
const PuzzleGameplayMusic = new Sound(
  `${S3CloudUrl}/sounds/games/puzzles/puzzles-gameplay.mp3`,
)
const FlipCardsMenuMusic = new Sound(
  `${S3CloudUrl}/sounds/games/flip-cards/flip-cards-menu.mp3`,
)
const FlipCardsGameplayMusic = new Sound(
  `${S3CloudUrl}/sounds/games/flip-cards/flip-cards-gameplay.mp3`,
)
const CryptleMenuMusic = new Sound(
  `${S3CloudUrl}/sounds/games/cryptle/cryptle-menu.mp3`,
)
const CryptleGameplayMusic = new Sound(
  `${S3CloudUrl}/sounds/games/cryptle/cryptle-gameplay.mp3`,
)

const Music = forwardRef<
  HTMLButtonElement,
  ComponentProps<"button"> & {
    theme: GameTheme
    isGamePlay: boolean
  }
>(({ className, theme, isGamePlay, ...rest }, forwardedRef) => {
  const { pathname } = useLocation()

  const skin = useAppSelector((state) => state.game.skin)

  const [puzzlesMusicLoaded, setPuzzlesMusicLoaded] = useState(false)
  const [flipCardsMusicLoaded, setFlipCardsMusicLoaded] = useState(false)
  const [cryptleMusicLoaded, setCryptleMusicLoaded] = useState(false)
  const [isMusicOn, setIsMusicOn] = useState(true)

  useLayoutEffect(() => {
    const hasMusic = localStorage.getItem(LOCAL_STORAGE_KEY)

    if (hasMusic) {
      if (pathname.includes("puzzles")) {
        Promise.all([PuzzleMenuMusic.load(), PuzzleGameplayMusic.load()]).then(
          () => setPuzzlesMusicLoaded(true),
        )
      }
      if (pathname.includes("flip-cards")) {
        Promise.all([
          FlipCardsMenuMusic.load(),
          FlipCardsGameplayMusic.load(),
        ]).then(() => setFlipCardsMusicLoaded(true))
      }
      if (pathname.includes("cryptle")) {
        Promise.all([
          CryptleMenuMusic.load(),
          CryptleGameplayMusic.load(),
        ]).then(() => setCryptleMusicLoaded(true))
      }
    } else {
      setIsMusicOn(false)
    }
  }, [isMusicOn, pathname])

  useEffect(() => {
    if (!isMusicOn) return

    if (pathname.includes("puzzles/gameplay")) {
      if (puzzlesMusicLoaded) PuzzleGameplayMusic.play(true, 0.1)
    } else if (pathname.includes("puzzles")) {
      if (puzzlesMusicLoaded) PuzzleMenuMusic.play(true, 0.15)
    }
    if (pathname.includes("flip-cards/gameplay")) {
      if (flipCardsMusicLoaded) FlipCardsGameplayMusic.play(true, 0.15)
    } else if (pathname.includes("flip-cards")) {
      if (flipCardsMusicLoaded) FlipCardsMenuMusic.play(true, 0.1)
    }
    if (pathname.includes("cryptle/gameplay")) {
      if (cryptleMusicLoaded) CryptleGameplayMusic.play(true, 0.15)
    } else if (pathname.includes("cryptle")) {
      if (cryptleMusicLoaded) CryptleMenuMusic.play(true, 0.1)
    }

    return () => {
      PuzzleMenuMusic.stop()
      PuzzleGameplayMusic.stop()
      FlipCardsMenuMusic.stop()
      FlipCardsGameplayMusic.stop()
      CryptleMenuMusic.stop()
      CryptleGameplayMusic.stop()
    }
  }, [
    pathname,
    isMusicOn,
    puzzlesMusicLoaded,
    flipCardsMusicLoaded,
    cryptleMusicLoaded,
  ])

  const handleMusicClick = () => {
    if (isMusicOn) {
      setIsMusicOn(false)
      localStorage.removeItem(LOCAL_STORAGE_KEY)
      sendMetrika("sound_turnoff_click")
    } else {
      setIsMusicOn(true)
      localStorage.setItem(LOCAL_STORAGE_KEY, "true")
    }
  }

  if (theme === "default") return

  const CorrectMusicIcon =
    theme === "cryptle"
      ? !isGamePlay
        ? MusicCryptleIcon
        : skin === "GREEN"
          ? GreenMusicCryptleIcon
          : skin === "PURPLE"
            ? PurpleMusicCryptleIcon
            : MusicCryptleIcon
      : theme === "flip-cards"
        ? MusicFlipCardsIcon
        : MusicPuzzlesIcon

  return (
    <HeaderButton
      ref={forwardedRef}
      className={className}
      theme={theme}
      onClick={handleMusicClick}
      cryptlSkin={theme === "cryptle" ? skin : undefined}
      isGamePlay={isGamePlay}
      {...rest}
    >
      {theme === "cryptle"}
      <CorrectMusicIcon
        className={cn(
          "h-[18px] w-[18px]",
          !isMusicOn && (theme === "flip-cards" ? "opacity-40" : "opacity-30"),
        )}
      />
    </HeaderButton>
  )
})

export default Music
