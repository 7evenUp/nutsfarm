import { useMemo } from "react"
import { useLocation } from "react-router-dom"

import { useAppSelector } from "@/redux/hooks"
import { useGetActiveModulesQuery } from "@/redux/api/learn"

import { cn } from "@/lib/cn"

const LearnNotification = () => {
  const { pathname } = useLocation()

  const lang = useAppSelector((state) => state.language.value)
  const countryCode = useAppSelector((state) => state.countryCode.value)

  const { data: modules } = useGetActiveModulesQuery({
    lang,
    region: countryCode,
  })

  const unclaimedLessons = useMemo(() => {
    if (!modules) return []

    const lessonsList = modules.flatMap((module) => module.lessons)

    if (lessonsList.length === 0) return []

    return lessonsList.filter(
      (lesson) =>
        lesson.blocks && lesson.blocks.length > 0 && !lesson.isClaimed,
    )
  }, [modules])

  if (unclaimedLessons.length === 0) return null

  return (
    <div
      className={cn(
        "absolute -bottom-1 -right-1.5 flex h-3 w-3 items-center justify-center rounded-full",
        pathname === "/" ? "bg-[#17202D]" : "bg-[#0F1824]",
      )}
    >
      <div className="h-1.5 w-1.5 rounded-full bg-[#EED052]" />
    </div>
  )
}

export default LearnNotification
