import React from "react"

import QuestionIcon from "@/assets/passV2/icons/question-mark-circle.svg?react"
import TrophyIcon from "@/assets/passV2/icons/trophy.svg?react"
import XpIcon from "@/assets/passV2/icons/xp.svg?react"

import XpLeaderboard from "../../modals/XpLeaderboard"
import NutsPassInfo from "../../modals/NutsPassInfo"
import XpInfo from "../../modals/XpInfo"

import { sendMetrika } from "@/utils/sendMetrika"
import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

const TopButtons = React.memo(() => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <NutsPassInfo>
          <button
            className="z-20 flex size-9 items-center justify-center rounded-lg bg-[#413577]/40"
            onClick={() => {
              makeHapticFeedback({ impactOccured: "soft" })
              sendMetrika("pass_info_click")
            }}
          >
            <QuestionIcon />
          </button>
        </NutsPassInfo>
        <XpInfo>
          <button
            className="z-20 flex size-9 items-center justify-center rounded-lg bg-[#413577]/40"
            onClick={() => {
              makeHapticFeedback({ impactOccured: "soft" })
            }}
          >
            <XpIcon />
          </button>
        </XpInfo>
      </div>
      <h1 className="bg-gradient-to-b from-[#FFFFFF] to-[#DFD3FF] bg-clip-text font-tt-hoves-expanded text-xl font-semibold text-transparent drop-shadow-[0px_2px_3px_rgba(0,0,0,0.25)] phone-sm-fix:text-2xl">
        Nuts Pass
      </h1>

      <XpLeaderboard>
        <button
          className="z-20 flex size-9 items-center justify-center rounded-lg bg-[#413577]/40"
          onClick={() => {
            makeHapticFeedback({ impactOccured: "soft" })
            sendMetrika("pass_leaderboard")
          }}
        >
          <TrophyIcon />
        </button>
      </XpLeaderboard>
    </div>
  )
})

export default TopButtons
