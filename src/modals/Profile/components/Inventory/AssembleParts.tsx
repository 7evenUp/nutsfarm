import { useTranslation } from "react-i18next"
import useEmblaCarousel from "embla-carousel-react"

import AssemblePartItem from "./AssemblePartsItem"

import { Skeleton } from "@/shared/ui/Skeleton"

import { useGetAssemblePartsQuery } from "@/redux/api/items"

const AssembleParts = () => {
  const { t } = useTranslation()

  const [emblaRef] = useEmblaCarousel({
    dragFree: true,
    loop: false,
  })

  const { data: parts, isLoading: isPartsLoading } = useGetAssemblePartsQuery()

  if (isPartsLoading) return <PartsSkeleton />

  if (parts && parts.length > 0) {
    const sortedParts = parts.slice().sort((a, b) => {
      const aCan = a.userAmount >= a.assemblePartsAmount ? -1 : 1
      const bCan = b.userAmount >= b.assemblePartsAmount ? -1 : 1
      return aCan - bCan
    })

    return (
      <section>
        <div
          className="w-full cursor-grab overflow-hidden px-4 active:cursor-grabbing"
          ref={emblaRef}
        >
          <div className="flex items-center gap-2">
            {sortedParts.map((part) => (
              <AssemblePartItem
                key={part.id}
                part={part}
                disabled={part.userAmount < part.assemblePartsAmount}
              />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <div className="mx-4 flex h-[249px] flex-col items-center justify-center rounded-xl bg-[#17202D]">
      <p className="mb-3 text-center text-lg">{t("Сейчас здесь пусто")}</p>
      <p className="text-balance px-3 text-center text-sm font-medium">
        {t("Найдите детали, чтобы создать NFT или бустер")}
      </p>
    </div>
  )
}

export default AssembleParts

const PartsSkeleton = () => (
  <div className="flex items-center gap-2.5 px-4">
    <Skeleton className="h-[249px] w-[168px] shrink-0 rounded-xl" />
    <Skeleton className="h-[249px] w-[168px] shrink-0 rounded-xl" />
    <Skeleton className="h-[249px] w-[168px] shrink-0 rounded-xl" />
  </div>
)
