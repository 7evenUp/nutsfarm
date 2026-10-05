import { useEffect, useRef } from "react"

import BlockedLevelIcon from "@/assets/games/flip-cards/icons/blocked-level.svg?react"

import LockedLevel from "../modals/LockedLevel"

import { useGetNewLevelsInfiniteQuery } from "@/redux/api/games"

const BlockedLevel = ({ hasToFetchNew }: { hasToFetchNew: boolean }) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  const { fetchNextPage, hasNextPage } = useGetNewLevelsInfiniteQuery({
    type: "CARDS",
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
      <button className="relative" ref={buttonRef}>
        <BlockedLevelIcon className="relative h-[79px] w-[71px]" />
      </button>
    </LockedLevel>
  )
}

export default BlockedLevel
