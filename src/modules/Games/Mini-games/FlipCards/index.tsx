import { useEffect, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

import ArrowLeftIcon from "@/assets/icons/arrow-left.svg?react"
import FlipCardsLogo from "@/assets/games/flip-cards/images/flip-cards-logo.png"
import Loader from "@/assets/icons/loader.svg?react"

import BottomButtons from "./BottomButtons"
import PassedLevel from "./LevelButtons/PassedLevel"
import CurrentLevel from "./LevelButtons/CurrentLevel"
import BlockedLevel from "./LevelButtons/BlockedLevel"

import {
  useGetNewLevelsInfiniteQuery,
  useGetStartedLevelsQuery,
} from "@/redux/api/games"

import { Sound } from "@/utils/Sound"

import { cn } from "@/lib/cn"

import styles from "./styles.module.css"

import { BackButton, initBackButton } from "@/demo/telegram-sdk"

let backButton: BackButton

if (true) {
  try {
    const [initializedBackButton] = initBackButton()
    backButton = initializedBackButton
  } catch {
    /* empty */
  }
}

const S3CloudUrl =
  import.meta.env.VITE_IS_DEV_LOCAL === undefined
    ? ""
    : ""

const clickSound = new Sound(
  `${S3CloudUrl}/sounds/games/flip-cards/flip-cards-select-difficulty.mp3`,
)

const FlipCards = () => {
  const { t } = useTranslation()

  const navigate = useNavigate()

  const { data: startedLevelsData, isLoading: isStartedLevelsLoading } =
    useGetStartedLevelsQuery({
      type: "CARDS",
    })
  const { data: newLevelsData, isLoading: isNewLevelsLoading } =
    useGetNewLevelsInfiniteQuery({
      type: "CARDS",
    })

  const startedLevels = useMemo(() => {
    if (!startedLevelsData) return []

    const uniqueStartedLevels = startedLevelsData.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.level === item.level),
    )

    return uniqueStartedLevels
  }, [startedLevelsData])
  const newLevels = useMemo(
    () => newLevelsData?.pages.flat() ?? [],
    [newLevelsData],
  )

  useEffect(() => {
    clickSound.load()
  }, [])

  useEffect(() => {
    if (!backButton) return

    backButton.show()
    const rmListener = backButton.on("click", () => {
      navigate("/games")
    })

    return () => {
      if (rmListener) {
        backButton.hide()
        rmListener()
      }
    }
  }, [])

  let index = 0

  return (
    <>
      <div className={cn("fixed inset-0", styles.background)} />

      <div
        className={cn("no-scroll h-screen overflow-y-auto", styles.mask_bottom)}
      >
        <main
          className={cn(
            "relative flex w-screen flex-1 flex-col items-center overflow-hidden px-4 pb-40",
            Telegram.WebApp.platform === "tdesktop" ||
              Telegram.WebApp.platform === "macos"
              ? "pt-16"
              : "pt-16 phone-xsm:pt-[72px] phone-sm:pt-20",
          )}
        >
          {import.meta.env.VITE_IS_DEV_LOCAL !== undefined && (
            <Link
              to="/games"
              className="flex items-center gap-2 self-start text-sm font-semibold opacity-70 transition-opacity focus:outline-none active:opacity-100"
            >
              <ArrowLeftIcon />
              {t("Назад")}
            </Link>
          )}

          <img
            className="mb-12 h-[55.6px] w-[165.23px]"
            src={FlipCardsLogo}
            alt="Meta Match Logo"
          />

          {isStartedLevelsLoading || isNewLevelsLoading ? (
            <Loader className="mt-20 h-40 w-40 animate-spin" />
          ) : (
            <div className="relative flex flex-col items-center gap-9">
              <div className="absolute inset-y-0.5 left-1/2 w-2.5 -translate-x-1/2 bg-[#838DB7]/60" />

              {startedLevels.length > 0 &&
                startedLevels.map((started) => (
                  <PassedLevel
                    key={started.id}
                    index={++index}
                    clickSound={clickSound}
                    {...started}
                  />
                ))}

              {newLevels &&
                newLevels.map(
                  (el, i) =>
                    el.items.length > 0 &&
                    el.items.map((newLevel, j) => {
                      if (i === 0 && j === 0)
                        return (
                          <CurrentLevel
                            key={newLevel.id}
                            index={++index}
                            clickSound={clickSound}
                            {...newLevel}
                            prevLevel={
                              startedLevels.length > 0
                                ? startedLevels[startedLevels.length - 1]
                                : undefined
                            }
                          />
                        )

                      return (
                        <BlockedLevel
                          key={newLevel.id}
                          hasToFetchNew={
                            i === newLevels.length - 1 &&
                            j === el.items.length - 1
                          }
                        />
                      )
                    }),
                )}
            </div>
          )}
        </main>
      </div>

      <BottomButtons />
    </>
  )
}

export default FlipCards
