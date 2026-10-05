import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import Loader from "@/assets/icons/loader.svg?react"

import MintInfoModal from "@/modals/MintInfoModal"

import { useAppSelector } from "@/redux/hooks"
import {
  useCommitPaymentMutation,
  useCommitTonPaymentMutation,
} from "@/redux/api/payment"
import {
  useClaimInventoryItemMutation,
  useGetInventoryQuery,
  useMintFreeNFTMutation,
} from "@/redux/api/inventory"
import { useGetCurrentUserQuery } from "@/redux/api/user"

import { Button } from "@/shared/ui/Button"
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

const NftItem = ({
  itemId,
  imgSrc,
  title,
  isClaimed,
  isMintActive,
  starsPrice,
  tonPrice,
  tonFullPrice,
  mintItemId,
  mintPrizeAmount,
  mintPrizeXpAmount,
  openSuccessfullPayment,
}: {
  itemId: string
  imgSrc: string
  title: string
  isClaimed: boolean
  isMintActive: boolean
  starsPrice: number
  tonPrice: number
  tonFullPrice: number
  mintItemId?: number
  mintPrizeAmount: number
  mintPrizeXpAmount: number
  openSuccessfullPayment: () => void
}) => {
  const { t } = useTranslation()

  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false)
  const [isClaimProcessing, setIsClaimProcessing] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const lang = useAppSelector((state) => state.language.value)

  const { data: userProfile, refetch: refetchProfile } =
    useGetCurrentUserQuery()
  const { refetch: refetchInventory } = useGetInventoryQuery()
  const [claimInventory] = useClaimInventoryItemMutation()
  const [commitPayment] = useCommitPaymentMutation({
    fixedCacheKey: "mint-nft",
  })
  const [commitTonPayment] = useCommitTonPaymentMutation()
  const [freeMint] = useMintFreeNFTMutation()

  const handlePayment = async () => {
    if (isClaimed || !starsPrice || !mintItemId) return
    if (!userProfile) return

    setIsPaymentProcessing(true)

    if (userProfile.freeNftMints && userProfile.freeNftMints > 0) {
      try {
        await freeMint({ id: itemId }).unwrap()
        refetchInventory()
        refetchProfile()
      } catch (err) {
        toast.error(t("Ошибка"), { description: t("Упс, что-то пошло не так") })
      } finally {
        setIsPaymentProcessing(false)
        setIsModalOpen(false)
      }

      return
    }

    try {
      if (Telegram.WebApp.initData) {
        const response = await commitPayment({
          id: Number(mintItemId),
          lang,
          objectId: Number(itemId),
        }).unwrap()

        // @ts-expect-error Not-in-telegram-environment
        const status = await invoice.open(response.paymentFormUrl, "url")
        if (status === "paid") {
          openSuccessfullPayment()
        }
      } else {
        const response = await commitTonPayment({
          id: mintItemId,
          lang,
          objectId: Number(itemId),
        }).unwrap()

        window.open(response.paymentFormUrl, "_top")
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "WebAppMethodUnsupported") {
          toast.error("Ошибка: openInvoice не поддерживается")
          return
        }
        if (err.message === "WebAppInvoiceOpened") {
          toast.error("Ошибка: такой счёт уже был открыт")
          return
        }
      }
      toast.error(t("Ошибка"), { description: t("Упс, что-то пошло не так") })
    } finally {
      setIsPaymentProcessing(false)
      setIsModalOpen(false)
    }
  }

  const handleClaim = async () => {
    if (isClaimed) return
    setIsClaimProcessing(true)
    try {
      await claimInventory({ inventoryId: itemId }).unwrap()
    } catch (err) {
      toast.error(t("Ошибка"), { description: t("Упс, что-то пошло не так") })
    } finally {
      setIsClaimProcessing(false)
    }
  }

  const getButtonState = () => {
    // 1) Если уже клеймлено → «Активировано»
    if (isClaimed) {
      return {
        disabled: true,
        content: t("Активировано"),
      }
    }

    // 2) Платный NFT: starsPrice != null
    if (starsPrice != null) {
      // 2.1) Еще не оплачено (isMintActive === false) → «Минт <цена>»
      if (!isMintActive) {
        return {
          disabled: isPaymentProcessing,
          onClick: () => setIsModalOpen(true),
          content: t("Минт"),
        }
      }

      // 2.2) Оплачено (isMintActive === true) → «Активировать»
      return {
        disabled: isClaimProcessing,
        onClick: handleClaim,
        content: isClaimProcessing ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          t("Активировать")
        ),
      }
    }

    // 3) Бесплатный NFT: starsPrice == null
    //    – но пока isMintActive === false → «Скоро.инвентарь»
    if (!isMintActive) {
      return {
        disabled: true,
        content: t("Скоро.инвентарь"),
      }
    }

    // 3.1) Если backend выставил isMintActive === true (бесплатный NFT теперь доступен) → «Активировать»
    return {
      disabled: isClaimProcessing,
      onClick: handleClaim,
      content: isClaimProcessing ? (
        <Loader className="h-4 w-4 animate-spin" />
      ) : (
        t("Активировать")
      ),
    }
  }

  const buttonState = getButtonState()

  return (
    <>
      <div className="flex h-[249px] w-[168px] shrink-0 flex-col gap-2.5 rounded-xl bg-[#17202D] p-1">
        <img
          className="h-[160px] w-[160px] rounded-lg bg-[#050D12] object-cover"
          src={imgSrc}
          alt={title}
        />

        <span className="ml-0.5 text-sm font-semibold capitalize">{title}</span>

        <Button
          appearance="white"
          disabled={buttonState.disabled}
          className="mt-auto h-8"
          contentClassName={cn(
            "flex h-7 items-center justify-center gap-1 rounded-lg px-0 text-xs font-semibold",
            buttonState.disabled && "h-8",
          )}
          shadowClassName="h-8 rounded-lg group-active:h-7"
          onClick={buttonState.onClick}
        >
          {buttonState.content}
        </Button>
      </div>

      <MintInfoModal
        isOpen={isModalOpen}
        setOpen={setIsModalOpen}
        imgSrc={imgSrc}
        title={title}
        mintPrizeAmount={mintPrizeAmount}
        mintPrizeXpAmount={mintPrizeXpAmount}
        onMint={handlePayment}
        isMintProcessing={isPaymentProcessing}
        starsPrice={starsPrice}
        tonPrice={tonPrice}
        tonFullPrice={tonFullPrice}
      />
    </>
  )
}

export default NftItem
