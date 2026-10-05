import { Dispatch, SetStateAction, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { initCloudStorage } from "@telegram-apps/sdk"

import {
  Modal,
  ModalContent,
  ModalTitle,
  ModalHeader,
  ModalDescription,
} from "../../shared/Modal"

import StarIcon from "@/assets/games/cryptle/icons/star-icon.svg?react"

import { SkinType } from "@/types/cryptle"

import { setSkin } from "@/redux/slices/games"

import { useGetGameInventoryQuery } from "@/redux/api/games"
import { useGetPaymentItemsQuery } from "@/redux/api/payment"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"

import { cn } from "@/lib/cn"

// @ts-expect-error Not-in-telegram-environment
let cloudStorage

if (import.meta.env.VITE_IS_DEV_LOCAL === undefined) {
  try {
    cloudStorage = initCloudStorage()
  } catch {
    /* empty */
  }
}

interface SkinsSelectModalProps {
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
  handlePremiumSkin: () => void
}

const SkinsSelectModal = ({
  open,
  onOpenChange,
  handlePremiumSkin,
}: SkinsSelectModalProps) => {
  const { t } = useTranslation()

  const dispatch = useAppDispatch()
  // const [currentSkin, setCurrentSkin] = useState<SkinType>("DEFAULT")
  const { skin } = useAppSelector((state) => state.game)

  const { data: gameItems } = useGetGameInventoryQuery()
  const { data: paymentItems } = useGetPaymentItemsQuery({
    type: "GAME_INVENTORY_ITEM",
  })

  const filteredItems = useMemo(() => {
    if (!gameItems) return []

    return gameItems.filter((item) => item.type === "WORDLY_COLOUR")
  }, [gameItems])

  const filteredToPayItems = useMemo(() => {
    if (!paymentItems) return []

    const wordlyColors = paymentItems.filter(
      (item) => item.gameInventoryType === "WORDLY_COLOUR",
    )

    const ownedSkinTitles = filteredItems.map((item) => item.title)

    return wordlyColors.filter((item) => !ownedSkinTitles.includes(item.title))
  }, [paymentItems, filteredItems])

  const selectSkin = async (skin: SkinType) => {
    try {
      if (import.meta.env.VITE_IS_DEV_LOCAL !== undefined) {
        localStorage.setItem("cryptleSkin", skin)
      } else {
        // @ts-expect-error Not-in-telegram-environment
        await cloudStorage.set("cryptleSkin", skin)
      }
      dispatch(setSkin(skin))
    } catch (error) {
      console.error("Failed to save skin:", error)
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="w-[290px] shadow-[#0B0C48]/25 outline-none">
        <ModalTitle className="sr-only">Cryptle select skin modal</ModalTitle>
        <ModalDescription className="sr-only">
          Cryptle select skin modal
        </ModalDescription>

        <ModalHeader className="min-h-20 w-full">{t("Оформление")}</ModalHeader>

        <div className="h-full pb-6 pt-[18px]">
          {/* Rules block */}
          <p className="mb-5 px-6 text-center font-nunito text-sm/4 font-semibold text-[#46319080]/50">
            {t("Выбрать другое оформление игры")}
          </p>
          <div
            style={{
              gridTemplateRows: "repeat(auto-fill, minmax(64px, 64px))",
            }}
            className="grid w-full grid-flow-row grid-cols-3 gap-3 px-8"
          >
            <img
              key="default-skin"
              src="/images/games/skin-defaut.png"
              onClick={() => selectSkin("DEFAULT")}
              className={cn(
                "h-16 w-16 cursor-pointer rounded-xl bg-cover",
                skin === "DEFAULT" &&
                  "outline outline-2 outline-offset-[-2px] outline-[#8C70FA]",
              )}
            />
            {filteredItems.map((item) => {
              if (item.title === "Туманные скалы")
                return (
                  <img
                    key="green-skin"
                    src={item.image}
                    onClick={() => selectSkin("GREEN")}
                    className={cn(
                      "h-16 w-16 cursor-pointer rounded-xl",
                      skin === "GREEN" &&
                        "outline outline-2 outline-offset-[-2px] outline-[#8C70FA]",
                    )}
                  />
                )

              if (item.title === "Ночь в лесу")
                return (
                  <img
                    key="purple-skin"
                    src={item.image}
                    onClick={() => selectSkin("PURPLE")}
                    className={cn(
                      "h-16 w-16 cursor-pointer rounded-xl",
                      skin === "PURPLE" &&
                        "outline outline-2 outline-offset-[-2px] outline-[#8C70FA]",
                    )}
                  />
                )
            })}
            {filteredToPayItems.map((item) => {
              return (
                <div key={item.id} className="relative h-16 w-16">
                  <img
                    src={item.image}
                    onClick={handlePremiumSkin}
                    className={cn("h-16 w-16 cursor-pointer rounded-xl")}
                  />
                  <div className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center rounded-md border-[1px] border-[#F1F5FF] bg-gradient-to-b from-[#F2FEFE] to-[#CCDBF3]">
                    <StarIcon
                      fill="#5B4BB2"
                      className="mx-auto h-[16px] w-[18px] fill-[#5B4BB2] text-[#5B4BB2]"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </ModalContent>
    </Modal>
  )
}

export default SkinsSelectModal
