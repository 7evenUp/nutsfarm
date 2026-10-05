// import TrophyIcon from "@/assets/public-profile/icons/trophy.svg?react"
import RoadmapIcon from "@/assets/public-profile/icons/roadmap.svg?react"
import ReferalIcon from "@/assets/public-profile/icons/contacts.svg?react"
import TicketIcon from "@/assets/public-profile/icons/ticket.svg?react"

import { numberWithSpaces } from "@/utils/numberWithSpaces"
import { useTranslation } from "react-i18next"

interface ReviewBlockProps {
  referralCount: number
  xpAmount: number
  gameLevelPassed: number
}

const ReviewBlock = ({
  referralCount,
  xpAmount,
  gameLevelPassed,
}: ReviewBlockProps) => {
  const { t } = useTranslation()

  return (
    <div className="mt-12 flex flex-col gap-4 px-3.5">
      <p className="font-tt-hoves-expanded text-lg/6 font-semibold">
        {t("Обзор")}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {/* Nuts Points card */}
        <div className="col-span-2 flex w-full items-center justify-start gap-3 rounded-xl bg-[#17202D] px-3.5 py-[15px]">
          <TicketIcon className="h-9 w-9 shrink-0" />
          <div className="flex flex-col gap-1">
            <span className="font-bold">{numberWithSpaces(xpAmount)}</span>
            <span className="text-xs/[13px] font-medium text-white/50">
              {t("очков Nuts Pass")}
            </span>
          </div>
        </div>
        {/* League card*/}
        {/* <div className="flex w-full items-center justify-start gap-3 rounded-xl bg-[#17202D] px-3.5 py-[15px]">
          <TrophyIcon className="h-9 w-9 shrink-0" />
          <div className="flex flex-col gap-1">
            <span className="font-bold">{currentLeague}</span>
            <span className="text-xs/[13px] font-medium text-white/50">
              {t("текущая лига")}
            </span>
          </div>
        </div> */}
        {/* Referals */}
        <div className="flex w-full items-center justify-start gap-3 rounded-xl bg-[#17202D] px-3.5 py-[15px]">
          <ReferalIcon className="h-9 w-9 shrink-0" />
          <div className="flex flex-col gap-1">
            <span className="font-bold">{numberWithSpaces(referralCount)}</span>
            <span className="text-xs/[13px] font-medium text-white/50">
              {t("друзей", { count: referralCount })}
            </span>
          </div>
        </div>
        {/* Game Levels */}
        <div className="flex w-full items-center justify-start gap-3 rounded-xl bg-[#17202D] px-3.5 py-[15px]">
          <RoadmapIcon className="h-9 w-9 shrink-0" />
          <div className="flex flex-col gap-1">
            <span className="font-bold">{gameLevelPassed}</span>
            <span className="text-xs/[13px] font-medium text-white/50">
              {t("уровней в игре", { count: gameLevelPassed })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewBlock
