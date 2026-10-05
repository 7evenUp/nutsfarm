import { useTranslation } from "react-i18next"

interface LearnProgressProps {
  lessonMistakePercent: number
  lessonPassed: number
}

const LearnProgress = ({
  lessonMistakePercent,
  lessonPassed,
}: LearnProgressProps) => {
  const { t } = useTranslation()

  return (
    <div className="mt-9 flex flex-col gap-4 px-3.5">
      <p className="font-tt-hoves-expanded text-lg/5 font-semibold">
        {t("Прогресс в обучении")}
      </p>
      <div className="flex gap-2">
        <div className="flex w-full flex-col gap-1 rounded-xl bg-[#17202D] px-[13px] py-[11px]">
          <span className="font-bold">{lessonPassed}</span>
          <span className="text-xs/[13px] font-medium text-white/50">
            {t("уроков пройдено", { count: lessonPassed })}
          </span>
        </div>

        <div className="flex w-full flex-col gap-1 rounded-xl bg-[#17202D] px-[13px] py-[11px]">
          <span className="font-bold">{lessonMistakePercent}%</span>
          <span className="text-xs/[13px] font-medium text-white/50">
            {t("доля ошибок")}
          </span>
        </div>
      </div>
    </div>
  )
}

export default LearnProgress
