import { Skeleton } from "@/shared/ui/Skeleton"

import { useTranslation } from "react-i18next"

const SkeletonLayout = () => {
  const { t } = useTranslation()
  return (
    <div className="px-3.5">
      <div>
        {/* Аватар и информация пользователя */}
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-[72px] w-[72px] rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-5 w-3/4 rounded-md" />
            <Skeleton className="h-4 w-1/2 rounded-md" />
          </div>
        </div>

        {/* Streaks block */}
        <div className="mt-[30px] flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            {/* Current streak */}
            <Skeleton className="h-[84px] rounded-xl phone-xsm:h-[71px]" />
            {/* Best streak */}
            <Skeleton className="h-[84px] rounded-xl phone-xsm:h-[71px]" />
          </div>
        </div>

        {/* Nutcrackers/NFT */}
        <div className="mt-9 flex min-h-[275px] flex-col gap-4 phone-sm-fix:min-h-[295px] h-screen-700:min-h-[320px]">
          <p className="font-tt-hoves-expanded text-lg font-semibold">
            NFT / Nutcrackers
          </p>
          <div className="flex gap-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex min-w-[172px] flex-col items-start first-line:cursor-pointer phone-sm:min-w-[172px] phone-sm-fix:min-w-[192px] h-screen-700:phone:min-w-[220px]"
              >
                <Skeleton className="mb-3 h-[172px] w-[172px] flex-col items-start rounded-[12px] phone-sm:h-[172px] phone-sm:w-[172px] phone-sm-fix:mb-4 phone-sm-fix:h-[192px] phone-sm-fix:w-[192px] h-screen-700:phone:h-[220px] h-screen-700:phone:w-[220px]" />
                <Skeleton className="h-5 w-3/4 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Learn Progress */}
        <div className="mt-9 flex flex-col gap-4">
          <p className="font-tt-hoves-expanded text-lg/5 font-semibold">
            {t("Прогресс в обучении")}
          </p>
          <div className="flex gap-2">
            <Skeleton className="h-16 flex-1 rounded-xl" />
            <Skeleton className="h-16 flex-1 rounded-xl" />
          </div>
        </div>

        {/* overview */}
        <div className="mt-12 flex flex-col gap-4">
          <p className="font-tt-hoves-expanded text-lg font-semibold">
            {t("Обзор")}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton
                key={i}
                className="h-[84px] rounded-xl phone-xsm:h-[71px]"
              />
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="mt-12 flex flex-col gap-4">
          <p className="font-tt-hoves-expanded text-lg font-semibold">
            {t("Достижения")}
          </p>
          <div className="flex gap-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex min-w-[172px] flex-col items-start first-line:cursor-pointer phone-sm:min-w-[172px] phone-sm-fix:min-w-[192px] h-screen-700:phone:min-w-[220px]"
              >
                <Skeleton className="mb-3 h-[172px] w-[172px] flex-col items-start rounded-[12px] phone-sm:h-[172px] phone-sm:w-[172px] phone-sm-fix:mb-4 phone-sm-fix:h-[192px] phone-sm-fix:w-[192px] h-screen-700:phone:h-[220px] h-screen-700:phone:w-[220px]" />
                <Skeleton className="h-5 w-3/4 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SkeletonLayout
