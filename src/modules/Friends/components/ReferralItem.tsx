import { useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

import UsersIcon from "@/assets/icons/users.svg?react"
import UserIcon from "@/assets/icons/user.svg?react"
import Bell from "@/assets/icons/notification-bell.svg?react"
import Loader from "@/assets/icons/loader.svg?react"

import { useNotifyFriendMutation } from "@/redux/api/notification"

import { ReferralInfo } from "@/types/referral-info"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"
import { numberWithSpaces } from "@/utils/numberWithSpaces"
import { sendMetrika } from "@/utils/sendMetrika"

const ReferralItem = ({
  id,
  balance,
  username,
  telegramPicture,
  referralCount,
  firstname,
  nextNotificationTime,
}: ReferralInfo) => {
  const { t } = useTranslation()

  const [notifyLocked, setNotifyLocked] = useState(false)

  const [mutate, { isSuccess }] = useNotifyFriendMutation()

  const notifyFriend = async () => {
    if (notifyLocked) return

    sendMetrika("notify_single_friend")

    makeHapticFeedback({ impactOccured: "soft" })

    setNotifyLocked(true)

    try {
      await mutate({ userId: id }).unwrap()
      toast(t("Друг успешно уведомлён"), {
        className: "justify-center text-center",
      })
    } catch {
      toast.error(t("Ошибка"), {
        description: t("Упс, что-то пошло не так"),
      })
    }
  }

  return (
    <div className="flex items-center gap-2.5">
      {telegramPicture ? (
        <img
          className="h-[42px] w-[42px] rounded-full bg-[#1C2430]"
          alt="Telegram profile picture"
          src={telegramPicture}
        />
      ) : firstname ? (
        <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#1C2430] text-sm font-medium">
          {firstname[0].toUpperCase()}
        </div>
      ) : username ? (
        <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#1C2430] text-sm font-medium">
          {username[0].toUpperCase()}
        </div>
      ) : (
        <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#1C2430]">
          <UserIcon className="h-5 w-5" />
        </div>
      )}
      <div className="flex flex-col">
        <span className="text-sm font-semibold">
          {username && username !== "Unknown" ? username : firstname}
        </span>
        <div className="flex items-center gap-2">
          <UsersIcon className="h-3 w-3 text-white/50" />
          <span className="text-sm font-semibold text-white/50">
            {referralCount ? `+ ${referralCount}` : "0"}
          </span>
        </div>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-2.5">
        <span className="text-base font-semibold">
          {balance ? numberWithSpaces(balance, true) : "0"}
        </span>
        {isSuccess ? (
          <CheckIcon />
        ) : nextNotificationTime === null ? (
          <button
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#55A3FF]/20 transition-colors active:bg-[#55A3FF]/15"
            onClick={notifyFriend}
            disabled={notifyLocked}
          >
            {notifyLocked ? (
              <Loader className="h-4 w-4 animate-spin text-[#55A3FF]" />
            ) : (
              <Bell className="h-4 w-4 text-[#55A3FF]" />
            )}
          </button>
        ) : (
          <CheckIcon />
        )}
      </div>
    </div>
  )
}

export default ReferralItem

const CheckIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="28" height="28" rx="8" fill="#55A3FF" fillOpacity="0.2" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M19.6805 10.2929C20.1065 10.6834 20.1065 11.3166 19.6805 11.7071L13.135 17.7071C12.9202 17.9041 12.6254 18.01 12.3218 17.9993C12.0181 17.9886 11.7331 17.8623 11.5354 17.6508L8.26265 14.1508C7.87055 13.7315 7.92353 13.1002 8.38097 12.7407C8.83842 12.3813 9.52711 12.4299 9.91921 12.8492L12.4253 15.5293L18.1377 10.2929C18.5637 9.90237 19.2545 9.90237 19.6805 10.2929Z"
      fill="#4C6A88"
    />
  </svg>
)
