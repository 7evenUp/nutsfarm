import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import CartIcon from "@/assets/games/flip-cards/icons/cart.svg?react"
import CardHeaderIcon from "@/assets/games/flip-cards/icons/card-header.svg?react"
import Loader from "@/assets/icons/loader.svg?react"

import StoreBuyPack from "./StoreBuyPack"
import StoreBuyPackPaymentStatus from "./StoreBuyPackPaymentStatus"

import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalTitle,
  ModalTrigger,
} from "../shared/Modal"

import GameButton from "@/modules/Games/components/GameButton"

import { Skeleton } from "@/shared/ui/Skeleton"

import { useGetGameInventoryQuery } from "@/redux/api/games"
import { useGetPaymentItemsQuery } from "@/redux/api/payment"
import { useAppSelector } from "@/redux/hooks"

import { Sound } from "@/utils/Sound"

import { PurchaseItem } from "@/types/payment"
import { sendMetrika } from "@/utils/sendMetrika"

const successBoughtSound = new Sound(
  "/sounds/games/flip-cards/flip-cards-pack-was-bought.mp3",
)

const Store = ({
  openPacks,
  children,
}: {
  openPacks: VoidFunction
  children: React.ReactNode
}) => {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)
  const [paymentStatusOpen, setPaymentStatusOpen] = useState(false)

  const { data: paymentItems } = useGetPaymentItemsQuery({
    type: "GAME_INVENTORY_ITEM",
  })

  const filteredItems = useMemo(() => {
    if (!paymentItems) return []

    return paymentItems.filter(
      (item) => item.gameInventoryType === "CARDS_PACK",
    )
  }, [paymentItems])

  useEffect(() => {
    if (open) {
      successBoughtSound.load()
    }
  }, [open])

  return (
    <>
      <Modal open={open} onOpenChange={setOpen}>
        <ModalTrigger asChild>{children}</ModalTrigger>
        <ModalContent className="max-h-[85vh] w-[324px] px-4 pt-8">
          <ModalTitle className="sr-only">Meta Match Store</ModalTitle>
          <ModalDescription className="sr-only">
            Meta Match Store
          </ModalDescription>

          <div className="absolute left-1/2 top-0 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border border-[#191563] bg-[#533480]">
            <CartIcon className="h-8 w-8 -translate-x-0.5" />
          </div>

          <h2 className="mb-1 bg-gradient-to-b from-[#0F0C5A] to-[#564C9F] bg-clip-text font-days-one text-[30px]/[150%] text-transparent">
            {t("Магазин")}
          </h2>

          <div className="no-scroll max-h-[420px] overflow-y-scroll px-2 pb-8">
            <p className="text-center text-sm/4 font-semibold text-[#382E6D]/60">
              {t("Ты можешь приобрести новые MetaPacks за звезды Телеграм")}
            </p>

            <div
              className="mt-[70px] grid grid-cols-2 gap-x-3 gap-y-16"
              style={{
                gridTemplateRows: `repeat(${Math.round(filteredItems.length / 2)}, minmax(0, 1fr))`,
              }}
            >
              {filteredItems.length > 0 ? (
                filteredItems.map(
                  (item, i) =>
                    item.cardsPack !== null && (
                      <PackItem
                        key={i}
                        {...item}
                        openPacks={() => {
                          setOpen(false)
                          openPacks()
                        }}
                        openPaymentStatus={() => setPaymentStatusOpen(true)}
                        successBoughtSound={successBoughtSound}
                      />
                    ),
                )
              ) : (
                <>
                  <Skeleton className="h-[158px] w-[129px] rounded-xl bg-[#BEB4DE]/50" />
                  <Skeleton className="h-[158px] w-[129px] rounded-xl bg-[#BEB4DE]/50" />
                  <Skeleton className="h-[158px] w-[129px] rounded-xl bg-[#BEB4DE]/50" />
                  <Skeleton className="h-[158px] w-[129px] rounded-xl bg-[#BEB4DE]/50" />
                </>
              )}
            </div>
          </div>
        </ModalContent>
      </Modal>
      <StoreBuyPackPaymentStatus
        openPacks={() => {
          setOpen(false)
          openPacks()
        }}
        open={paymentStatusOpen}
        setOpen={setPaymentStatusOpen}
        successBoughtSound={successBoughtSound}
      />
    </>
  )
}

