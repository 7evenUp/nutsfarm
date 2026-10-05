import { useLocation } from "react-router-dom"

import { useGetCurrentUserQuery } from "@/redux/api/user"

import { cn } from "@/lib/cn"

const PassNotification = () => {
  const { pathname } = useLocation()

  const { data: currentUser } = useGetCurrentUserQuery()

  if (currentUser === undefined || !currentUser.isNewNutPassReward) return null

  return (
    <div
      className={cn(
        "absolute -bottom-1 -right-1.5 flex h-3 w-3 items-center justify-center rounded-full",
        pathname === "/" ? "bg-[#17202D]" : "bg-[#0F1824]",
      )}
    >
      <div className="h-1.5 w-1.5 rounded-full bg-cyan" />
    </div>
  )
}

export default PassNotification
