import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

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

import StarIcon from "@/assets/games/flip-cards/icons/star.svg?react"
import ShareIcon from "@/assets/games/flip-cards/icons/share-icon.svg?react"
import CoinIcon from "@/assets/games/shared-icons/coin-icon.svg?react"
import Loader from "@/assets/icons/loader.svg?react"
import TonIcon from "@/assets/icons/ton.svg?react"

import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalTitle,
  ModalTrigger,
} from "../shared/Modal"
import RarityLabel from "../shared/RarityLabel"

import GameButton from "@/modules/Games/components/GameButton"

import {
  useCommitNutsPaymentMutation,
  useCommitPaymentMutation,
  useCommitTonPaymentMutation,
} from "@/redux/api/payment"
import { useGetCurrentUserQuery } from "@/redux/api/user"
import { useGetGameInventoryQuery } from "@/redux/api/games"
import { useAppSelector } from "@/redux/hooks"

import { PurchaseItem } from "@/types/payment"
import { CardsPackBody } from "@/types/games"

import { numberWithSpaces } from "@/utils/numberWithSpaces"
import { openLinkWithTelegram } from "@/utils/openLink"
import { Sound } from "@/utils/Sound"
import { sendMetrika } from "@/utils/sendMetrika"
import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

import { cn } from "@/lib/cn"

