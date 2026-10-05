import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import {
  Modal,
  ModalTitle,
  ModalContent,
  ModalHeader,
  ModalDescription,
} from "../../shared/Modal"

import StarIcon from "@/assets/lesson-icons/star-icon.svg?react"
import NutsCoin from "@/assets/lesson-icons/nutscoin.svg?react"
import Loader from "@/assets/icons/loader.svg?react"
import TonIcon from "@/assets/icons/ton.svg?react"

import {
  useCommitNutsPaymentMutation,
  useCommitPaymentMutation,
  useCommitTonPaymentMutation,
  useGetPaymentItemsQuery,
} from "@/redux/api/payment"
import { useAppSelector } from "@/redux/hooks"
import { useGetGameInventoryQuery } from "@/redux/api/games"
import { useGetCurrentUserQuery } from "@/redux/api/user"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"
import { numberWithSpaces } from "@/utils/numberWithSpaces"
import { sendMetrika } from "@/utils/sendMetrika"

import { PurchaseItem } from "@/types/payment"

import { cn } from "@/lib/cn"

import { initInvoice } from "@telegram-apps/sdk"

// @ts-expect-error Not-in-telegram-environment
let invoice

if (import.meta.env.VITE_IS_DEV_LOCAL === undefined) {
  try {
    invoice = initInvoice()
  } catch {
    /* empty */
  }
}

interface SkinsShopModalProps {
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
  setOpenPaymentStatus: Dispatch<SetStateAction<boolean>>
}

const SkinsShopModal = ({
  open,
  onOpenChange,
  setOpenPaymentStatus,
}: SkinsShopModalProps) => {
  const { t } = useTranslation()

  const { data: paymentItems } = useGetPaymentItemsQuery({
    type: "GAME_INVENTORY_ITEM",
  })

  const filteredItems = useMemo(() => {
    if (!paymentItems) return []

    return paymentItems.filter(
      (item) => item.gameInventoryType === "WORDLY_COLOUR",
    )
  }, [paymentItems])

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="w-[290px] shadow-[#0B0C48]/25 outline-none">
        <ModalTitle className="sr-only">Cryptle skins shop modal</ModalTitle>
        <ModalDescription className="sr-only">
          Cryptle skins shop modal
        </ModalDescription>

        <ModalHeader className="min-h-20 w-full">{t("Магазин")}</ModalHeader>

        <div className="h-full pb-6 pt-[18px]">
          {/* Rules block */}
          <p className="mb-5 px-5 text-center font-nunito text-sm/4 font-semibold text-[#46319080]/50">
            {t("Ты можешь приобрести новое оформление игры за звезды Телеграм")}
          </p>
          <div className="flex flex-col gap-2 px-2">
            {filteredItems.length > 0 &&
              filteredItems.map((item, i) => (
                <SkinItem
                  key={i}
                  {...item}
                  onOpenChange={onOpenChange}
                  setOpenPaymentStatus={setOpenPaymentStatus}
                />
              ))}
          </div>
        </div>
      </ModalContent>
    </Modal>
  )
}

export default SkinsShopModal

