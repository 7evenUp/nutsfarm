import { ComponentProps, forwardRef, useEffect, useState } from "react"
import { useLocation } from "react-router-dom"

import MusicCryptleIcon from "@/assets/games/cryptle/icons/music.svg?react"
import GreenMusicCryptleIcon from "@/assets/games/cryptle/icons/music-green.svg?react"
import PurpleMusicCryptleIcon from "@/assets/games/cryptle/icons/music-purple.svg?react"
import MusicPuzzlesIcon from "@/assets/games/puzzles/icons/music.svg?react"
import MusicFlipCardsIcon from "@/assets/games/flip-cards/icons/music.svg?react"

import HeaderButton from "../shared/HeaderButton"

import { useAppSelector } from "@/redux/hooks"

import { Sound, unlockAudio } from "@/utils/Sound"
import { isSoundEnabled } from "@/utils/makeSoundFeedback"
import { readStorage, writeStorage } from "@/demo/storage"
import { sendMetrika } from "@/utils/sendMetrika"

import { GameTheme } from "@/types/games"

import { cn } from "@/lib/cn"

const LOCAL_STORAGE_KEY = "nutsfarm-demo:music-setting"

const PuzzleMenuMusic = new Sound("/sounds/games/puzzles/puzzles-menu.mp3")
const PuzzleGameplayMusic = new Sound(
  "/sounds/games/puzzles/puzzles-gameplay.mp3",
)
const FlipCardsMenuMusic = new Sound(
  "/sounds/games/flip-cards/flip-cards-menu.mp3",
)
const FlipCardsGameplayMusic = new Sound(
  "/sounds/games/flip-cards/flip-cards-gameplay.mp3",
)
const CryptleMenuMusic = new Sound("/sounds/games/cryptle/cryptle-menu.mp3")
const CryptleGameplayMusic = new Sound(
  "/sounds/games/cryptle/cryptle-gameplay.mp3",
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

  const lang = useAppSelector((state) => state.language.value)
  const [isMusicOn, setIsMusicOn] = useState(
    () =>
      (readStorage(LOCAL_STORAGE_KEY) ?? readStorage("music-setting")) ===
      "true",
  )
  const [soundEnabled, setSoundEnabled] = useState(isSoundEnabled)

  useEffect(() => {
    const update = () => setSoundEnabled(isSoundEnabled())
    window.addEventListener("nutsfarm:sound-setting", update)
    return () => window.removeEventListener("nutsfarm:sound-setting", update)
  }, [])

  useEffect(() => {
    if (!isMusicOn || !soundEnabled) return
    const music = pathname.includes("puzzles")
      ? isGamePlay
        ? PuzzleGameplayMusic
        : PuzzleMenuMusic
      : pathname.includes("flip-cards")
        ? isGamePlay
          ? FlipCardsGameplayMusic
          : FlipCardsMenuMusic
        : pathname.includes("cryptle")
          ? isGamePlay
            ? CryptleGameplayMusic
            : CryptleMenuMusic
          : null
    if (!music) return
    let active = true
    void music.load().then((buffer) => {
      if (active && buffer) music.play(true, 0.12)
    })
    return () => {
      active = false
      music.stop()
    }
  }, [pathname, isGamePlay, isMusicOn, soundEnabled])

  const handleMusicClick = () => {
    void unlockAudio()
    const next = !isMusicOn
    setIsMusicOn(next)
    writeStorage(LOCAL_STORAGE_KEY, String(next))
    if (!next) sendMetrika("sound_turnoff_click")
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
      aria-label={lang === "RU" ? "Фоновая музыка" : "Background music"}
      aria-pressed={isMusicOn && soundEnabled}
      disabled={!soundEnabled}
      cryptlSkin={theme === "cryptle" ? skin : undefined}
      isGamePlay={isGamePlay}
      {...rest}
    >
      {theme === "cryptle"}
      <CorrectMusicIcon
        className={cn(
          "h-[18px] w-[18px]",
          (!isMusicOn || !soundEnabled) &&
            (theme === "flip-cards" ? "opacity-40" : "opacity-30"),
        )}
      />
    </HeaderButton>
  )
})

export default Music
