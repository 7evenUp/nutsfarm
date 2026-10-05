import { useState } from "react"
import { useTranslation } from "react-i18next"
import useEmblaCarousel from "embla-carousel-react"

import NftItem from "./NftItem"

import MintPaymentStatus from "@/modals/MintPaymentStatus/MintPaymentStatus"

import { Skeleton } from "@/shared/ui/Skeleton"

import { useGetInventoryQuery } from "@/redux/api/inventory"
import { useGetPaymentItemsQuery } from "@/redux/api/payment"
import { useAppSelector } from "@/redux/hooks"

const NftInventory = () => {
  const { t } = useTranslation()

  const [successfullMintOpen, setSuccessfullMintOpen] = useState(false)

  const lang = useAppSelector((state) => state.language.value)

  const { data: paymentItems } = useGetPaymentItemsQuery({
    type: "UNLOCK_INVENTORY_CLAIM",
  })
  const { data: inventory, isLoading: isInventoryLoading } =
    useGetInventoryQuery()

  const [emblaRef] = useEmblaCarousel({
    dragFree: true,
    loop: false,
  })

  if (isInventoryLoading) return <NftsSkeleton />

  if (inventory && inventory.length > 0) {
    const nftItems = inventory.filter(
      (item) =>
        item.type === "NFT" ||
        item.type === "STREAK_ADDITIONAL_REWARD" ||
        item.type === "UNLOCK_INVENTORY_CLAIM",
    )

    return (
      <div
        className="w-full cursor-grab overflow-hidden px-4 active:cursor-grabbing"
        ref={emblaRef}
      >
        <div className="flex items-center gap-2">
          {nftItems.map((item) => (
            <NftItem
              key={item.id}
              itemId={item.id}
              isMintActive={item.isMintActive}
              starsPrice={item.mintPriceStars}
              tonPrice={item.mintPriceTon}
              tonFullPrice={item.mintPriceTonFull}
              isClaimed={item.status === "CLAIMED"}
              imgSrc={lang === "RU" ? item.image : item.imageEn}
              title={lang === "RU" ? item.title : item.titleEn}
              mintItemId={paymentItems && paymentItems[0]?.id}
              mintPrizeAmount={item.mintPrizeAmount}
              mintPrizeXpAmount={item.mintPrizeXpAmount}
              openSuccessfullPayment={() => {
                setSuccessfullMintOpen(true)
              }}
            />
          ))}
          <MintPaymentStatus
            open={successfullMintOpen}
            setOpen={setSuccessfullMintOpen}
          />
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

export default NftInventory

const NftsSkeleton = () => {
  return (
    <div className="flex items-center gap-2.5 px-4">
      <Skeleton className="h-[249px] w-[168px] shrink-0 rounded-xl" />
      <Skeleton className="h-[249px] w-[168px] shrink-0 rounded-xl" />
      <Skeleton className="h-[249px] w-[168px] shrink-0 rounded-xl" />
    </div>
  )
}