export default Store

const PackItem = ({
  openPacks,
  openPaymentStatus,
  successBoughtSound,
  ...item
}: {
  openPacks: VoidFunction
  openPaymentStatus: VoidFunction
  successBoughtSound: Sound
} & PurchaseItem) => {
  const { t } = useTranslation()

  const { image, imageEn, title, titleEn, description, descriptionEn } =
    item.cardsPack!

  const lang = useAppSelector((state) => state.language.value)

  const { data: gameInventory, isFetching } = useGetGameInventoryQuery()

  const cardPacks = useMemo(() => {
    if (!gameInventory) return null
    if (gameInventory.length === 0) return null

    const packs = gameInventory.filter((item) => item.type === "CARDS_PACK")

    if (packs.length === 0) return null

    return packs
  }, [gameInventory])

  const imgSrc = lang === "RU" ? image : imageEn
  const packTitle = lang === "RU" ? title : titleEn
  const packDescription = lang === "RU" ? description : descriptionEn

  if (
    cardPacks?.some((inventoryPack) => inventoryPack.objectId === item.objectId)
  )
    return (
      <div className="relative flex flex-col items-center gap-2 rounded-b-xl border border-[#382E6D]/[6%] bg-[#BEB4DE]/50 px-2 pb-4 pt-[50px]">
        <CardHeaderIcon className="absolute -inset-x-0.5 left-1/2 top-0 -translate-x-1/2 -translate-y-[45px]" />
        <img
          className="absolute left-1/2 top-0 h-[42px] w-[42px] -translate-x-1/2 -translate-y-6"
          src={imgSrc}
        />

        <h2 className="text-center text-sm/none font-bold text-[#382E6D]">
          {packTitle}
        </h2>
        <p className="line-clamp-2 text-center text-[10px]/[12px] font-medium text-[#382E6D]/80">
          {packDescription}
        </p>

        <GameButton
          appearance="flip-cards"
          className="mt-auto h-[25px] gap-[3px] px-6 text-sm/[150%] shadow-none"
          disabled
        >
          {t("Куплен")}
        </GameButton>
      </div>
    )

  return (
    <StoreBuyPack
      {...item}
      openPacks={openPacks}
      openPaymentStatus={openPaymentStatus}
      successBoughtSound={successBoughtSound}
    >
      <button
        className="relative flex flex-col items-center gap-2 rounded-b-xl border border-[#382E6D]/[6%] bg-[#BEB4DE]/50 px-2 pb-4 pt-[50px]"
        onClick={() => {
          sendMetrika("metamatch_pack_detail")
        }}
        disabled={isFetching}
      >
        <CardHeaderIcon className="absolute -inset-x-0.5 left-1/2 top-0 -translate-x-1/2 -translate-y-[45px]" />
        <img
          className="absolute left-1/2 top-0 h-[42px] w-[42px] -translate-x-1/2 -translate-y-6"
          src={imgSrc}
        />

        <h2 className="text-center text-sm/none font-bold text-[#382E6D]">
          {packTitle}
        </h2>
        <p className="line-clamp-2 text-center text-[10px]/[12px] font-medium text-[#382E6D]/80">
          {packDescription}
        </p>

        <GameButton
          appearance="flip-cards"
          className="mt-auto h-[25px] gap-[3px] px-6 text-sm/[150%]"
          disabled={isFetching}
        >
          {isFetching ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            t("Купить")
          )}
        </GameButton>
      </button>
    </StoreBuyPack>
  )
}
