import { ComponentProps, useEffect, useState } from "react"
import { extractColors } from "extract-colors"

import CardBackfaceIcon from "@/assets/games/flip-cards/icons/card-backface.svg?react"

import styles from "./CoreCard.module.css"

import { cn } from "@/lib/cn"

const CoreCard = ({
  className,
  isActive,
  imgSrc,
  ...rest
}: ComponentProps<"button"> & { isActive: boolean; imgSrc: string }) => {
  const [borderColor, setBorderColor] = useState("#CC2AC3D8")

  useEffect(() => {
    const extractColorFromLogo = async () => {
      const x = await extractColors(imgSrc).catch(() => [])
      if (x[0]) setBorderColor(x[0].hex + "B3") // B3 - 70% opacity
    }

    extractColorFromLogo()
  }, [])

  return (
    <button
      className={cn(styles.card, "rounded-lg phone-xsm:rounded-xl", className)}
      {...rest}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-lg border border-[#00050A] bg-[#838DB7]/90 phone-xsm:rounded-xl",
          styles.front,
          !isActive && styles.front_active,
        )}
      >
        <CardBackfaceIcon className="size-7 phone-xsm:size-8 phone-sm-fix:size-[38px]" />
      </div>
      <div
        style={{ borderColor: isActive ? borderColor : "black" }}
        className={cn(
          "flex items-center justify-center rounded-lg border-2 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-[#153672] to-[#010036] phone-xsm:rounded-xl",
          styles.back,
          isActive && styles.back_active,
        )}
      >
        {isActive && (
          <img
            className="h-full w-full rounded-md object-contain phone-xsm:rounded-[10px]"
            src={imgSrc}
          />
        )}
      </div>
    </button>
  )
}

export default CoreCard
