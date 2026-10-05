import HelpCircleIcon from "@/assets/icons/circle-help.svg?react"
import LinkIcon from "@/assets/icons/link.svg?react"
import StoriesIcon from "@/assets/icons/stories.svg?react"
import TelegramIcon from "@/assets/icons/telegram.svg?react"
import GroupIcon from "@/assets/icons/group.svg?react"
import PartnerIcon from "@/assets/icons/partner.svg?react"

import CryptonIcon from "@/assets/task-icons/Crypton.svg?react"
import ResearchIcon from "@/assets/task-icons/Research.svg?react"
import CalendarIcon from "@/assets/task-icons/Calendar.svg?react"
import NutsIcon from "@/assets/task-icons/Nuts.svg?react"
import IdIcon from "@/assets/task-icons/Id.svg?react"
import TwitterIcon from "@/assets/task-icons/Twitter.svg?react"
import DropsIcon from "@/assets/task-icons/Drops.svg?react"
import ArkhamIcon from "@/assets/task-icons/Arkham.svg?react"
import LearnIcon from "@/assets/task-icons/Learn.svg?react"
import TwitchIcon from "@/assets/task-icons/Twitch.svg?react"
import CreateAccountIcon from "@/assets/task-icons/create_account.svg?react"
import BangeMoonveilIcon from "@/assets/task-icons/badge_moonveil.svg?react"
import GalochkaIcon from "@/assets/task-icons/galochka.svg?react"
import VoprosIcon from "@/assets/task-icons/vopros.svg?react"
import CalendarWithoutGradientIcon from "@/assets/task-icons/calendar-without-gradient.svg?react"
import OcryptusLogo from "@/assets/task-icons/ocryptus.png"
import HiPinLogo from "@/assets/task-icons/hi-pin-logo.png"
import CryptoWiki from "@/assets/task-icons/cryptowikisvg.svg?react"
import YoutubeIcon from "@/assets/task-icons/Youtube.svg?react"
import HandYoutube from "@/assets/task-icons/youtube-hand.svg?react"
import HandTwitter from "@/assets/task-icons/twitter-hand.svg?react"
import HandTiktok from "@/assets/task-icons/tiktok-hand.svg?react"
import HandPepe from "@/assets/task-icons/pepe-hand.svg?react"
import HandMoonveil from "@/assets/task-icons/moonveil-hand.svg?react"
import AppVotePNG from "@/assets/task-icons/app_vote.png"
import PassPurchasePNG from "@/assets/task-icons/pass-purchase.png"
import SoulLogoPNG from "@/assets/task-icons/SoulGroupIcon.jpg"
import StickerXLogo from "@/assets/task-icons/StickerXLogo.svg?react"
import CapsGamePng from "@/assets/task-icons/CapsGame.png"

import BookIcon from "@/assets/lesson-icons/book1.svg?react"

import WheelIcon from "@/assets/games/shared-icons/wheel.svg?react"

import { TaskType } from "@/types/task"

import { cn } from "@/lib/cn"

export const CRYPTON_ICONS_MAP = ["1", "2", "3", "5"]

