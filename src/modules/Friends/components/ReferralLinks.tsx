import { toast } from "sonner"
import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "react-i18next"

import Loader from "@/assets/icons/loader.svg?react"
import OKXIcon from "@/assets/icons/OKX.svg?react"
import ByBitIcon from "@/assets/icons/ByBit.svg?react"
import BitGetIcon from "@/assets/icons/BitGet.svg?react"
import BinanceIcon from "@/assets/icons/Binance.svg?react"
import ChevronDown from "@/assets/icons/chevron-down.svg?react"
import MoneyBagIcon from "@/assets/friends/icons/money-bag.svg?react"

import {
  useGetRefExchangesQuery,
  useGetRefLinksQuery,
  useUpdateRefLinksMutation,
} from "@/redux/api/referals"

import { cn } from "@/lib/cn"

export default function ReferralLinks() {
  const { t } = useTranslation()

  const [isOpen, setIsOpen] = useState(false)
  const [links, setLinks] = useState<Record<string, string>>({})

  const { data: exchangesData } = useGetRefExchangesQuery()
  const { data: currentLinks, isLoading: isRefLinkLoading } =
    useGetRefLinksQuery({ isGifts: false })
  const [updateLinks, { isLoading: isUpdateLoading }] =
    useUpdateRefLinksMutation()

  const exchanges = useMemo(() => {
    if (!exchangesData) return []

    return exchangesData.filter(
      (el) =>
        el === "BINANCE" || el === "BYBIT" || el === "BITGET" || el === "OKX",
    )
  }, [exchangesData])

  useEffect(() => {
    if (currentLinks) {
      setLinks(currentLinks)
    }
  }, [currentLinks])

  const handleInputChange = (exchange: string, value: string) => {
    setLinks((prev) => ({ ...prev, [exchange]: value }))
  }

  const hasChanges = () => {
    if (!currentLinks) return false
    return Object.keys(links).some((key) => links[key] !== currentLinks[key])
  }

  const handleSubmit = async () => {
    try {
      await updateLinks({ body: links, isGifts: false }).unwrap()
      toast(t("Реферальные ссылки установлены"), {
        className: "justify-center text-center",
      })
    } catch (error) {
      // @ts-expect-error NO RTKQ error types
      if (error.data.includes("Reflink is not correct")) {
        toast.error(t("Ошибка"), {
          description: t("Неверный формат реф. ссылки"),
        })
        return
      }

      toast.error(t("Ошибка"), {
        description: t("Упс, что-то пошло не так"),
      })
    }
  }

  return (
    <div className="mt-2 w-full overflow-hidden rounded-xl bg-[#17202D] text-white">
      <div className="flex flex-col p-1.5">
        <button
          className="flex cursor-pointer gap-3"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "hide inputs" : "show inputs"}
        >
          <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-xl bg-[#0F1824]">
            <MoneyBagIcon />
          </div>
          <div className="py-2">
            <h2 className="mb-1.5 flex items-center gap-1.5 text-left text-sm font-medium">
              {t("Ваши реф. ссылки — ваш доход!")}
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="h-5 w-5" />
              </motion.div>
            </h2>
            <p className="text-left text-[11px] font-medium text-white/50">
              {t(
                "Добавьте свои реф. ссылки — они автоматически интегрируются в курс. Ваши рефералы в Nuts Farm будут регистрироваться по вашим ссылкам, принося вам доход!",
              )}
            </p>
          </div>
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mx-1.5 overflow-hidden"
            >
              <div className="mt-[19px] space-y-2">
                {exchanges.length > 0 &&
                  exchanges.map((exchange) => (
                    <label
                      key={exchange}
                      className="flex items-center gap-4 rounded-xl bg-[#050D12] p-2.5 pr-3.5 transition-colors focus-within:bg-[#283649]"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center">
                        {exchange === "BINANCE" && <BinanceIcon />}
                        {exchange === "BYBIT" && <ByBitIcon />}
                        {exchange === "BITGET" && <BitGetIcon />}
                        {exchange === "OKX" && <OKXIcon />}
                      </div>
                      <input
                        className="h-auto w-full text-ellipsis border-0 bg-transparent p-0 text-sm text-white placeholder:text-white/50 focus:outline-none"
                        placeholder={`www.${exchange.toLowerCase()}.com`}
                        disabled={isRefLinkLoading}
                        value={links[exchange] || ""}
                        onChange={(e) =>
                          handleInputChange(exchange, e.target.value)
                        }
                      />
                    </label>
                  ))}
              </div>
              <button
                disabled={isUpdateLoading || isRefLinkLoading || !hasChanges()}
                onClick={handleSubmit}
                className={cn(
                  "relative z-0 mb-1.5 mt-4 flex h-[44px] w-full items-center justify-center rounded-xl text-sm font-bold",
                  isUpdateLoading || isRefLinkLoading || !hasChanges()
                    ? "bg-[#283649] text-white/20"
                    : "bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#8BCAFF] to-[#62AAFF] text-[#050D12]",
                )}
              >
                {isUpdateLoading ? (
                  <Loader className="animate-spin" />
                ) : (
                  t("Подтвердить")
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
