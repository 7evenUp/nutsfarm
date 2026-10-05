import { useGetCurrentUserQuery } from "@/redux/api/user"

import { cn } from "@/lib/cn"

const UserNickname = ({ className }: { className?: string }) => {
  const { data: currentUser } = useGetCurrentUserQuery()

  if (!currentUser) return

  return (
    <p className={cn("truncate text-xs font-bold phone-sm:text-sm", className)}>
      {currentUser.username ||
        Telegram.WebApp.initDataUnsafe.user?.first_name ||
        "Username"}
    </p>
  )
}

export default UserNickname