const TaskIcon = ({
  icon,
  type,
  iconClassName,
}: {
  icon: string
  type: TaskType
  iconClassName: string
}) => {
  if (icon === "1") return <CryptonIcon className={iconClassName} />
  if (icon === "2") return <ResearchIcon className={iconClassName} />
  if (icon === "3") return <CalendarIcon className={iconClassName} />
  if (icon === "4") return <NutsIcon className={iconClassName} />
  if (icon === "5") return <IdIcon className={iconClassName} />
  if (icon === "6") return <TwitterIcon className={iconClassName} />
  if (icon === "7") return <TelegramIcon className={iconClassName} />
  if (icon === "8") return <DropsIcon className={iconClassName} />
  if (icon === "9") return <ArkhamIcon className={iconClassName} />
  if (icon === "10") return <LearnIcon className={iconClassName} />
  if (icon === "11") return <TwitchIcon className={iconClassName} />
  if (icon === "12")
    return (
      <img alt="Partner logo" src={OcryptusLogo} className={iconClassName} />
    )
  if (icon === "13") return <CreateAccountIcon className={iconClassName} />
  if (icon === "14") return <BangeMoonveilIcon className={iconClassName} />
  if (icon === "15") return <GalochkaIcon className={iconClassName} />
  if (icon === "16") return <VoprosIcon className={iconClassName} />
  if (icon === "17")
    return <CalendarWithoutGradientIcon className={iconClassName} />
  if (icon === "18") return <CryptoWiki className={iconClassName} />
  if (icon === "19") return <YoutubeIcon className={iconClassName} />
  if (icon === "20")
    return <img alt="Partner logo" src={HiPinLogo} className={iconClassName} />
  if (icon === "21") return <StickerXLogo className={iconClassName} />
  if (icon === "22") return <HandYoutube className={iconClassName} />
  if (icon === "23") return <HandTwitter className={iconClassName} />
  if (icon === "24") return <HandTiktok className={iconClassName} />
  if (icon === "25") return <HandPepe className={iconClassName} />
  if (icon === "26")
    return <img alt="App Vote" src={AppVotePNG} className={iconClassName} />
  if (icon === "27")
    return (
      <img
        alt="Pass Purchase"
        src={PassPurchasePNG}
        className={iconClassName}
      />
    )
  if (icon === "28") return <HandMoonveil className={iconClassName} />

  if (
    type === "CRYPTON_ONBOARDING" ||
    type === "USER_ANSWER" ||
    type === "MANUAL_USER_ANSWER" ||
    type === "MANUAL_UGC"
  )
    return <HelpCircleIcon className={iconClassName} />
  if (type === "URL") return <LinkIcon className={iconClassName} />
  if (type === "STORIES") return <StoriesIcon className={iconClassName} />
  if (type === "TELEGRAM_CHANNEL_SUBSCRIPTION" || type === "TG_ADS_TASK_DAILY")
    return <TelegramIcon className={iconClassName} />
  if (
    type === "RECRUIT_REFERRALS" ||
    type === "NOTIFICATION" ||
    type === "ALL_FRIENDS_NOTIFICATION"
  )
    return <GroupIcon className={iconClassName} />
  if (type === "PARTNER_SUBSCRIPTION")
    return <PartnerIcon className={iconClassName} />
  if (type === "LEARN_LESSON") return <BookIcon className={iconClassName} />
  if (type === "HOME_SCREEN_ICON") return <HomeIcon className={iconClassName} />
  if (type === "SOUL_PARTNER_SUBSCRIPTION")
    return (
      <img
        alt="Soul Logo"
        src={SoulLogoPNG}
        className={cn("rounded-md", iconClassName)}
      />
    )
  if (type === "CAPS_GAME_PARTNER_COMPLETED_COLLECTION")
    return (
      <img alt="CapsGame Logo" src={CapsGamePng} className={iconClassName} />
    )
  if (type === "NUT_PASS_PURCHASE" || type === "NUT_PASS_REACH_LEVEL")
    return (
      <img
        alt="Pass Purchase"
        src={PassPurchasePNG}
        className={iconClassName}
      />
    )
  if (
    type === "CRYPTLE_WIN_IN_N_STEPS" ||
    type === "CRYPTLE_USE_HINT" ||
    type === "SPIN_WHEEL_WIN_NFT" ||
    type === "SPIN_WHEEL_WIN_JACKPOT" ||
    type === "COMPLETE_GAME_LEVELS" ||
    type === "COMPLETE_HARD_GAME_LEVELS" ||
    type === "SPIN_WHEEL"
  )
    return <WheelIcon className={iconClassName} />
}

export default TaskIcon

const HomeIcon = ({ className }: { className?: string }) => (
  <svg
    width="36"
    height="31"
    viewBox="0 0 36 31"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M35.6624 15.835L27.9259 8.09767V2.99508C27.9259 2.3595 27.4096 1.84375 26.774 1.84375C26.1384 1.84375 25.6227 2.3595 25.6227 2.99508V5.79613L20.1641 0.336831C19.7145 -0.112277 18.986 -0.112277 18.5374 0.336831L11.395 7.47888C10.9448 7.92799 10.9448 8.65709 11.395 9.10676C11.8447 9.55587 12.5732 9.55587 13.0217 9.10676L19.3499 2.77893L34.034 17.4629C34.2591 17.6869 34.5536 17.8005 34.8476 17.8005C35.1427 17.8005 35.4378 17.688 35.6618 17.4629C36.1126 17.0138 36.1126 16.2847 35.6624 15.835Z"
      fill="white"
    />
    <path
      d="M32.3692 19.215L20.1636 7.00955C19.948 6.79339 19.6557 6.67188 19.35 6.67188C19.0448 6.67188 18.7531 6.79339 18.5369 7.00955L13.8472 11.6994C16.9516 13.2478 19.1747 16.3003 19.5577 19.9015C20.5069 20.0908 21.2147 20.9285 21.2147 21.9197V26.2943C21.2147 26.9954 21.479 27.6652 21.9572 28.1831C22.4824 28.751 23.2266 29.0769 23.9983 29.0769H29.9558C31.489 29.0769 32.7383 27.8287 32.7383 26.2943V20.3389C32.7383 20.1642 32.722 19.9866 32.6867 19.8114C32.6431 19.5846 32.5322 19.3774 32.3692 19.215Z"
      fill="white"
    />
    <path
      d="M8.71535 12.6191C3.9013 12.6191 0 16.5222 0 21.3348C0 26.1484 3.90186 30.0498 8.71535 30.0498C13.5288 30.0498 17.4307 26.1473 17.4307 21.3353C17.4313 16.5217 13.5294 12.6191 8.71535 12.6191ZM11.5706 22.7745H10.1545V24.189C10.1545 24.9842 9.51051 25.627 8.71591 25.627C7.92076 25.627 7.27735 24.9842 7.27735 24.189V22.7745H5.86119C5.0666 22.7745 4.42263 22.1305 4.42263 21.3359C4.42263 20.5413 5.0666 19.8973 5.86119 19.8973H7.27735V18.4827C7.27735 17.6887 7.92076 17.0441 8.71591 17.0441C9.51051 17.0441 10.1545 17.6887 10.1545 18.4827V19.8973H11.5706C12.3652 19.8973 13.0086 20.5413 13.0086 21.3359C13.0086 22.1305 12.3652 22.7745 11.5706 22.7745Z"
      fill="white"
    />
  </svg>
)
