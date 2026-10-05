import { useState } from "react"
import { useTranslation } from "react-i18next"

import CartIcon from "@/assets/games/cryptle/icons/cart.svg?react"
import BrushIcon from "@/assets/games/cryptle/icons/brush.svg?react"
import QuestionIcon from "@/modules/Earn/EarnMap/icons/QuestionCircleIcon.tsx"

import GameRulesModal from "./modals/game-rules"
import SkinsShopModal from "./modals/skins-shop"
import SkinsSelectModal from "./modals/skin-select"
import PaymentStatus from "./modals/payment-status"

import { sendMetrika } from "@/utils/sendMetrika"

import { cn } from "@/lib/cn"

const BottomButtons = () => {
  const { t } = useTranslation()

  const [shopOpen, setShopOpen] = useState(false)
  const [rulesOpen, setRulesOpen] = useState(false)
  const [selectOpen, setSelectOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)

  return (
    <>
      <div
        className={cn(
          "fixed right-3.5 z-50 flex flex-col gap-2",
          Telegram.WebApp.platform === "weba"
            ? "bottom-4"
            : "bottom-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
        )}
      >
        <button
          onClick={() => setSelectOpen(true)}
          aria-label={t("Оформление")}
          className="flex h-12 w-12 items-center justify-center rounded-[10px] border border-[#3A2485]/30 bg-gradient-to-b from-[#7D5DE1] to-[#5E43B7] transition-opacity hover:opacity-70 active:opacity-90"
        >
          <BrushIcon className="h-7 w-7" />
        </button>
        <button
          onClick={() => {
            sendMetrika("cryptle_store_click")
            setShopOpen(true)
          }}
          aria-label={t("Магазин")}
          className="flex h-12 w-12 items-center justify-center rounded-[10px] border border-[#3A2485]/30 bg-gradient-to-b from-[#7D5DE1] to-[#5E43B7] transition-opacity hover:opacity-70 active:opacity-90"
        >
          <CartIcon className="h-7 w-7 -translate-x-0.5" />
        </button>
      </div>
      <button
        onClick={() => setRulesOpen(true)}
        aria-label={t("Как играть?")}
        className={cn(
          "fixed left-3.5 z-50 flex h-12 w-12 items-center justify-center rounded-[10px] border border-[#3A2485]/30 bg-gradient-to-b from-[#7D5DE1] to-[#5E43B7] transition-opacity hover:opacity-70 active:opacity-90",
          Telegram.WebApp.platform === "weba"
            ? "bottom-4"
            : "bottom-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
        )}
      >
        <QuestionIcon className="h-7 w-7 text-[#D8D7FD]" />
      </button>

      <GameRulesModal
        open={rulesOpen}
        onOpenChange={setRulesOpen}
        showCloseButton
      />
      <SkinsShopModal
        open={shopOpen}
        setOpenPaymentStatus={setPaymentOpen}
        onOpenChange={setShopOpen}
      />
      <SkinsSelectModal
        open={selectOpen}
        onOpenChange={setSelectOpen}
        handlePremiumSkin={() => {
          setSelectOpen(false)
          setShopOpen(true)
        }}
      />

      <PaymentStatus type="skin" open={paymentOpen} setOpen={setPaymentOpen} />
    </>
  )
}

export default BottomButtons
