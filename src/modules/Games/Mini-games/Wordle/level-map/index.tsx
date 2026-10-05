import { useLayoutEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import LevelPath from "./LevelPath"
import BlockedLevel from "../level-buttons/locked-level"

import LevelMenuModal from "../modals/level-menu"
import NotEnoughEnergyModal from "../modals/not-enough-energy"
import EnergyPaymentStatus from "@/modules/Games/Mini-games/Wordle/modals/payment-status"

import { useGetGameEnergyQuery } from "@/redux/api/games"

import {
  GameLevel,
  NewLevelsResponse,
  UserGameLevelDifficultyInfo,
} from "@/types/games"

import { Sound } from "@/utils/Sound"

const topMargin = (index: number) => {
  const topMarginData: {
    [n: string]: number
  } = {
    "0": -32,
    "1": 96,
    "2": -10,
    "3": 84,
    "4": 170,
    "5": 250,
    "6": 250,
    "7": 315,
    "8": 380,
    "9": 380,
    "10": 450,
    "11": 560,
    "12": 615,
  }
  const top = Math.floor(index / 13) * 736

  const newIndex = index % 13

  return top + topMarginData[newIndex]
}

const leftMargin = (index: number) => {
  const leftMarginData: {
    [n: string]: number
  } = {
    "0": -23,
    "1": 40,
    "2": 165,
    "3": 217,
    "4": 217,
    "5": 150,
    "6": 50,
    "7": -26,
    "8": 50,
    "9": 150,
    "10": 217,
    "11": 147,
    "12": 50,
  }
  const newIndex = index % 13

  return leftMarginData[newIndex]
}

const mapHeight = (count: number) => {
  if (count == 200) return 15 * 740

  const t = Math.floor(count / 13)
  const sum = t * 740 + topMargin(count % 13) + 300

  return sum
}

const TMP_GAME_LEVEL_DATA: GameLevel = {
  id: 40,
  gameType: "WORDLY",
  title: "TestCreation-1",
  description: "",
  image: "",
  level: 10,
  body: "{}",
  createdAt: " string",
  updatedAt: "",
  difficulties: [],
}

interface MapLelvelProps {
  newLevels: NewLevelsResponse[]
  startedItems: UserGameLevelDifficultyInfo[]
  betSound: Sound
}

const LevelMap = ({ newLevels, startedItems, betSound }: MapLelvelProps) => {
  const { t } = useTranslation()

  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const wasScrolled = useRef(false)

  const [level, setLevel] = useState<GameLevel | null>(null)
  const [levelNumber, setLevelNumber] = useState<number | null>(null)
  const [notEnoughEnergy, setNotEnoughEnergy] = useState(false)
  const [openPaymentStatus, setOpenPaymentStatus] = useState(false)
  const [levelMenuOpen, setLevelMenuOpen] = useState<boolean>(false)

  const { data: gameEnergy } = useGetGameEnergyQuery()

  const onNewLevelClick = (level: GameLevel, levelNumber: number) => {
    if (gameEnergy && gameEnergy.gameEnergy > 1) {
      setLevelMenuOpen(true)
      setLevelNumber(levelNumber)
      setLevel(level)
    } else {
      setNotEnoughEnergy(true)
    }
  }

  const onStartedLevelClick = async (
    level: UserGameLevelDifficultyInfo,
    levelNumber: number,
  ) => {
    if (level.status === "COMPLETED") return

    if (gameEnergy && gameEnergy.gameEnergy < level.energyPrice) {
      setNotEnoughEnergy(true)
      return
    }

    const gameLevelData: GameLevel = {
      ...TMP_GAME_LEVEL_DATA,
      level: level.level,
      status: level.status,
      id: Number(level.id),
      difficulties: [
        {
          energyPrice: level.energyPrice,
          gameLevelId: Number(level.gameLevelId),
          id: level.gameLevelDifficultyId,
          difficulty: level.difficulty,
          body: level.gameLevelDifficultyBody,
          price: level.price,
          reward: level.reward,
          nutPassXp: level.nutPassXp,
          createdAt: "",
          updatedAt: "",
        },
      ],
    }
    setLevelMenuOpen(true)
    setLevelNumber(levelNumber)
    setLevel(gameLevelData)
  }

  const height = useMemo(() => {
    return mapHeight(
      startedItems.length + newLevels.flatMap((item) => item.items).length,
    )
  }, [startedItems, newLevels])

  useLayoutEffect(() => {
    if (!buttonRef.current) return
    if (wasScrolled.current) return

    buttonRef.current.scrollIntoView({ block: "center" })
    wasScrolled.current = true
  }, [buttonRef, newLevels])

  return (
    <>
      <div
        className="relative top-24 z-[49] mx-auto flex h-auto min-h-[800px] w-[255px] flex-col bg-cryptle-roadmap"
        style={{
          backgroundPosition: "center 0px",
          height: `${height}px`,
        }}
      >
        {startedItems.map((el, index) => {
          return (
            <div
              key={`startedlevel${index}`}
              className="relative"
              style={{
                top: topMargin(index),
                left: leftMargin(index),
              }}
            >
              <button
                className="absolute z-[1000] h-16 w-16 rounded-full bg-white"
                onClick={() => onStartedLevelClick(el, index + 1)}
              >
                {el.status === "PENDING" || el.status === "FAILED" ? (
                  <div
                    className="top-1/2 mx-auto h-[50px] w-[50px] rounded-full border border-[#80F338] bg-gradient-to-b from-[#CFFF3A] to-[#94F705]"
                    aria-label={t("Активный уровень", { level: index + 1 })}
                  >
                    <div
                      className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
                      style={{
                        background:
                          "radial-gradient(circle, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.3))",
                      }}
                    >
                      <h1 className="bg-gradient-to-b from-[#349E04] to-[#1F730B] bg-clip-text text-center font-days-one text-xl font-bold text-transparent">
                        {index + 1}
                      </h1>
                    </div>
                  </div>
                ) : (
                  <div
                    aria-label={t("Пройденный уровень", { level: index + 1 })}
                    className="top-1/2 z-[1000] mx-auto h-[50px] w-[50px] rounded-full border border-[#80F338] bg-gradient-to-b from-[#CFFF3A] to-[#94F705]"
                  >
                    <div
                      className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
                      style={{
                        background:
                          "radial-gradient(circle, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.15))",
                      }}
                    >
                      <h1 className="bg-gradient-to-b from-[#349E04] to-[#1F730B] bg-clip-text text-center font-days-one text-xl font-bold text-transparent opacity-40">
                        {index + 1}
                      </h1>
                    </div>
                  </div>
                )}
              </button>
              <LevelPath to={index} />
            </div>
          )
        })}
        {/* New Levels */}
        {newLevels &&
          newLevels.map(
            (el, i) =>
              el.items.length > 0 &&
              el.items.map((newLevel, j) => {
                // индекс с учетом пройденных
                const newIndex = startedItems.length + i * el.items.length + j

                const top = topMargin(newIndex)
                const left = leftMargin(newIndex)

                if (
                  startedItems?.[startedItems.length - 1]?.status ===
                    "PENDING" ||
                  startedItems?.[startedItems.length - 1]?.status === "FAILED"
                )
                  return (
                    <BlockedLevel
                      key={`newBlockedlevel${newLevel.id}`}
                      label={t("Закрытый уровень", {
                        level: newIndex + 1,
                      })}
                      top={top}
                      left={left}
                      hasToFetchNew={
                        i === newLevels.length - 1 && j === el.items.length - 1
                      }
                    />
                  )

                if (i === 0 && j === 0)
                  return (
                    <div
                      key={`newlevel${newLevel.id}`}
                      aria-label={t("Активный уровень", {
                        level: newIndex + 1,
                      })}
                      className="relative"
                      style={{
                        top: top,
                        left: left,
                      }}
                    >
                      <button
                        className="absolute h-16 w-16 rounded-full bg-white"
                        onClick={() => onNewLevelClick(newLevel, newIndex + 1)}
                        ref={buttonRef}
                      >
                        <div className="top-1/2 mx-auto h-[50px] w-[50px] rounded-full border border-[#80F338] bg-gradient-to-b from-[#CFFF3A] to-[#94F705]">
                          <div
                            className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
                            style={{
                              background:
                                "radial-gradient(circle, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.3))",
                            }}
                          >
                            <h1 className="bg-gradient-to-b from-[#349E04] to-[#1F730B] bg-clip-text text-center font-days-one text-xl font-bold text-transparent">
                              {newIndex + 1}
                            </h1>
                          </div>
                        </div>
                      </button>
                      <LevelPath to={newIndex} />
                    </div>
                  )

                return (
                  <BlockedLevel
                    key={`newBlockedlevel${newLevel.id}`}
                    label={t("Закрытый уровень", {
                      level: newIndex + 1,
                    })}
                    top={top}
                    left={left}
                    hasToFetchNew={
                      i === newLevels.length - 1 && j === el.items.length - 1
                    }
                  />
                )
              }),
          )}
      </div>

      {level && levelMenuOpen && levelNumber && (
        <LevelMenuModal
          open={levelMenuOpen}
          onOpenChange={setLevelMenuOpen}
          gameLevel={level}
          betSound={betSound}
          levelNumber={levelNumber}
        />
      )}
      {gameEnergy && (
        <NotEnoughEnergyModal
          open={notEnoughEnergy}
          onOpenChange={setNotEnoughEnergy}
          energy={gameEnergy.gameEnergy}
          maxEnergy={5}
          setOpenPaymentStatus={setOpenPaymentStatus}
        />
      )}

      <EnergyPaymentStatus
        open={openPaymentStatus}
        setOpen={setOpenPaymentStatus}
      />
    </>
  )
}

export default LevelMap
