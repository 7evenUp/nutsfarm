import { useState } from "react"

import { cn } from "@/lib/cn"

import { Key } from "./Key"

import { CellStatus } from "@/types/wordle"
import { SkinType } from "@/types/cryptle"

interface KeyboardProps {
  onKeyPress: (key: string) => void
  getKeyStatus: (key: string) => CellStatus
  keyboardLayout: string[][]
  language: "RU" | "EN"
  skin: SkinType
}

export const Keyboard = ({
  onKeyPress,
  getKeyStatus,
  keyboardLayout,
  language,
  skin,
}: KeyboardProps) => {
  const [lastKey, setLastKey] = useState<string | null>(null)

  const handleClick = (key: string) => {
    setLastKey(key)

    onKeyPress(key)
  }

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 p-0 phone-xsm:p-2",
        Telegram.WebApp.platform === "weba"
          ? "bottom-[8px] phone-sm-fix:bottom-[16px] "
          : "bottom-[calc(max(var(--tg-safe-area-inset-bottom,6px),6px))] phone-sm-fix:bottom-[calc(max(var(--tg-safe-area-inset-bottom,16px),16px))]  ",
      )}
    >
      <div className="mx-auto grid w-full max-w-[484px] gap-1 phone-sm-fix:gap-2">
        {keyboardLayout.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex justify-center gap-[3px] phone-sm-fix:gap-[4px]"
          >
            {row.map((key) => (
              <Key
                language={language}
                key={key}
                value={key}
                status={getKeyStatus(key)}
                onClick={handleClick}
                isLast={key === lastKey}
                skin={skin}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
