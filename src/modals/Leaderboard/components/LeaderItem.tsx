import { useEffect, useRef } from "react"

import UserIcon from "@/assets/icons/user.svg?react"

import { LeaderboardUser } from "@/types/leaderboard"

import { cn } from "@/lib/cn"
import { useAppDispatch } from "@/redux/hooks"
import { setOpenedProfileId } from "@/redux/slices/public-profile"

const LeaderItem = ({
  id,
  index,
  telegramPicture,
  firstname,
  hasToFetchNew,
  fetchNextPage,
  hasNextPage,
  children,
}: LeaderboardUser & {
  index: number
  hasToFetchNew: boolean
  fetchNextPage: VoidFunction
  hasNextPage: boolean
  children: React.ReactNode
}) => {
  const dispatch = useAppDispatch()
  const lastItemRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!lastItemRef.current) return
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

    observer.observe(lastItemRef.current)

    return () => observer.disconnect()
  }, [lastItemRef, hasNextPage, fetchNextPage, hasToFetchNew])

  return (
    <div
      className="flex h-[55px] shrink-0 items-center rounded-xl bg-[#0F1824] px-3.5"
      onClick={() => dispatch(setOpenedProfileId(id))}
      ref={lastItemRef}
    >
      <span
        className={cn(
          "w-[19px] shrink-0 text-center text-sm font-medium text-white/50",
          index + 4 >= 100 && "w-6",
          index + 4 >= 1000 && "w-8",
        )}
      >
        {index + 4}
      </span>
      {telegramPicture ? (
        <img
          src={telegramPicture}
          alt="User's avatar"
          loading="lazy"
          className="ml-2.5 h-6 w-6 shrink-0 rounded-full bg-white/10 object-cover"
        />
      ) : firstname ? (
        <div className="ml-2.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-medium">
          {firstname[0].toUpperCase()}
        </div>
      ) : (
        <div className="ml-2.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10">
          <UserIcon className="h-4 w-4" />
        </div>
      )}
      <span className="mx-2 truncate text-sm font-medium">
        {firstname ? firstname : "-"}
      </span>
      <div className="ml-auto flex shrink-0 items-center gap-1 text-sm font-medium">
        {children}
      </div>
    </div>
  )
}

export default LeaderItem
