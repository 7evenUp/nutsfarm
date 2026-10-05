import { useEffect, useRef } from "react"

import LockedLevel from "../../modals/locked-level"

import LevelLock from "@/assets/games/cryptle/icons/cryptle-level-lock.svg?react"

import { useGetNewLevelsInfiniteQuery } from "@/redux/api/games"

const BlockedLevel = ({
  hasToFetchNew,
  top,
  left,
  label,
}: {
  hasToFetchNew: boolean
  top: number
  left: number
  label: string
}) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  const { fetchNextPage, hasNextPage } = useGetNewLevelsInfiniteQuery({
    type: "WORDLY",
  })

  useEffect(() => {
    if (!buttonRef.current) return
    if (!hasToFetchNew) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (hasNextPage) {
            fetchNextPage()
          }
        }
      },
      {
        threshold: 0,
      },
    )

    observer.observe(buttonRef.current)

    return () => observer.disconnect()
  }, [buttonRef, hasNextPage, fetchNextPage, hasToFetchNew])

  return (
    <LockedLevel>
      <button
        className="absolute h-16 w-16 rounded-full bg-white"
        aria-label={label}
        ref={buttonRef}
        style={{
          top: top,
          left: left,
        }}
      >
        <div className="mx-auto flex h-[50px] w-[50px] items-center justify-center rounded-full border border-[#8056F099]/60 bg-gradient-to-b from-[#8E8EFB] to-[#8FB8FD]">
          <LevelLock className="" />
        </div>
      </button>
    </LockedLevel>
  )
}

export default BlockedLevel
