import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react"

import CardsIcon from "@/assets/games/flip-cards/icons/cards.svg?react"
import CardHeaderIcon from "@/assets/games/flip-cards/icons/card-header.svg?react"

import PackAbout from "./PackAbout"

import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalTitle,
  ModalTrigger,
} from "../shared/Modal"
import RarityLabel from "../shared/RarityLabel"

import { Skeleton } from "@/shared/ui/Skeleton"

import { useGetGameInventoryQuery } from "@/redux/api/games"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import {
  setPackBody,
  setPackBonus,
  setPackId,
  setPackTitle,
} from "@/redux/slices/flip-cards/card-packs"

import { GameInventoryItem } from "@/types/games"

import { cn } from "@/lib/cn"

import { initCloudStorage } from "@telegram-apps/sdk"

// @ts-expect-error Not-in-telegram-environment
let cloudStorage

if (import.meta.env.VITE_IS_DEV_LOCAL === undefined) {
  try {
    cloudStorage = initCloudStorage()
  } catch {
    /* empty */
  }
}

const Packs = ({
  open,
  setOpen,
  children,
}: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  children: React.ReactNode
}) => {
  const { data, isLoading } = useGetGameInventoryQuery()

  const dispatch = useAppDispatch()
  const lang = useAppSelector((state) => state.language.value)
  const selectedPackId = useAppSelector((state) => state.cardPacks.chosenPackId)

  const cardPacks = useMemo(() => {
    if (!data) return null
    if (data.length === 0) return null

    const packs = data.filter((item) => item.type === "CARDS_PACK" && item.pack)

    if (packs.length === 0) return null

    return packs
  }, [data])

  useEffect(() => {
    if (cardPacks === null) return

    const getPackIdFromCloudStorage = async () => {
      if (import.meta.env.VITE_IS_DEV_LOCAL !== undefined) {
        const actualPack = cardPacks.find((pack) => {
          try {
            if (pack.pack !== null) {
              JSON.parse(pack.pack.body)
              return pack
            }
          } catch {
            /* empty */
          }
        })

        if (actualPack) {
          dispatch(setPackId(actualPack.objectId))
          dispatch(
            setPackTitle(
              lang === "RU"
                ? actualPack.pack?.title || ""
                : actualPack.pack?.titleEn || "",
            ),
          )
          dispatch(setPackBonus(actualPack.pack!.bonus))
          dispatch(setPackBody(JSON.parse(actualPack.pack!.body)))
        }
      } else {
        let packId: string | null
        if (Telegram.WebApp.initData) {
          // @ts-expect-error Not-in-telegram-environment
          packId = await cloudStorage.get("flip-cards-pack-id")
        } else {
          packId = localStorage.getItem("flip-cards-pack-id")
        }

        if (packId) {
          const actualPack = cardPacks.find(
            (pack) => pack.objectId === parseInt(packId),
          )

          if (actualPack) {
            dispatch(setPackId(actualPack.objectId))
            dispatch(
              setPackTitle(
                lang === "RU"
                  ? actualPack.pack?.title || ""
                  : actualPack.pack?.titleEn || "",
              ),
            )
            dispatch(setPackBonus(actualPack.pack!.bonus))
            dispatch(setPackBody(JSON.parse(actualPack.pack!.body)))
          } else {
            const actualPack = cardPacks.find((pack) => {
              try {
                if (pack.pack !== null) {
                  JSON.parse(pack.pack.body)
                  return pack
                }
              } catch {
                /* empty */
              }
            })

            if (actualPack) {
              dispatch(setPackId(actualPack.objectId))
              dispatch(
                setPackTitle(
                  lang === "RU"
                    ? actualPack.pack?.title || ""
                    : actualPack.pack?.titleEn || "",
                ),
              )
              dispatch(setPackBonus(actualPack.pack!.bonus))
              dispatch(setPackBody(JSON.parse(actualPack.pack!.body)))
            }
          }
        } else {
          const actualPack = cardPacks.find((pack) => {
            try {
              if (pack.pack !== null) {
                JSON.parse(pack.pack.body)
                return pack
              }
            } catch {
              /* empty */
            }
          })

          if (actualPack) {
            if (Telegram.WebApp.initData) {
              // @ts-expect-error Not-in-telegram-environment
              await cloudStorage.set("flip-cards-pack-id", actualPack.objectId)
            } else {
              localStorage.setItem(
                "flip-cards-pack-id",
                actualPack.objectId.toString(),
              )
            }

            dispatch(setPackId(actualPack.objectId))
            dispatch(
              setPackTitle(
                lang === "RU"
                  ? actualPack.pack?.title || ""
                  : actualPack.pack?.titleEn || "",
              ),
            )
            dispatch(setPackBonus(actualPack.pack!.bonus))
            dispatch(setPackBody(JSON.parse(actualPack.pack!.body)))
          }
        }
      }
    }

    if (selectedPackId === null) {
      getPackIdFromCloudStorage()
    }
  }, [cardPacks])

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalTrigger asChild>{children}</ModalTrigger>
      <ModalContent className="max-h-[85vh] w-[324px] px-4 pt-8">
        <ModalTitle className="sr-only">Meta Packs modal</ModalTitle>
        <ModalDescription className="sr-only">
          Meta Packs modal
        </ModalDescription>

        <div className="absolute left-1/2 top-0 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border border-[#191563] bg-[#533480]">
          <CardsIcon className="h-auto w-10" />
        </div>

        <h2 className="mb-1 bg-gradient-to-b from-[#0F0C5A] to-[#564C9F] bg-clip-text font-days-one text-[30px]/[150%] text-transparent">
          MetaPacks
        </h2>

        <div className="no-scroll max-h-[380px] w-full overflow-y-scroll px-2 pb-8">
          {isLoading ? (
            <Skeleton />
          ) : cardPacks === null ? (
            "Нет паков"
          ) : (
            <div
              className="mt-[70px] grid w-full grid-cols-2 gap-x-3 gap-y-16"
              style={{
                gridTemplateRows: `repeat(${Math.round(cardPacks.length / 2)}, minmax(0, 1fr))`,
              }}
            >
              {cardPacks.map((item, i) => (
                <PackItem key={i} pack={item} />
              ))}
            </div>
          )}
        </div>
      </ModalContent>
    </Modal>
  )
}

