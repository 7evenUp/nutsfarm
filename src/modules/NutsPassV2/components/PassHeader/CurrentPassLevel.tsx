import { useEffect } from "react"

import CurrentLevelBadge from "@/assets/passV2/icons/level-badge-current.svg?react"
import PlusIcon from "@/assets/passV2/icons/plus-rect.svg?react"

import { XP_PER_LEVEL } from "../../constants"

import {
  setCurrentLevelXp,
  setIsBuyLevelOpened,
  setPassLevel,
} from "@/redux/slices/passv2"
import { useGetCurrentUserQuery } from "@/redux/api/user"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"
import { sendMetrika } from "@/utils/sendMetrika"

const CurrentPassLevel = () => {
  const dispatch = useAppDispatch()

  const { currentLevelXp, passLevel } = useAppSelector((state) => state.passv2)

  const { data: currentUser } = useGetCurrentUserQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })

  useEffect(() => {
    if (!currentUser) return

    if (currentUser.nutPassXpBalance <= 0) return

    dispatch(
      setPassLevel(Math.floor(currentUser.nutPassXpBalance / XP_PER_LEVEL) + 1),
    )
    dispatch(setCurrentLevelXp(currentUser.nutPassXpBalance % XP_PER_LEVEL))
  }, [currentUser])

  return (
    <>
      <div className="relative h-[60px] bg-gradient-to-r from-[#0F1824] via-[#241348] to-[#0F1824]">
        <div className="absolute inset-0 flex items-center justify-center px-12 [background-image:_repeating-linear-gradient(-45deg,transparent_0,transparent_15px,rgba(81,69,146,0.04)_15px,rgba(81,69,146,0.04)_45px)]">
          <div className="relative flex h-8 w-full items-center justify-center bg-gradient-to-r from-[#241445] via-[#4B4088] to-[#241445]">
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <CurrentLevelBadge className="h-12 w-[41px]" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-tt-hoves-expanded font-semibold text-white">
                {passLevel}
              </span>
            </div>

            <p className="text-xs font-bold text-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.2)]">
              {`${currentLevelXp}/${XP_PER_LEVEL} XP`}
            </p>

            <button
              className="absolute right-0 top-1/2 z-[1000] -translate-y-1/2 translate-x-1/2 transition-transform active:scale-95"
              onClick={() => {
                makeHapticFeedback({ impactOccured: "soft" })
                sendMetrika("levels_plus_button_click")
                dispatch(setIsBuyLevelOpened(true))
              }}
            >
              <PlusIcon className="drop-shadow-[0px_0px_6px_rgba(159,223,112,0.3)]" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default CurrentPassLevel
