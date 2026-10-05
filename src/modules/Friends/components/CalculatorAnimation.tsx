import { useEffect, useReducer } from "react"
import { useAnimate } from "framer-motion"

import LeftBottomIcon from "@/assets/icons/calculator-left-bottom.svg?react"
import LeftTopIcon from "@/assets/icons/calculator-left-top.svg?react"
import RightTopIcon from "@/assets/icons/calculator-right-top.svg?react"
import RightBottomIcon from "@/assets/icons/calculator-right-bottom.svg?react"

const CalculatorAnimation = () => {
  const [scope, animate] = useAnimate()
  const [count, forceUpdate] = useReducer((v) => v + 1, 0)

  useEffect(() => {
    animate([
      [
        ".left-bottom",
        { transform: "scale(100%)", opacity: 1 },
        { duration: 0.2 },
      ],
      [
        ".left-top",
        { transform: "scale(100%)", opacity: 1 },
        { duration: 0.2 },
      ],
      [
        ".right-top",
        { transform: "scale(100%)", opacity: 1 },
        { duration: 0.2 },
      ],
      [
        ".right-bottom",
        { transform: "scale(100%)", opacity: 1 },
        { duration: 0.2 },
      ],
      [
        ".left-bottom",
        { transform: "scale(0%)", opacity: 0 },
        { duration: 0.2, delay: 0.75 },
      ],
      [".left-top", { transform: "scale(0%)", opacity: 0 }, { duration: 0.2 }],
      [".right-top", { transform: "scale(0%)", opacity: 0 }, { duration: 0.2 }],
      [
        ".right-bottom",
        { transform: "scale(0%)", opacity: 0 },
        { duration: 0.2 },
      ],
    ]).then(() => {
      setTimeout(() => {
        forceUpdate()
      }, 750)
    })
  }, [count])

  return (
    <div className="relative h-[38px] w-[38px]" ref={scope}>
      <LeftBottomIcon className="left-bottom absolute bottom-0 left-0" />
      <LeftTopIcon className="left-top absolute left-0 top-0" />
      <RightTopIcon className="right-top absolute right-0 top-0" />
      <RightBottomIcon className="right-bottom absolute bottom-0 right-0" />
    </div>
  )
}

export default CalculatorAnimation