export default Packs

const PackItem = ({ pack }: { pack: GameInventoryItem }) => {
  const [open, setOpen] = useState(false)

  const lang = useAppSelector((state) => state.language.value)
  const selectedPackId = useAppSelector((state) => state.cardPacks.chosenPackId)

  const { title, titleEn, description, descriptionEn, image, imageEn, rarity } =
    pack.pack!

  const imgSrc = lang === "RU" ? image : imageEn
  const packTitle = lang === "RU" ? title : titleEn
  const packDescription = lang === "RU" ? description : descriptionEn

  return (
    <PackAbout
      open={open}
      setOpen={setOpen}
      {...pack}
      packTitle={packTitle}
      packDescription={packDescription}
      rarity={rarity}
    >
      <button
        className={cn(
          "relative flex min-h-32 flex-col items-center gap-2 rounded-b-xl border bg-[#BEB4DE]/50 px-2 pb-2 pt-14",
          selectedPackId === pack.objectId
            ? "border-[#382E6D]/75"
            : "border-[#382E6D]/[6%]",
        )}
      >
        <CardHeaderIcon className="absolute -inset-x-0.5 left-1/2 top-0 -translate-x-1/2 -translate-y-[45px]" />
        <img
          className="absolute left-1/2 top-0 h-[42px] w-[42px] -translate-x-1/2 -translate-y-6"
          src={imgSrc}
        />

        <h2 className="line-clamp-1 text-sm/[150%] font-bold text-[#382E6D]">
          {packTitle}
        </h2>
        <p
          className={cn(
            "text-center text-[10px]/[12px] font-medium text-[#382E6D]/80",
            rarity !== "COMMON" && "line-clamp-2",
          )}
        >
          {packDescription}
        </p>

        {rarity !== "COMMON" && <RarityLabel rarity={rarity} />}
      </button>
    </PackAbout>
  )
}
