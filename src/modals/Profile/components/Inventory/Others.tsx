import { useTranslation } from "react-i18next"
import useEmblaCarousel from "embla-carousel-react"

import OtherItem from "./OtherItem"

import { Skeleton } from "@/shared/ui/Skeleton"

import { useAppSelector } from "@/redux/hooks"
import { useGetInventoryQuery } from "@/redux/api/inventory"

const OthersInventory = () => {
  const { t } = useTranslation()

  const lang = useAppSelector((state) => state.language.value)

  const [emblaRef] = useEmblaCarousel({
    dragFree: true,
    loop: false,
  })

  const { data: inventory, isLoading: isInventoryLoading } =
    useGetInventoryQuery()

  if (isInventoryLoading) return <OthersSkeleton />

  if (inventory && inventory.length > 0) {
    const otherItems = inventory.filter(
      (item) => item.type !== "NFT" && item.type !== "STREAK_ADDITIONAL_REWARD",
    )

    return (
      <div
        className="w-full cursor-grab overflow-hidden px-4 active:cursor-grabbing"
        ref={emblaRef}
      >
        <div className="flex items-center gap-2">
          {otherItems.map((item) => (
            <OtherItem
              key={item.id}
              itemId={item.id}
              imgSrc={lang === "RU" ? item.image : item.imageEn}
              title={lang === "RU" ? item.title : item.titleEn}
              isClaimed={item.status === "CLAIMED"}
              isMintActive={item.isMintActive}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-4 flex h-[249px] flex-col items-center justify-center rounded-xl bg-[#17202D]">
      <p className="mb-3 text-center text-lg">{t("Сейчас здесь пусто")}</p>
      <p className="text-balance px-3 text-center text-sm font-medium">
        {t(
          "Совсем скоро здесь появятся твои призы, которые можно будет активировать или конвертировать в NFT",
        )}
      </p>
    </div>
  )
}

export default OthersInventory

const OthersSkeleton = () => {
  return (
    <div className="flex items-center gap-2.5 px-4">
      <Skeleton className="h-[249px] w-[168px] shrink-0 rounded-xl" />
      <Skeleton className="h-[249px] w-[168px] shrink-0 rounded-xl" />
      <Skeleton className="h-[249px] w-[168px] shrink-0 rounded-xl" />
    </div>
  )
}
