//icons
import UserIcon from "@/assets/icons/user.svg?react"
import { useTranslation } from "react-i18next"

interface UserProfile {
  avatar: string
  name: string
  joinDate: string // Ожидается строка в формате UTC (например, "")
}

const UserProfile = ({ avatar, name, joinDate }: UserProfile) => {
  const { t, i18n } = useTranslation()

  // Функция для форматирования даты
  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString).toLocaleDateString(i18n.language)

    return t("userProfile.joinDate") + ` ${date}`
  }

  return (
    <div className="flex items-center justify-between gap-4 px-3.5">
      <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-[#1C2430] text-sm text-white phone-sm:text-base">
        {avatar ? (
          <img
            src={avatar}
            alt="User's avatar"
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <UserIcon className="h-6 w-6" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <p className="max-w-[180px] truncate text-sm font-bold phone-xsm:max-w-[200px] phone-sm:max-w-[240px] phone-sm:text-base phone:max-w-[260px]">
          {name}
        </p>
        <span className="text-xs text-white/50">
          {joinDate ? formatJoinDate(joinDate) : t("userProfile.noDate")}
        </span>
      </div>
    </div>
  )
}

export default UserProfile
