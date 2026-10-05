import { useEffect, useRef } from "react"

import BlockedLevelIcon from "@/assets/games/puzzles/icons/blocked-level.svg?react"

import LockedLevel from "../modals/LockedLevel"

import { useGetNewLevelsInfiniteQuery } from "@/redux/api/games"

const BlockedLevel = ({ hasToFetchNew }: { hasToFetchNew: boolean }) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  const { fetchNextPage, hasNextPage } = useGetNewLevelsInfiniteQuery({
    type: "PUZZLES",
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
      <button className="h-[60px] w-[60px]" ref={buttonRef}>
        <BlockedLevelIcon className="h-[68px] w-[68px] -translate-x-1 -translate-y-0.5" />
      </button>
    </LockedLevel>
  )
}

export default BlockedLevel