const SkinItem = ({
  title,
  titleEn,
  starsPrice,
  tonPrice,
  image,
  id,
  nutsPrice,
  onOpenChange,
  setOpenPaymentStatus,
}: PurchaseItem & {
  onOpenChange: Dispatch<SetStateAction<boolean>>
  setOpenPaymentStatus: Dispatch<SetStateAction<boolean>>
}) => {
  const { t } = useTranslation()

  const [paymentStatus, setPaymentStatus] = useState<
    "cancelled" | "paid" | null
  >(null)
  const [isCommitPaymentLocked, setIsCommitPaymentLocked] = useState(false)
  const [isBuyByNutsLocked, setIsBuyByNutsLocked] = useState(false)

  const lang = useAppSelector((state) => state.language.value)

  const itemTitle = lang === "RU" ? title : titleEn

  const { data: currentUser } = useGetCurrentUserQuery()
  const { data: gameInventory, refetch: refetchGameInventory } =
    useGetGameInventoryQuery()
  const [buyByNuts] = useCommitNutsPaymentMutation()
  const [commitPayment] = useCommitPaymentMutation({
    fixedCacheKey: "skin",
  })
  const [commitTonPayment] = useCommitTonPaymentMutation()

  const isBought = useMemo(() => {
    if (!gameInventory) return false

    const filteredInventoryItems = gameInventory.filter(
      (item) => item.type === "WORDLY_COLOUR",
    )

    return filteredInventoryItems.some(
      (inventoryItem) => inventoryItem.title === title,
    )
  }, [gameInventory])

  useEffect(() => {
    if (paymentStatus === null) return

    if (paymentStatus === "cancelled") {
      setPaymentStatus(null)
      return
    }

    if (paymentStatus === "paid") {
      setPaymentStatus(null)
      onOpenChange(false)
      setOpenPaymentStatus(true)
      return
    }
  }, [paymentStatus])

  const onBuyByNutsClick = async (id: number) => {
    if (isBuyByNutsLocked) return

    makeHapticFeedback({ notificationOccured: "success" })
    sendMetrika("cryptle_buy_pack")

    setIsBuyByNutsLocked(true)

    try {
      await buyByNuts({ id }).unwrap()
      await refetchGameInventory().unwrap()
      toast(t("Великолепно, теперь можешь выбрать скин в игровом инвентаре"), {
        className: "justify-center text-center",
      })
      // successBoughtSound.play()
      onOpenChange(false)
      // openPacks()
    } catch {
      toast.error(t("Ошибка"), {
        description: t("Упс, что-то пошло не так"),
      })
    } finally {
      setIsBuyByNutsLocked(false)
    }
  }

  const buySkin = async (id: number) => {
    if (isCommitPaymentLocked) return

    makeHapticFeedback({ notificationOccured: "success" })
    sendMetrika("cryptle_buy_pack")

    setIsCommitPaymentLocked(true)

    try {
      if (Telegram.WebApp.initData) {
        const response = await commitPayment({
          id: id,
          lang,
        }).unwrap()

        // @ts-expect-error Not-in-telegram-environment
        const status = await invoice.open(response.paymentFormUrl, "url")
        setPaymentStatus(status)
      } else {
        const response = await commitTonPayment({
          id: id,
          lang,
        }).unwrap()

        window.open(response.paymentFormUrl, "_top")
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "WebAppMethodUnsupported")
          toast.error("Ошибка, openInvoice не поддерживается")
        if (err.message === "WebAppInvoiceOpened")
          toast.error("Ошибка, openInvoice с такой ссылкой уже был открыт")

        return
      }
      toast.error(t("Ошибка"), {
        description: t("Упс, что-то пошло не так"),
      })
    } finally {
      setTimeout(() => {
        setIsCommitPaymentLocked(false)
      }, 20)
    }
  }

  if (starsPrice)
    return (
      <div
        key={`skins${id}`}
        className="flex gap-5 rounded-lg bg-gradient-to-r from-[#E3E5FF] to-[#EDF3FF] p-[5px]"
      >
        <img src={image} alt={itemTitle} className="h-16 w-16 rounded-xl" />
        <div className="flex flex-col gap-1.5">
          <h2 className="mt-2 font-nunito text-sm/4 font-bold text-[#463190BF]/75">
            {itemTitle}
          </h2>
          <button
            className={cn(
              "flex h-[26px] min-w-28 items-center justify-center rounded-md border border-[#7D6ABA33]/20 bg-gradient-to-r from-[#D5D7FF] to-[#E0E7FE] px-2.5 text-xs/4 font-bold text-[#2F2852]",
              isBought
                ? "text-[#2F2852]/75 opacity-90"
                : "shadow-[0_1px_0_rgba(125,106,186,0.25)] active:translate-y-0.5 active:shadow-none",
            )}
            onClick={() => buySkin(id)}
            disabled={isBought}
          >
            {isCommitPaymentLocked ? (
              <Loader className="h-3 w-3 animate-spin" />
            ) : isBought ? (
              t("Куплено")
            ) : (
              <>
                {t("Приобрести за")}
                {Telegram.WebApp.initData ? (
                  <>
                    <StarIcon className="mx-1 h-2.5 w-2.5" />
                    {starsPrice}
                  </>
                ) : (
                  <>
                    <TonIcon className="mx-1 h-2.5 w-2.5" />
                    {tonPrice.toFixed(2)}
                  </>
                )}
              </>
            )}
          </button>
        </div>
      </div>
    )

  if (currentUser && nutsPrice)
    return (
      <div
        key={`skins${id}`}
        className="flex gap-5 rounded-lg bg-gradient-to-r from-[#E3E5FF] to-[#EDF3FF] p-[5px]"
      >
        <img src={image} alt={itemTitle} className="h-16 w-16 rounded-xl" />
        <div className="flex flex-col gap-1.5">
          <h2 className="mt-2 font-nunito text-sm/4 font-bold text-[#463190BF]/75">
            {itemTitle}
          </h2>
          <button
            className={cn(
              "flex h-[26px] min-w-28 items-center justify-center rounded-md border border-[#7D6ABA33]/20 bg-gradient-to-r from-[#D5D7FF] to-[#E0E7FE] px-2.5 text-xs/4 font-bold text-[#2F2852]",
              isBought
                ? "text-[#2F2852]/75 opacity-90"
                : "shadow-[0_1px_0_rgba(125,106,186,0.25)] active:translate-y-0.5 active:shadow-none",
            )}
            onClick={() => onBuyByNutsClick(id)}
            disabled={currentUser.balance < nutsPrice || isBought}
          >
            {isBuyByNutsLocked ? (
              <Loader className="h-3 w-3 animate-spin" />
            ) : isBought ? (
              t("Куплено")
            ) : (
              <>
                {t("Приобрести за")}
                <NutsCoin className="mx-1 h-4 w-4" />
                {numberWithSpaces(nutsPrice)}
              </>
            )}
          </button>
        </div>
      </div>
    )
}
