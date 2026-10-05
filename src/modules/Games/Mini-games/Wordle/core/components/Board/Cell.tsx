import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"

import { CellStatus } from "@/types/wordle"
import { SkinType } from "@/types/cryptle"

import { Sound } from "@/utils/Sound"

import { cn } from "@/lib/cn"

interface CellProps {
  index: number
  letter: string
  status: CellStatus
  isDemo?: boolean
  skin: SkinType
  shouldShake?: boolean
  correctLetterSound?: Sound
  presentLetterSound?: Sound
}

const boxStyle = {
  DEFAULT: {
    correct: "from-[#C5FF0D] to-[#8FF605]",
    present: "from-[#FFFBAE] via-[#F7EB73] to-[#F7D673]",
    absent: "from-[#E0DEE8] to-[#949ABD]",
    empty: "from-[#F2FEFE] to-[#DDEEFCB2]/70",
  },
  GREEN: {
    correct: "from-[#C5FF0D] to-[#8FF605]",
    present: "from-[#FFFBAE] via-[#F7EB73] to-[#F7D673]",
    absent: "from-[#E0E8DE] to-[#A7B9A1]",
    empty: "from-[#F5FEF2] to-[#C0EFC8]",
  },
  PURPLE: {
    correct: "from-[#C5FF0D] to-[#8FF605]",
    present: "from-[#FFFBAE] via-[#F7EB73] to-[#F7D673]",
    absent: "from-[#E0DEE8] to-[#949ABD]",
    empty: "from-[#F4F2FE] to-[#E8DDFCB2]/70",
  },
}

const boxShadowStyle = {
  DEFAULT: {
    correct: "from-[#94F705] to-[#31AA00]",
    present: "from-[#F1C93A] to-[#CE8262]",
    absent: "from-[#DBDBDD] to-[#6764AB]",
    empty: "from-[#E2ECFC] to-[#8796D2]",
  },
  GREEN: {
    correct: "from-[#94F705] to-[#31AA00]",
    present: "from-[#F1C93A] to-[#CE8262]",
    absent: "from-[#00000000]/0 to-[#738E76]",
    empty: "from-[#98D194] to-[#98D194]",
  },
  PURPLE: {
    correct: "from-[#94F705] to-[#31AA00]",
    present: "from-[#F1C93A] to-[#CE8262]",
    absent: "from-[#DBDBDD] to-[#6764AB]",
    empty: "from-[#E2ECFC] to-[#B287D2]",
  },
}

const textStyle = {
  DEFAULT: {
    correct: "from-[#3AAA02] to-[#1A6C0E]",
    present: "from-[#EA9955] to-[#92510D]",
    absent: "from-[#A49FB4] to-[#423B5D]",
    empty: "from-[#7B5BDE] to-[#260D7E]",
  },
  GREEN: {
    correct: "from-[#3AAA02] to-[#1A6C0E]",
    present: "from-[#EA9955] to-[#92510D]",
    absent: "from-[#ACB5A3] to-[#526551]",
    empty: "from-[#6E9153] to-[#385548]",
    test: "from-red-50 to-red-200",
  },
  PURPLE: {
    correct: "from-[#3AAA02] to-[#1A6C0E]",
    present: "from-[#EA9955] to-[#92510D]",
    absent: "from-[#A49FB4] to-[#423B5D]",
    empty: "from-[#8F4BD4] to-[#420D7E]",
  },
}

export const Cell = ({
  letter,
  status,
  skin,
  isDemo,
  index,
  shouldShake = false,
  correctLetterSound,
  presentLetterSound,
}: CellProps) => {
  const { t } = useTranslation()

  const [isAnimating, setIsAnimating] = useState(false)
  const [displayStatus, setDisplayStatus] = useState<CellStatus>(status)
  const [prevStatus, setPrevStatus] = useState<CellStatus>(status)

  useEffect(() => {
    if (status !== prevStatus) {
      if ((status !== "empty" && letter) || !isDemo) {
        const timer = setTimeout(() => {
          if (status === "correct") correctLetterSound?.play(false, 0.15)
          if (status === "present") presentLetterSound?.play()
          setIsAnimating(true)
          const timer2 = setTimeout(() => {
            setIsAnimating(false)
          }, 500)
          return () => clearTimeout(timer2)
        }, index * 400)

        setPrevStatus(status)
        return () => clearTimeout(timer)
      }
    }
  }, [status, letter])

  // Дополнительная защита - проверяем статус каждые 2 секунды
  useEffect(() => {
    const interval = setInterval(() => {
      if (displayStatus !== status && !isAnimating) {
        // console.log(`Расхождение статусов для ${letter}: display ${displayStatus} ≠ current ${status}`);
        setDisplayStatus(status)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [displayStatus, status, isAnimating])

  return (
    <motion.div
      className={cn(
        "relative flex items-start outline-none",
        isDemo
          ? "h-10 w-10 phone-sm-fix:h-12 phone-sm-fix:w-12"
          : "h-12 w-12 phone-xsm:h-[50px] phone-xsm:w-[50px] phone-sm-fix:h-14 phone-sm-fix:w-14",
      )}
      aria-label={status !== "empty" ? t(status, { letter }) : ""}
      animate={{ rotateY: isAnimating ? 90 : 0 }}
      transition={{
        duration: 0.4,
        ease: "easeInOut",
        rotateY: {
          duration: 0.4,
          times: [0, 0.2, 0.4, 1],
        },
      }}
      onAnimationComplete={() => {
        if (isAnimating) {
          setDisplayStatus(status)
        } else {
          setDisplayStatus(status)
        }
      }}
    >
      <div
        className={cn(
          "relative z-50 flex items-center justify-center gap-3 rounded-b-xl rounded-t-lg bg-gradient-to-b font-nunito text-[32px] text-[#050D12]",
          isDemo
            ? "h-[37px] w-10 phone-sm-fix:h-[45px] phone-sm-fix:w-12"
            : "h-[45px] w-12 phone-xsm:h-[47px] phone-xsm:w-[50px] phone-sm-fix:h-[53px] phone-sm-fix:w-14",
          boxStyle[skin][displayStatus],
        )}
      >
        <div className="relative">
          {/* Text with inner shadow effect */}
          <h1
            className={cn(
              "bg-gradient-to-b bg-clip-text text-[28px] font-black text-transparent phone-xsm:text-3xl",
              textStyle[skin][displayStatus],
            )}
            style={shouldShake ? { color: "red" } : {}}
          >
            {letter}
          </h1>

          {/* Inner shadow overlay */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <h1
              className="text-[28px] font-black opacity-30 [text-shadow:inset_0px_2px_3px_rgba(0,0,0,0.5)] phone-xsm:text-3xl"
              style={{
                WebkitTextStroke: "0.5px rgba(0,0,0,0.15)",
                filter:
                  "drop-shadow(0px 1px 1px rgba(0,0,0,0.2)) drop-shadow(0px -1px 1px rgba(255,255,255,0.2))",
              }}
            >
              {letter}
            </h1>
          </div>
        </div>
      </div>
      <div
        className={cn(
          "absolute top-0 rounded-lg bg-gradient-to-b",
          isDemo
            ? "h-10 w-10 phone-sm-fix:h-12 phone-sm-fix:w-12"
            : "h-12 w-12 phone-xsm:h-[50px] phone-xsm:w-[50px] phone-sm-fix:h-14 phone-sm-fix:w-14",
          boxShadowStyle[skin][displayStatus],
        )}
      />
    </motion.div>
  )
}