const StoreBuyPack = ({
  children,
  openPacks,
  openPaymentStatus,
  successBoughtSound,
  ...purchaseItem
}: {
  children: React.ReactNode
  openPacks: VoidFunction
  openPaymentStatus: VoidFunction
  successBoughtSound: Sound
} & PurchaseItem) => {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<
    "cancelled" | "paid" | null
  >(null)
  const [isCommitPaymentLocked, setIsCommitPaymentLocked] = useState(false)
  const [isBuyByNutsLocked, setIsBuyByNutsLocked] = useState(false)

  const lang = useAppSelector((state) => state.language.value)

  const { data: currentUser } = useGetCurrentUserQuery()
  const { refetch: refetchGameInventory } = useGetGameInventoryQuery()
  const [buyByNuts] = useCommitNutsPaymentMutation()
  const [commitStarsPayment] = useCommitPaymentMutation({
    fixedCacheKey: "flip-cards-buy-pack",
  })
  const [commitTonPayment] = useCommitTonPaymentMutation()

  useEffect(() => {
    if (paymentStatus === null) return

    if (paymentStatus === "cancelled") {
      setPaymentStatus(null)
      return
    }

    if (paymentStatus === "paid") {
      setPaymentStatus(null)
      setOpen(false)
      openPaymentStatus()
      return
    }
  }, [paymentStatus])

  if (!currentUser) return null

  const { title, titleEn, description, descriptionEn, body, rarity, bonus } =
    purchaseItem.cardsPack!

  const packTitle = lang === "RU" ? title : titleEn
  const packDescription = lang === "RU" ? description : descriptionEn

  const cardsBody: CardsPackBody[] = JSON.parse(body)

  const onBuyByStarsClick = async () => {
    if (isCommitPaymentLocked) return

    makeHapticFeedback({ notificationOccured: "success" })
    sendMetrika("metamatch_buy_pack_stars")

    setIsCommitPaymentLocked(true)

    try {
      if (Telegram.WebApp.initData) {
        const response = await commitStarsPayment({
          id: purchaseItem.id,
          lang,
        }).unwrap()

        // @ts-expect-error Not-in-telegram-environment
        const status = await invoice.open(response.paymentFormUrl, "url")
        setPaymentStatus(status)
      } else {
        const response = await commitTonPayment({
          id: purchaseItem.id,
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

  const onBuyByNutsClick = async () => {
    if (isBuyByNutsLocked) return

    setIsBuyByNutsLocked(true)
    sendMetrika("metamatch_buy_pack_nuts")

    try {
      await buyByNuts({ id: purchaseItem.id }).unwrap()
      await refetchGameInventory().unwrap()
      successBoughtSound.play()
      setOpen(false)
      openPacks()
    } catch {
      toast.error(t("Ошибка"), {
        description: t("Упс, что-то пошло не так"),
      })
    } finally {
      setIsBuyByNutsLocked(false)
    }
  }

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalTrigger asChild>{children}</ModalTrigger>
      <ModalContent className="w-80 px-6 pb-[18px] pt-10">
        <ModalTitle className="sr-only">Meta Match Store</ModalTitle>
        <ModalDescription className="sr-only">
          Meta Match Store
        </ModalDescription>

        {rarity !== "COMMON" && (
          <RarityLabel className="absolute right-3 top-3" rarity={rarity} />
        )}

        <h2 className="mb-2 bg-gradient-to-b from-[#0F0C5A] to-[#564C9F] bg-clip-text text-center font-days-one text-[30px]/[32px] text-transparent">
          {packTitle}
        </h2>

        <p className="text-center text-xs/none font-medium text-[#382E6D]/80">
          {packDescription}
        </p>

        {Array.isArray(cardsBody) && (
          <div className="no-scroll mt-3 flex max-h-[240px] w-full flex-col divide-y divide-[#867FAC]/20 overflow-y-scroll py-3 [mask-image:linear-gradient(to_bottom,transparent,red_12%,red_88%,transparent)]">
            {cardsBody.map((item) => (
              <PackItem key={item.title + item.description} {...item} />
            ))}
          </div>
        )}

        <p className="mb-4 mt-6 text-center text-xs/none font-medium text-[#382E6D]/80">
          {t("Множитель наград за игру с этим паком")}{" "}
          <span className="font-bold text-[#382E6D]">x{bonus}</span>
        </p>

        <div className="flex w-full flex-col gap-2 px-6">
          {purchaseItem.nutsPrice !== null && purchaseItem.nutsPrice > 0 && (
            <GameButton
              appearance="flip-cards"
              className="h-10 w-full items-center"
              onClick={onBuyByNutsClick}
              disabled={currentUser.balance < purchaseItem.nutsPrice}
            >
              {isBuyByNutsLocked ? (
                <Loader className="animate-spin" />
              ) : (
                <>
                  <span>{t("Приобрести за")}</span>
                  <CoinIcon
                    className={cn(
                      "ml-2 mr-[3px] h-4 w-4 drop-shadow-[0px_0px_1px_rgba(0,0,0,0.6)]",
                      currentUser.balance < purchaseItem.nutsPrice &&
                        "opacity-75",
                    )}
                  />
                  <span className="translate-y-px text-sm/[150%] tracking-normal">
                    {numberWithSpaces(purchaseItem.nutsPrice)}
                  </span>
                </>
              )}
            </GameButton>
          )}

          {purchaseItem.starsPrice && (
            <GameButton
              appearance="flip-cards"
              className="h-10 w-full items-center"
              onClick={onBuyByStarsClick}
            >
              {isCommitPaymentLocked ? (
                <Loader className="animate-spin" />
              ) : (
                <>
                  <span>{t("Приобрести за")}</span>
                  {Telegram.WebApp.initData ? (
                    <>
                      <StarIcon className="ml-2 mr-[3px]" />
                      <span className="translate-y-px text-sm/[150%] tracking-normal">
                        {purchaseItem.starsPrice}
                      </span>
                    </>
                  ) : (
                    <>
                      <TonIcon className="ml-2 mr-[3px] h-3.5 w-3.5" />
                      <span className="translate-y-px text-sm/[150%] tracking-normal">
                        {purchaseItem.tonPrice.toFixed(2)}
                      </span>
                    </>
                  )}
                </>
              )}
            </GameButton>
          )}
        </div>
      </ModalContent>
    </Modal>
  )
}

export default StoreBuyPack

const PackItem = ({
  title,
  titleEn,
  description,
  descriptionEn,
  link,
  img,
}: CardsPackBody) => {
  const lang = useAppSelector((state) => state.language.value)

  const itemTitle = lang === "RU" ? title : titleEn
  const itemDescription = lang === "RU" ? description : descriptionEn

  return (
    <button
      className={cn("flex items-center py-2", !link && "pointer-events-none")}
      onClick={() => {
        if (!link) return

        openLinkWithTelegram(link, true)
      }}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-[#153672] to-[#010036]">
        <img
          src={img}
          alt={itemTitle}
          className="h-full w-full rounded-[7px] object-contain"
        />
      </div>
      <div className="ml-2 mr-5 flex flex-col gap-1">
        <h3 className="text-left text-xs/[14px] font-bold text-[#382E6D]">
          {itemTitle}
        </h3>
        <p className="line-clamp-2 text-left text-[10px]/[11px] font-semibold text-[#382E6D]/50">
          {itemDescription}
        </p>
      </div>
      {link && <ShareIcon className="ml-auto shrink-0 self-start" />}
    </button>
  )
}
