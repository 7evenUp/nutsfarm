import { useLayoutEffect } from "react"
import { motion } from "framer-motion"

import { Cell } from "./Cell"

import { WORD_LENGTH, TRIES } from "../../constants"

import { CellStatus } from "@/types/wordle"
import { SkinType } from "@/types/cryptle"

import { Sound } from "@/utils/Sound"

const CorrectLetterSound = new Sound(
  "/sounds/games/cryptle/cryptle-green-letter.mp3",
)
const PresentLetterSound = new Sound(
  "/sounds/games/cryptle/cryptle-yellow-letter.mp3",
)

interface BoardProps {
  guesses: string[]
  currentGuess: string
  getCellStatus: (letter: string, index: number, rowIndex: number) => CellStatus
  skin: SkinType
  shouldShake?: boolean
}

export const Board = ({
  guesses,
  currentGuess,
  getCellStatus,
  skin,
  shouldShake = false,
}: BoardProps) => {
  useLayoutEffect(() => {
    Promise.all([CorrectLetterSound.load(), PresentLetterSound.load()])
  }, [])

  return (
    <div className="flex flex-col items-center gap-3 phone-xsm:gap-4 phone-sm-fix:gap-6">
      {Array(TRIES)
        .fill(null)
        .map((_, rowIndex) => {
          const isActiveRow = rowIndex === guesses.length
          return (
            <motion.div
              key={rowIndex}
              className="flex gap-2"
              animate={
                shouldShake && isActiveRow
                  ? {
                      x: [-5, 5, -5, 5, -2, 2, 0],
                    }
                  : {}
              }
              transition={{
                duration: 0.5,
                ease: "easeInOut",
              }}
            >
              {Array(WORD_LENGTH)
                .fill(null)
                .map((_, colIndex) => {
                  const letter =
                    rowIndex < guesses.length
                      ? guesses[rowIndex][colIndex]
                      : rowIndex === guesses.length
                        ? currentGuess[colIndex] || ""
                        : ""

                  return (
                    <Cell
                      key={`${rowIndex}-${colIndex} letter`}
                      index={colIndex}
                      letter={letter}
                      status={getCellStatus(letter, colIndex, rowIndex)}
                      skin={skin}
                      shouldShake={isActiveRow ? shouldShake : false}
                      correctLetterSound={CorrectLetterSound}
                      presentLetterSound={PresentLetterSound}
                    />
                  )
                })}
            </motion.div>
          )
        })}
    </div>
  )
}
