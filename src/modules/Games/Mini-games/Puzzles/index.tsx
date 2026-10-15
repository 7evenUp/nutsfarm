import { useEffect, useMemo } from "react"

import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router-dom"

import Level from "./LevelButtons/Level"

import PuzzlesLogo from "@/assets/games/puzzles/images/puzzles-logo.png"
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg?react"

import {
  useGetNewLevelsInfiniteQuery,
  useGetStartedLevelsQuery,
} from "@/redux/api/games"

import styles from "./styles.module.css"

import { Sound } from "@/utils/Sound"

import { cn } from "@/lib/cn"

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

const clickSound = new Sound(
  "/sounds/games/puzzles/puzzles-select-difficulty.mp3",
)

const Puzzles = () => {
  const { t } = useTranslation()

  const navigate = useNavigate()

  const { data: startedLevels } = useGetStartedLevelsQuery({ type: "PUZZLES" })
  const { data: newLevelsData } = useGetNewLevelsInfiniteQuery({
    type: "PUZZLES",
  })

  // Делим уровни на подмассивы вида:
  // [1, 2, 3, 4]
  // [8, 7, 6, 5]
  // Чтобы можно было на флексах создать обратный ход числового порядка
  const allLevels = useMemo(() => {
    if (!startedLevels || !newLevelsData) return null

    // Фильтруем дубликаты в startedLevels по полю level
    const uniqueStartedLevels = startedLevels.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.level === item.level),
    )

    const splitSize = 4
    const levels = [
      ...uniqueStartedLevels,
      ...newLevelsData.pages.flatMap((r) => r.items),
    ]
    const result = []

    for (let i = 0; i < levels.length; i += splitSize) {
      result.push(levels.slice(i, i + splitSize))
    }

    return result
  }, [startedLevels, newLevelsData])

  let isCurrentFound = false

  // BackButton
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

  useEffect(() => {
    clickSound.load()
  }, [])

  return (
    <>
      <div className="fixed inset-0 min-h-screen w-screen bg-puzzles-background bg-cover bg-center bg-no-repeat" />

      <main
        className={cn(
          "no-scroll relative flex min-h-screen w-screen flex-1 flex-col items-center overflow-hidden pb-40",
          Telegram.WebApp.platform === "tdesktop" ||
            Telegram.WebApp.platform === "macos"
            ? "pt-16"
            : "pt-16 phone-xsm:pt-[72px] phone-sm:pt-20",
        )}
      >
        {import.meta.env.VITE_IS_DEV_LOCAL !== undefined && (
          <Link
            to={"/games"}
            className="flex items-center gap-2 self-start pl-4 text-sm font-semibold opacity-70 transition-opacity focus:outline-none active:opacity-100"
          >
            <ArrowLeftIcon />
            {t("Назад")}
          </Link>
        )}

        <img
          className="mb-10 h-[89.87px] w-[154.35px]"
          src={PuzzlesLogo}
          alt="Nuts Block Logo"
        />

        {allLevels ? (
          <div className="flex w-[312px] flex-col gap-x-8 gap-y-[33.5px] bg-[url(/images/games/dashed-line-puzzles-pattern.svg)] bg-[30px_33px] bg-repeat-y">
            {allLevels.map((row, i) => (
              <div
                key={`row-${i}`}
                className={cn("flex gap-6", i % 2 !== 0 && "flex-row-reverse")}
              >
                {row.map((item, j) => {
                  if (!isCurrentFound && "difficulties" in item) {
                    isCurrentFound = true

                    return (
                      <Level
                        level={item}
                        index={i * 4 + j + 1}
                        key={`item-${i}-${j}`}
                        isCurrent
                        clickSound={clickSound}
                        hasToFetchNew={
                          i === allLevels.length - 1 && j === row.length - 1
                        }
                      />
                    )
                  }

                  return (
                    <Level
                      level={item}
                      index={i * 4 + j + 1}
                      key={`item-${i}-${j}`}
                      clickSound={clickSound}
                      hasToFetchNew={
                        i === allLevels.length - 1 && j === row.length - 1
                      }
                    />
                  )
                })}
              </div>
            ))}
          </div>
        ) : null}

        <div
          className={cn(
            "pointer-events-none fixed bottom-0 h-[158px] w-full",
            styles.level_menu_mask,
          )}
        />
      </main>
    </>
  )
}

export default Puzzles
