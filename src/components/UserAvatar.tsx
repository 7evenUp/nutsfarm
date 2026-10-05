import UserIcon from "@/assets/icons/user.svg?react"

import { useGetCurrentUserQuery } from "@/redux/api/user"
import { useAppSelector } from "@/redux/hooks"

import { cn } from "@/lib/cn"

const UserAvatar = ({
  className,
  onClick,
}: {
  className?: string
  onClick?: VoidFunction
}) => {
  const nutcrackerAvatar = useAppSelector(
    (state) => state.nutcrackerAvatar.nutcrackerAvatarSrc,
  )

  const { data: currentUser } = useGetCurrentUserQuery()

  if (!currentUser) return

  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full bg-[#1C2430] text-sm text-white phone-sm:text-base",
        className,
      )}
      onClick={onClick}
    >
      {nutcrackerAvatar !== null ? (
        <img
          src={nutcrackerAvatar}
          alt="User's avatar"
          className="h-full w-full rounded-full object-cover"
        />
      ) : currentUser.telegramPicture ? (
        <img
          src={currentUser.telegramPicture}
          alt="User's avatar"
          className="h-full w-full rounded-full object-cover"
        />
      ) : currentUser.username ? (
        currentUser.username[0]
      ) : Telegram.WebApp.initDataUnsafe.user?.first_name ? (
        Telegram.WebApp.initDataUnsafe.user?.first_name[0]
      ) : (
        <UserIcon className="h-6 w-6" />
      )}
    </div>
  )
}

export default UserAvatar
