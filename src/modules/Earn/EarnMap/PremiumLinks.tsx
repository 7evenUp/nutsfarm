import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import PortalsIcon from "@/assets/gift-marketplaces/portals.svg?react"
import TonnelIcon from "@/assets/gift-marketplaces/tonnel.svg?react"
import MRKTIconPNG from "@/assets/gift-marketplaces/mrkt.jpg"
import Loader from "@/assets/icons/loader.svg?react"

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/shared/ui/Drawer"
import { LargeButton } from "@/shared/ui/LargeButton"

import {
  useGetRefExchangesQuery,
  useGetRefLinksQuery,
  useUpdateRefLinksMutation,
} from "@/redux/api/referals"

import { cn } from "@/lib/cn"

const PremiumLinks = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation()

  const [modalOpened, setModalOpened] = useState(false)
  const [links, setLinks] = useState<Record<string, string>>({})

  const { data: exchangesData } = useGetRefExchangesQuery()
  const { data: currentLinks, isLoading: isRefLinkLoading } =
    useGetRefLinksQuery({ isGifts: true })
  const [updateLinks, { isLoading: isUpdateLoading }] =
    useUpdateRefLinksMutation()

  const exchanges = useMemo(() => {
    if (!exchangesData) return []

    return exchangesData.filter(
      (el) => el === "PORTALS" || el === "TONNEL" || el === "MRKT",
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
      await updateLinks({ body: links, isGifts: true }).unwrap()
      toast(t("Реферальные ссылки установлены"), {
        className: "justify-center text-center",
      })
      setModalOpened(false)
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
    <Drawer open={modalOpened} onOpenChange={setModalOpened}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="max-h-none outline-none">
        <DrawerHeader className="sr-only">
          <DrawerTitle>{t("Реферальные ссылки")}</DrawerTitle>
          <DrawerDescription>{t("Реферальные ссылки")}</DrawerDescription>
        </DrawerHeader>

        <div
          className={cn(
            "overflow-y-auto px-4",
            Telegram.WebApp.platform === "weba"
              ? "pb-4"
              : "pb-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
          )}
        >
          <h2 className="mt-8 text-center font-tt-hoves-expanded text-2xl font-semibold -tracking-[0.02em] text-white">
            {t("Реферальные ссылки")}
          </h2>

          <div className="my-10 flex flex-col gap-2">
            {exchanges.length > 0 &&
              exchanges.map((exchange) => (
                <label
                  key={exchange}
                  className="flex items-center gap-4 rounded-xl bg-[#17202D] p-2.5 pr-3.5 transition-colors focus-within:bg-[#283649]"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center text-white/50">
                    {exchange === "PORTALS" && <PortalsIcon />}
                    {exchange === "TONNEL" && <TonnelIcon />}
                    {exchange === "MRKT" && (
                      <img
                        src={MRKTIconPNG}
                        className="rounded-md object-cover"
                      />
                    )}
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
          <LargeButton
            appearance="white"
            disabled={isUpdateLoading || isRefLinkLoading || !hasChanges()}
            onClick={handleSubmit}
          >
            {isUpdateLoading ? (
              <Loader className="animate-spin" />
            ) : (
              t("Сохранить")
            )}
          </LargeButton>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default PremiumLinks
