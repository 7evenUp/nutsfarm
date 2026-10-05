import * as Collapsible from "@radix-ui/react-collapsible"
import { useTranslation } from "react-i18next"

import ChevronIcon from "@/assets/icons/chevron.svg?react"
import DropsIcon from "@/assets/task-icons/Drops.svg?react"
import CalendarIcon from "@/assets/task-icons/Calendar.svg?react"
import MoonveilLogoPNG from "@/assets/task-icons/moonveil-logo.png"
import HiPinLogoPNG from "@/assets/task-icons/hi-pin-logo.png"
import PartnerIcon from "@/assets/icons/partner.svg?react"
import Coin from "@/assets/icons/coin.svg?react"
import SleepagotchiPng from "@/assets/task-icons/sleepagotchi.png"
import CapsGamePng from "@/assets/task-icons/CapsGame.png"
import CryptoWiki from "@/assets/task-icons/cryptowikisvg.svg?react"
import SoulLogoPNG from "@/assets/task-icons/SoulGroupIcon.jpg"
import StickerXLogo from "@/assets/task-icons/StickerXLogo.svg?react"

import ActivePartnerTask from "./ActivePartnerTask"
import PartnerUserTask from "./PartnerUserTask"
import ActiveTaskButton from "./buttons/ActiveTaskButton"
import UserTaskButton from "./buttons/UserTaskButton"

import {
  useGetActiveTasksQuery,
  useGetCurrentTasksQuery,
} from "@/redux/api/task"
import { useAppSelector } from "@/redux/hooks"

import { Lesson as LessonType } from "@/types/learn"

import { numberWithSpaces } from "@/utils/numberWithSpaces"

import { cn } from "@/lib/cn"

