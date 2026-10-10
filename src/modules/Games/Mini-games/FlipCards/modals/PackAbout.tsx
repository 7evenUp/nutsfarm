import { Dispatch, SetStateAction } from "react"
import { useTranslation } from "react-i18next"

import ShareIcon from "@/assets/games/flip-cards/icons/share-icon.svg?react"

import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalTitle,
  ModalTrigger,
} from "../shared/Modal"
import RarityLabel from "../shared/RarityLabel"

import GameButton from "@/modules/Games/components/GameButton"

import { openLinkWithTelegram } from "@/utils/openLink"

import { CardsPackBody, GameInventoryItem } from "@/types/games"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import {
  setPackBody,
  setPackBonus,
  setPackId,
  setPackTitle,
} from "@/redux/slices/flip-cards/card-packs"

import { cn } from "@/lib/cn"

import { initCloudStorage } from "@/demo/telegram-sdk"

// @ts-expect-error Not-in-telegram-environment
let cloudStorage

if (true) {
  try {
    cloudStorage = initCloudStorage()
  } catch {
    /* empty */
  }
}

const PackAbout = ({
  open,
  setOpen,
  children,
  packTitle,
  packDescription,
  rarity,
  pack,
  objectId,
}: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  children: React.ReactNode
  packTitle: string
  packDescription: string
  rarity: string
} & GameInventoryItem) => {
  const { t } = useTranslation()

  const dispatch = useAppDispatch()
  const selectedPackId = useAppSelector((state) => state.cardPacks.chosenPackId)

  if (pack === null) return

  const body: CardsPackBody[] = JSON.parse(pack.body)

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalTrigger asChild>{children}</ModalTrigger>
      <ModalContent className="w-80 px-6 pb-[18px] pt-10">
        <ModalTitle className="sr-only">{packTitle}</ModalTitle>
        <ModalDescription className="sr-only">
          {packDescription}
        </ModalDescription>

        {rarity !== "COMMON" && (
          <RarityLabel className="absolute right-3 top-3" rarity={rarity} />
        )}

        <h2 className="mb-1.5 line-clamp-1 bg-gradient-to-b from-[#0F0C5A] to-[#564C9F] bg-clip-text text-center font-days-one text-[30px]/[150%] text-transparent">
          {packTitle}
        </h2>

        <p className="text-center text-xs/none font-medium text-[#382E6D]/80">
          {packDescription}
        </p>

        {Array.isArray(body) && (
          <div className="no-scroll mt-3 flex max-h-[240px] w-full flex-col divide-y divide-[#867FAC]/20 overflow-y-scroll py-3 [mask-image:linear-gradient(to_bottom,transparent,red_12%,red_88%,transparent)]">
            {body.map((item) => (
              <PackItem key={item.title + item.description} {...item} />
            ))}
          </div>
        )}

        <p className="mb-4 mt-6 text-center text-xs/none font-medium text-[#382E6D]/80">
          {t("Множитель наград за игру с этим паком")}{" "}
          <span className="font-bold text-[#382E6D]">x{pack.bonus}</span>
        </p>

        <GameButton
          appearance="flip-cards"
          className="h-10 items-center px-6"
          onClick={async () => {
            if (Telegram.WebApp.initData) {
              // @ts-expect-error Not-in-telegram-environment
              await cloudStorage.set("flip-cards-pack-id", objectId)
            } else {
              localStorage.setItem("flip-cards-pack-id", objectId.toString())
            }
            dispatch(setPackId(objectId))
            dispatch(setPackTitle(packTitle))
            dispatch(setPackBody(body))
            dispatch(setPackBonus(pack.bonus))
          }}
          disabled={selectedPackId === objectId}
        >
          {selectedPackId === objectId
            ? t("Пак уже выбран")
            : t("Играть с этим набором")}
        </GameButton>
      </ModalContent>
    </Modal>
  )
}

export default PackAbout

const PackItem = ({
  title,
  description,
  titleEn,
  descriptionEn,
  link,
  img,
}: CardsPackBody) => {
  const lang = useAppSelector((state) => state.language.value)

  const packTitle = lang === "RU" ? title : titleEn
  const packDescription = lang === "RU" ? description : descriptionEn

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
          alt={packTitle}
          className="h-full w-full rounded-[7px] object-contain"
        />
      </div>
      <div className="ml-2 mr-5 flex flex-col gap-1">
        <h3 className="text-left text-xs/[14px] font-bold text-[#382E6D]">
          {packTitle}
        </h3>
        <p className="line-clamp-2 text-left text-[10px]/[11px] font-semibold text-[#382E6D]/50">
          {packDescription}
        </p>
      </div>
      {link && <ShareIcon className="ml-auto shrink-0 self-start" />}
    </button>
  )
}
