import { Dispatch, SetStateAction, useState } from "react"
import { t } from "i18next"
import { motion } from "framer-motion"

import SmartStar from "./SmartStar"

import { useRateLessonMutation } from "@/redux/api/learn"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

const StarsSelect = ({
  lessonId,
  mark,
  setStarWasSelected,
}: {
  lessonId: string
  mark: null | number
  setStarWasSelected: Dispatch<SetStateAction<boolean>>
}) => {
  const [selectedStar, setSelectedStar] = useState<0 | 1 | 2 | 3 | 4 | 5>(0)

  const [rateLesson] = useRateLessonMutation()

  const onStarClick = (item: number) => {
    makeHapticFeedback({ notificationOccured: 'success' })

    rateLesson({ rating: item as 1 | 2 | 3 | 4 | 5, lessonId })

    setSelectedStar(item as 1 | 2 | 3 | 4 | 5)
    setTimeout(() => setStarWasSelected(true), 50)
  }

  return (
    <motion.div
      exit={{ opacity: 0, x: 200 }}
      className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-[#17202D] px-[55px] py-3 phone-sm:gap-3 phone-sm:pb-4 phone-sm:pt-3.5"
    >
      <span className="text-center text-sm font-semibold">
        {mark === null ? t("Оцени урок:") : t("Уже оценили:")}
      </span>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((item) => (
          <button
            key={item}
            onClick={() => onStarClick(item)}
            className="transition-transform active:scale-110"
            disabled={mark !== null}
          >
            <SmartStar size={24} isActive={selectedStar >= item} />
          </button>
        ))}
      </div>
    </motion.div>
  )
}

export default StarsSelect