const PartnerGroup = ({
  partnerName,
  lessonsList,
}: {
  partnerName: string
  lessonsList: (LessonType & { isActive: boolean })[]
}) => {
  const countryCode = useAppSelector((state) => state.countryCode.value)
  const lang = useAppSelector((state) => state.language.value)

  const { data: activeTasks } = useGetActiveTasksQuery({
    lang,
    region: countryCode,
    showHomeTask:
      Telegram.WebApp.platform === "android" ||
      Telegram.WebApp.platform === "ios",
  })
  const { data: currentTasks } = useGetCurrentTasksQuery({ lang })

  if (!activeTasks || !currentTasks) return null

  const filteredActiveTasks = activeTasks.filter(({ task }) => {
    if (task.partnerName === null) return false
    if (task.partnerName !== partnerName) return false

    return currentTasks.find((currentTask) => currentTask.taskId === task.id)
      ? false
      : true
  })

  const claimedTasks = currentTasks.filter((task) => {
    if (!task.isActive) return false

    if (task.partnerName === null) return false
    if (task.partnerName !== partnerName) return false

    return task.status !== "CLAIMED" ? false : true
  })

  const unclaimedTasks = currentTasks.filter((task) => {
    if (!task.isActive) return false

    if (task.partnerName === null) return false
    if (task.partnerName !== partnerName) return false

    return task.status === "CLAIMED" ? false : true
  })

  // if (filteredActiveTasks.length === 0 && unclaimedTasks.length === 0)
  //   return null

  const totalTasks =
    filteredActiveTasks.length + claimedTasks.length + unclaimedTasks.length
  const totalReward =
    filteredActiveTasks.reduce((a, b) => a + b.task.reward, 0) +
    unclaimedTasks.reduce((a, b) => a + b.reward, 0) +
    claimedTasks.reduce((a, b) => a + b.reward, 0)
  const totalXpReward =
    filteredActiveTasks.reduce((a, b) => {
      if (b.task.nutPassXp) return a + b.task.nutPassXp
      return a
    }, 0) +
    unclaimedTasks.reduce((a, b) => {
      if (b.nutPassXp) return a + b.nutPassXp
      return a
    }, 0) +
    claimedTasks.reduce((a, b) => {
      if (b.nutPassXp) return a + b.nutPassXp
      return a
    }, 0)

  if (totalTasks === 1) {
    return (
      <div
        className={cn(
          "mb-2 flex w-full gap-2.5 rounded-2xl bg-gradient-to-br from-[#0F1824] to-[#1b2839] py-1.5 pl-2 pr-2.5",
          partnerName === "drops" && "from-[#28B7E5] to-[#AF2AFF]",
          partnerName === "moonveil" && "from-[#3461C5] to-[#4086DD]",
          partnerName === "calendar" && "from-[#EB2629] to-[#F6306C]",
          partnerName === "sleepagotchi" && "from-[#231047] to-[#6B16BC]",
          partnerName === "cryptowiki" && "from-[#319369]/90 to-[#2CFF9A]/90",
          partnerName === "soul" && "from-[#424F00] to-[#C2E902]",
          partnerName === "StickerX" && "from-[#1990EE] to-[#52A7EC]",
          partnerName === "capsgame" && "from-[#E54C46] to-[#E1C63C]",
          filteredActiveTasks.length === 0 &&
            unclaimedTasks.length === 0 &&
            "opacity-75",
        )}
      >
        <div className="flex flex-col justify-between gap-1">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#050D12]">
            <GroupIcon partnerName={partnerName} />
          </div>
          <div className="flex h-[22px] w-16 items-center justify-center gap-1 rounded-full bg-[#050D12] text-white/75">
            <CheckIcon />
            <span className="text-xs font-bold">
              {filteredActiveTasks.length === 0 && unclaimedTasks.length === 0
                ? 1
                : 0}
              /1
            </span>
          </div>
        </div>
        <div className="flex flex-col items-start gap-[5px] pt-1.5">
          <span className="text-left text-sm/[16px] font-bold">
            <PartnerName partnerName={partnerName} />
          </span>
          <span className="text-balance text-left text-xs font-medium">
            <PartnerDescription partnerName={partnerName} />
          </span>
          <div className="mt-auto flex flex-wrap gap-1">
            <div className="flex h-[22px] items-center gap-1 rounded-full bg-[#050D12] pl-1 pr-1.5">
              <Coin className="h-3 w-3" />
              <span className="text-xs font-bold text-[#FEED1E]">
                {numberWithSpaces(totalReward)}
              </span>
            </div>
            {totalXpReward > 0 && (
              <div className="flex h-[22px] min-w-max items-center justify-center gap-1 rounded-full bg-[#050D12] px-1.5 text-xs/none font-bold text-[#F68DF1]">
                {numberWithSpaces(totalXpReward)} XP
              </div>
            )}
          </div>
        </div>
        {filteredActiveTasks.length > 0 && (
          <ActiveTaskButton
            {...filteredActiveTasks[0]}
            appearance="white"
            className="my-auto"
            lessonsList={lessonsList}
          />
        )}
        {unclaimedTasks.length > 0 && (
          <UserTaskButton
            {...unclaimedTasks[0]}
            appearance="white"
            className="my-auto"
          />
        )}
      </div>
    )
  }

  return (
    <Collapsible.Root
      className={cn(
        "mb-2 flex w-full flex-col items-center rounded-2xl bg-gradient-to-br from-[#0F1824] to-[#1b2839] py-1.5 pl-2 pr-2.5 text-white",
        partnerName === "drops" && "from-[#22BCE2] to-[#B325FF]",
        partnerName === "moonveil" && "from-[#3461C5] to-[#4086DD]",
        partnerName === "calendar" && "from-[#EB2629] to-[#F6306C]",
        partnerName === "cryptowiki" && "from-[#319369]/90 to-[#2CFF9A]/90",
        filteredActiveTasks.length === 0 &&
          unclaimedTasks.length === 0 &&
          "opacity-75",
        partnerName === "hi-pin" && "from-[#B43ABE] to-[#52A7EC]",
        partnerName === "soul" && "from-[#424F00] to-[#C2E902]",
        partnerName === "StickerX" && "from-[#1990EE] to-[#52A7EC]",
        partnerName === "capsgame" && "from-[#E54C46] to-[#E1C63C]",
      )}
    >
      <Collapsible.CollapsibleTrigger className="group flex w-full gap-3">
        <div className="flex flex-col justify-between gap-1">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#050D12]">
            <GroupIcon partnerName={partnerName} />
          </div>
          <div className="flex h-[22px] w-16 items-center justify-center gap-1 rounded-full bg-[#050D12] text-white/75">
            <CheckIcon />
            <span className="text-xs font-bold">
              {claimedTasks.length}/{totalTasks}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-start justify-between gap-[5px] pt-1.5">
          <div className="flex flex-col items-start gap-1.5">
            <span className="text-left text-sm/[16px] font-bold">
              <PartnerName partnerName={partnerName} />
            </span>
            <span className="text-balance text-left text-xs font-medium">
              <PartnerDescription partnerName={partnerName} />
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            <div className="flex h-[22px] items-center gap-1 rounded-full bg-[#050D12] pl-1 pr-1.5">
              <Coin className="h-3 w-3" />
              <span className="text-xs font-bold text-[#FEED1E]">
                {numberWithSpaces(totalReward)}
              </span>
            </div>
            {totalXpReward > 0 && (
              <div className="flex h-[22px] min-w-max items-center justify-center gap-1 rounded-full bg-[#050D12] px-1.5 text-xs/none font-bold text-[#F68DF1]">
                {numberWithSpaces(totalXpReward)} XP
              </div>
            )}
          </div>
        </div>
        <div className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center self-center rounded-lg bg-white">
          <ChevronIcon className="text-black transition-transform group-data-[state=open]:rotate-180" />
        </div>
      </Collapsible.CollapsibleTrigger>
      <Collapsible.Content className="w-full overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="mt-4 flex flex-col gap-2">
          {unclaimedTasks.map((task) => (
            <PartnerUserTask key={task.id} {...task} />
          ))}
          {filteredActiveTasks.map((task) => (
            <ActivePartnerTask
              key={task.id}
              {...task}
              lessonsList={lessonsList}
            />
          ))}
          {claimedTasks.map((task) => (
            <PartnerUserTask key={task.id} {...task} isClaimed />
          ))}
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

export default PartnerGroup

const CheckIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="6" cy="6" r="6" fill="currentColor" />
    <path
      d="M3.35352 5.64648L5.35352 7.64648"
      stroke="#050D12"
      strokeLinecap="round"
    />
    <path
      d="M9.70707 4.70707C9.90233 4.51181 9.90233 4.19522 9.70707 3.99996C9.51181 3.8047 9.19522 3.8047 8.99996 3.99996L9.70707 4.70707ZM8.99996 3.99996L4.99996 7.99996L5.70707 8.70707L9.70707 4.70707L8.99996 3.99996Z"
      fill="#050D12"
    />
  </svg>
)

const GroupIcon = ({ partnerName }: { partnerName: string }) => {
  if (partnerName === "drops") return <DropsIcon className="h-10 w-auto" />
  if (partnerName === "moonveil")
    return (
      <img
        src={MoonveilLogoPNG}
        className="h-[30px] w-[52px]"
        alt="moonveil logo"
      />
    )
  if (partnerName === "calendar")
    return <CalendarIcon className="h-10 w-auto" />
  if (partnerName === "sleepagotchi")
    return (
      <img
        src={SleepagotchiPng}
        className="h-11 w-11 rounded-lg"
        alt="sleepagotchi logo"
      />
    )
  if (partnerName === "cryptowiki") return <CryptoWiki className="h-5 w-auto" />
  if (partnerName === "soul")
    return <img src={SoulLogoPNG} className="h-11" alt="Soul logo" />
  if (partnerName === "hi-pin")
    return <img src={HiPinLogoPNG} className="h-10 w-10" alt="moonveil logo" />
  if (partnerName === "StickerX")
    return <StickerXLogo className="h-10 w-auto" />
  if (partnerName === "capsgame")
    return (
      <img
        src={CapsGamePng}
        className="h-11 w-11 rounded-lg"
        alt="capsGame logo"
      />
    )

  return <PartnerIcon className="h-10 w-auto" />
}

const PartnerName = ({ partnerName }: { partnerName: string }) => {
  const { t } = useTranslation()

  if (partnerName === "drops") return "Drops x Nuts Farm Campaign"
  if (partnerName === "moonveil") return t("Космическая кампания")
  if (partnerName === "calendar") return t("Крипто-календарь")
  if (partnerName === "sleepagotchi") return "Sleepagotchi x Nuts Farm Campaign"
  if (partnerName === "cryptowiki") return "Crypto Wiki"
  if (partnerName === "soul") return "Souls.club"
  if (partnerName === "hi-pin") return "Hi Pin"
  if (partnerName === "StickerX") return "StickerX x Nuts Farm campaign"
  if (partnerName === "capsgame") return "CapsGame x Nuts Farm campaign"
  return "Nuts Farm Campaign x Partner"
}

const PartnerDescription = ({ partnerName }: { partnerName: string }) => {
  const { t } = useTranslation()

  const lang = useAppSelector((state) => state.language.value)

  if (partnerName === "drops")
    return t("После запуска Drops, выполни один ордер во вкладке Earn")
  if (partnerName === "moonveil")
    return t(
      "Стань частью экосистемы для геймеров и исследуй сферу Web3-игр с командой профессионалов.",
    )
  if (partnerName === "calendar") {
    if (lang === "RU") return import.meta.env.VITE_CALENDAR_DESCRIPTION_RU
    else return import.meta.env.VITE_CALENDAR_DESCRIPTION_EN
  }
  if (partnerName === "sleepagotchi")
    return t("Познакомься со Sleepagotchi Lite в преддверии TGE")
  if (partnerName === "cryptowiki")
    return t(
      "Что такое блокчейн и какие они бывают? Простыми словами о технологии, которая меняет мир.",
    )
  if (partnerName === "soul")
    return t("Souls.club — play mini-games, beat other players, and earn!")
  if (partnerName === "hi-pin")
    return t("Создавай с помощью Hi PIN — Ваш ИИ, Ваши награды!")
  if (partnerName === "StickerX")
    return t("Познакомься с маркетплейсом токенизированных стикеров Telegram")
  if (partnerName === "capsgame")
    return t("Фарми токены, собирай фишки и окунись в 90-е!")

  return t("Исследуй кампанию Nuts Farm совместно с нашим партнёром")
}
