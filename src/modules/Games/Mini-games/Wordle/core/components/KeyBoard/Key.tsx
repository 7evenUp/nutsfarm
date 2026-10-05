import { useTranslation } from "react-i18next"

import BackButton from "@/assets/games/cryptle/icons/backspace.svg?react"
import Enter from "@/assets/games/cryptle/icons/keyboard_return.svg?react"

import { CellStatus } from "@/types/wordle"
import { SkinType } from "@/types/cryptle"

import { cn } from "@/lib/cn"

interface KeyProps {
  value: string
  status: CellStatus
  onClick: (value: string) => void
  language: "RU" | "EN"
  isLast?: boolean
  skin: SkinType
}

const boxStyle = {
  DEFAULT: {
    correct: "from-[#C5FF0D] to-[#8FF605]",
    present: "from-[#FFFBAE] via-[#F7EB73] to-[#F7D673]",
    absent: "from-[#E0DEE8] to-[#949ABD]",
    empty: "from-[#FFFFFF] to-[#E4F2FC]",
  },
  GREEN: {
    correct: "from-[#C5FF0D] to-[#8FF605]",
    present: "from-[#FFFBAE] via-[#F7EB73] to-[#F7D673]",
    absent: "from-[#E1EAE0] to-[#B7C6B2]",
    empty: "from-[#FFFFFF] to-[#E4F2FC]",
  },
  PURPLE: {
    correct: "from-[#C5FF0D] to-[#8FF605]",
    present: "from-[#FFFBAE] via-[#F7EB73] to-[#F7D673]",
    absent: "from-[#E0DEE8] to-[#949ABD]",
    empty: "from-[#F6F3FE] to-[#E0D9F8]",
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
    absent: "from-[#00000000]/0 to-[#3D5E3D]",
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
    correct: "text-[#20750B]",
    present: "text-[#B56E2A]",
    absent: "text-[#78728D]",
    empty: "text-[#3A2485]",
  },
  GREEN: {
    correct: "text-[#20750B]",
    present: "text-[#B56E2A]",
    absent: "text-[#697A66]",
    empty: "text-[#375448]",
  },
  PURPLE: {
    correct: "text-[#20750B]",
    present: "text-[#B56E2A]",
    absent: "text-[#78728D]",
    empty: "text-[#3A2485]",
  },
}

const keySelectedStyle = {
  DEFAULT:
    "border-2 bg-gradient-to-b border-[#442C92] from-[#E9EFFF] to-[#BACFFE]",
  GREEN:
    "border-2 bg-gradient-to-b border-[#78975F] from-[#FFFFFF] to-[#C6F1CD]",
  PURPLE:
    "border-2 bg-gradient-to-b border-[#8E5BC3] from-[#FFFFFF] to-[#BE9EFD]",
}

export const Key = ({
  value,
  status,
  onClick,
  language,
  isLast,
  skin,
}: KeyProps) => {
  const { t } = useTranslation()

  return (
    <button
      className="group relative"
      onClick={() => onClick(value)}
      aria-label={
        value === "ENTER"
          ? "Submit"
          : value === "DELETE"
            ? "Delete 1 letter"
            : t(status, { letter: value })
      }
    >
      <div
        className={cn(
          "relative z-50 h-9 w-6 rounded bg-gradient-to-b text-sm font-bold text-[#3A2485] transition-colors",
          "group-active:translate-y-px", // styles for button when it's pressed
          // adaptive styles
          language === "EN" // adaptive for xsm
            ? "phone-xsm:h-9 phone-xsm:w-7"
            : "phone-xsm:h-9 phone-xsm:w-[26px]",
          language === "EN" // adaptive for sm-fix
            ? "phone-sm-fix:text-lg"
            : "phone-sm-fix:text-lg",
          boxStyle[skin][status],
          isLast &&
            value !== "ENTER" &&
            value !== "DELETE" &&
            keySelectedStyle[skin],

          // adaptive for DELETE and ENTER on All Languages
          value === "ENTER" && "bg-gradient-to-b from-[#FEEE1F] to-[#FA9B39]",
          value === "DELETE" && "bg-gradient-to-b from-[#E0E7F7] to-[#C4CEEF]",

          value === "ENTER" && // adaptive for ENTER on English
            language === "EN" &&
            "min-w-[42px] phone-xsm:w-11",
          value === "DELETE" && // adaptive for DELETE on English
            language === "EN" &&
            "min-w-8 phone-xsm:w-14 phone-sm:w-[60px] phone-sm-fix:w-[62px]",

          value === "ENTER" && // adaptive for ENTER on Russian
            language === "RU" &&
            "min-w-[42px] phone-xsm:w-11",
          value === "DELETE" && // adaptive for DELETE on Russian
            language === "RU" &&
            "min-w-8 phone-xsm:w-8",
        )}
      >
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {value === "ENTER" ? (
            <Enter className="mx-auto" />
          ) : value === "DELETE" ? (
            <BackButton className="mx-auto" />
          ) : (
            <h1
              className={cn(
                "text-[22px]/6 font-semibold",
                textStyle[skin][status],
              )}
            >
              {value.toLocaleLowerCase()}
            </h1>
          )}
        </div>
      </div>
      <div
        className={cn(
          "absolute top-0 h-9 w-6 translate-y-px rounded-[4px] bg-gradient-to-b",
          language === "EN" // adaptive for xsm
            ? "phone-xsm:h-9 phone-xsm:w-7"
            : "phone-xsm:h-9 phone-xsm:w-[26px]",
          language === "EN" // adaptive for sm-fix
            ? "phone-sm-fix:text-lg"
            : "phone-sm-fix:text-lg",
          boxShadowStyle[skin][status],
          value === "ENTER" && // adaptive for ENTER on English
            language === "EN" &&
            "min-w-[42px] phone-xsm:w-11",
          value === "DELETE" && // adaptive for DELETE on English
            language === "EN" &&
            "min-w-8 phone-xsm:w-14 phone-sm:w-[60px] phone-sm-fix:w-[62px]",

          value === "ENTER" && // adaptive for ENTER on Russian
            language === "RU" &&
            "min-w-[42px] phone-xsm:w-11",
          value === "DELETE" && // adaptive for DELETE on Russian
            language === "RU" &&
            "min-w-8 phone-xsm:w-8",
        )}
      />
    </button>
  )
}
