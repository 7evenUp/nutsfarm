import { SetStateAction, Dispatch, useMemo, useState, useEffect } from "react"
import { Description, Title } from "@radix-ui/react-dialog"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import ArrowLeftIcon from "@/assets/icons/arrow-left.svg?react"
import Loader from "@/assets/icons/loader.svg?react"
import StarIcon from "@/assets/passV2/icons/star.svg?react"
import TonIcon from "@/assets/icons/ton.svg?react"
import StarIconYellow from "@/assets/passV2/icons/yellow-star.svg?react"

import LearnPremiumIcon from "@/assets/drop-icons/learn-premium.svg?react"
import NutspassIcon from "@/assets/drop-icons/nutspass.svg?react"
import NutspassPremiumIcon from "@/assets/drop-icons/nutspass-premium.svg?react"
import GamesIcon from "@/assets/drop-icons/games.svg?react"
import WheelIcon from "@/assets/drop-icons/wheel.svg?react"
import MintNftIcon from "@/assets/drop-icons/mint-nft.svg?react"

import { BUY_CRITERIA_DATE } from "./constants"

import { LargeButton } from "@/shared/ui/LargeButton"
import { Sheet, SheetContent } from "@/shared/ui/SideSheet"

import {
  useGetCriteriaDiscountsQuery,
  useMakeTemplateMutation,
} from "@/redux/api/drop"
import {
  useCommitPaymentMutation,
  useCommitTonPaymentMutation,
  useGetPaymentItemsQuery,
} from "@/redux/api/payment"
import { useAppSelector } from "@/redux/hooks"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

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

const CRITERIA_IDS_TO_ACTION_MAP = {
  course: 1,
  games: 2,
  nft: 3,
  pass: 4,
  passLevel: 5,
  wheels: 6,
}

const targetTime = new Date(BUY_CRITERIA_DATE).getTime()

const BuyCriteriaModal = ({
  open,
  setOpen,
  openPaymentStatus,
  hasAvailableCriteria,
}: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  openPaymentStatus: () => void
  hasAvailableCriteria: boolean
}) => {
  const { t } = useTranslation()

  const [paymentStatus, setPaymentStatus] = useState<
    "cancelled" | "paid" | null
  >(null)
  const [isCommitPaymentLocked, setIsCommitPaymentLocked] = useState(false)
  const [selectedItems, setSelectedItems] = useState<
    { id: number; price: number }[]
  >([])

  const lang = useAppSelector((state) => state.language.value)

  const { data } = useGetCriteriaDiscountsQuery(undefined, {
    skip: !open,
  })
  const { data: paymentItems } = useGetPaymentItemsQuery(undefined, {
    skip: !open,
  })
  const [commitPayment] = useCommitPaymentMutation({
    fixedCacheKey: "buy-criteria",
  })
  const [commitTonPayment] = useCommitTonPaymentMutation()
  const [makeTemplate] = useMakeTemplateMutation()

  const dropItem = useMemo(() => {
    if (!paymentItems) return null

    const neededItem = paymentItems.find(
      (item) => item.type === "DROP_DISCOUNT",
    )

    if (!neededItem) return null

    return neededItem
  }, [paymentItems])

  const totalPrice = useMemo(() => {
    if (!data)
      return {
        withDiscount: 0,
        withoutDiscount: 0,
      }

    const priceWithDiscount = selectedItems.reduce(
      (acc, current) =>
        acc + (current.price - (current.price * data.discountPercent) / 100),
      0,
    )
    const priceWithoutDiscount = selectedItems.reduce(
      (acc, current) => acc + current.price,
      0,
    )

    return {
      withDiscount: priceWithDiscount,
      withoutDiscount: priceWithoutDiscount,
    }
  }, [selectedItems, data])

  const buyDrop = async () => {
    if (isCommitPaymentLocked) return
    if (dropItem === null) return
    if (selectedItems.length === 0) return

    makeHapticFeedback({ notificationOccured: "success" })

    setIsCommitPaymentLocked(true)

    try {
      const templateId = await makeTemplate({
        buyCourse: selectedItems.find(
          (el) => el.id === CRITERIA_IDS_TO_ACTION_MAP.course,
        )
          ? true
          : false,
        buyGames: selectedItems.find(
          (el) => el.id === CRITERIA_IDS_TO_ACTION_MAP.games,
        )
          ? true
          : false,
        buyNftMints: selectedItems.find(
          (el) => el.id === CRITERIA_IDS_TO_ACTION_MAP.nft,
        )
          ? true
          : false,
        buyNutPass: selectedItems.find(
          (el) => el.id === CRITERIA_IDS_TO_ACTION_MAP.pass,
        )
          ? true
          : false,
        buyPassLevel: selectedItems.find(
          (el) => el.id === CRITERIA_IDS_TO_ACTION_MAP.passLevel,
        )
          ? true
          : false,
        buyWheels: selectedItems.find(
          (el) => el.id === CRITERIA_IDS_TO_ACTION_MAP.wheels,
        )
          ? true
          : false,
      }).unwrap()

      if (Telegram.WebApp.initData) {
        const response = await commitPayment({
          id: dropItem.id,
          lang,
          objectId: templateId,
        }).unwrap()

        // @ts-expect-error Not-in-telegram-environment
        const status = await invoice.open(response.paymentFormUrl, "url")
        setPaymentStatus(status)
      } else {
        const response = await commitTonPayment({
          id: dropItem.id,
          lang,
          objectId: templateId,
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

  useEffect(() => {
    if (!data) return

    setSelectedItems([])

    const isValidPrice = (price: number | null) => price !== null && price > 0

    if (!data.hasCourse && data.targetCourse) {
      const price = Telegram.WebApp.initData
        ? data.coursePrice
        : data.coursePriceTon
      if (isValidPrice(price)) {
        setSelectedItems((prev) => [
          ...prev,
          {
            id: CRITERIA_IDS_TO_ACTION_MAP.course,
            price: price!,
          },
        ])
      }
    }

    if (!data.hasNutPass && data.targetNutPass) {
      const price = Telegram.WebApp.initData
        ? data.nutPassPrice
        : data.nutPassPriceTon
      if (isValidPrice(price)) {
        setSelectedItems((prev) => [
          ...prev,
          {
            id: CRITERIA_IDS_TO_ACTION_MAP.pass,
            price: price!,
          },
        ])
      }
    }

    if (
      data.targetPassLevel
        ? data.passLevelUpper === null
          ? true
          : data.nowPassLevels <= data.passLevelUpper
        : false
    ) {
      const price = Telegram.WebApp.initData
        ? data.passLevelPrice
        : data.passLevelPriceTon
      if (isValidPrice(price)) {
        setSelectedItems((prev) => [
          ...prev,
          {
            id: CRITERIA_IDS_TO_ACTION_MAP.passLevel,
            price: price!,
          },
        ])
      }
    }

    if (
      data.targetGames
        ? data.totalGamesUpper === null
          ? true
          : data.nowGames <= data.totalGamesUpper
        : false
    ) {
      const price = Telegram.WebApp.initData
        ? data.gamesPrice
        : data.gamesPriceTon
      if (isValidPrice(price)) {
        setSelectedItems((prev) => [
          ...prev,
          {
            id: CRITERIA_IDS_TO_ACTION_MAP.games,
            price: price!,
          },
        ])
      }
    }

    if (data.targetWheels !== null) {
      const price = Telegram.WebApp.initData
        ? data.wheelsPrice
        : data.wheelsPriceTon
      if (isValidPrice(price)) {
        setSelectedItems((prev) => [
          ...prev,
          {
            id: CRITERIA_IDS_TO_ACTION_MAP.wheels,
            price: price!,
          },
        ])
      }
    }

    if (data.targetNftMints !== null) {
      const price = Telegram.WebApp.initData
        ? data.nftMintsPrice
        : data.nftMintsPriceTon
      if (isValidPrice(price)) {
        setSelectedItems((prev) => [
          ...prev,
          {
            id: CRITERIA_IDS_TO_ACTION_MAP.nft,
            price: price!,
          },
        ])
      }
    }
  }, [data])

  useEffect(() => {
    if (paymentStatus === null) return

    if (paymentStatus === "cancelled") {
      setPaymentStatus(null)
      return
    }

    if (paymentStatus === "paid") {
      setPaymentStatus(null)
      openPaymentStatus()
      return
    }
  }, [paymentStatus])

  if (Date.now() >= targetTime) return null

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        className={cn(
          "h-screen gap-0 overflow-y-auto overflow-x-hidden rounded-t-none px-4",
          Telegram.WebApp.platform === "weba"
            ? "pb-4"
            : "pb-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
        )}
      >
        <Title className="sr-only">Buy Criteria Modal</Title>
        <Description className="sr-only">Buy Criteria Modal</Description>

        <button
          className="flex items-center gap-2 text-sm font-semibold opacity-70 transition-opacity focus:outline-none active:opacity-100"
          onClick={() => {
            setOpen(false)
          }}
        >
          <ArrowLeftIcon />
          {t("Назад")}
        </button>

        <h2 className="mt-4 flex flex-col items-center gap-2.5 font-tt-hoves-expanded text-xl font-semibold text-white">
          {t("Покупка критериев")}
        </h2>

        {!data ? (
          <Loader className="my-auto size-32 animate-spin self-center" />
        ) : (
          <div className="my-10 flex flex-col gap-2 pb-16">
            <CriteriaItem
              id={CRITERIA_IDS_TO_ACTION_MAP.course}
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
              icon={<LearnPremiumIcon />}
              title={t("Платный курс")}
              starsPrice={data.coursePrice}
              tonPrice={data.coursePriceTon}
              needToShow={!data.hasCourse && data.targetCourse}
            />
            <CriteriaItem
              id={CRITERIA_IDS_TO_ACTION_MAP.pass}
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
              icon={<NutspassPremiumIcon />}
              title="Nuts Pass Premium"
              starsPrice={data.nutPassPrice}
              tonPrice={data.nutPassPriceTon}
              needToShow={!data.hasNutPass && data.targetNutPass}
            />
            <CriteriaItem
              id={CRITERIA_IDS_TO_ACTION_MAP.passLevel}
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
              icon={<NutspassIcon />}
              title="Nuts Pass"
              starsPrice={data.passLevelPrice}
              tonPrice={data.passLevelPriceTon}
              description={
                (
                  data.targetPassLevel
                    ? data.passLevelUpper === null
                      ? true
                      : data.nowPassLevels <= data.passLevelUpper
                    : false
                )
                  ? t("уровня", {
                      count: data.targetPassLevel || 0,
                    })
                  : undefined
              }
              needToShow={
                data.targetPassLevel
                  ? data.passLevelUpper === null
                    ? true
                    : data.nowPassLevels <= data.passLevelUpper
                  : false
              }
            />
            <CriteriaItem
              id={CRITERIA_IDS_TO_ACTION_MAP.games}
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
              icon={<GamesIcon />}
              title={t("Игры")}
              starsPrice={data.gamesPrice}
              tonPrice={data.gamesPriceTon}
              description={
                (
                  data.targetGames
                    ? data.totalGamesUpper === null
                      ? true
                      : data.nowGames <= data.totalGamesUpper
                    : false
                )
                  ? t("игр", {
                      count: data.targetGames || 0,
                    })
                  : undefined
              }
              needToShow={
                data.targetGames
                  ? data.totalGamesUpper === null
                    ? true
                    : data.nowGames <= data.totalGamesUpper
                  : false
              }
            />
            <CriteriaItem
              id={CRITERIA_IDS_TO_ACTION_MAP.wheels}
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
              icon={<WheelIcon />}
              title="Lucky Wheel"
              starsPrice={data.wheelsPrice}
              tonPrice={data.wheelsPriceTon}
              description={
                data.targetWheels !== null
                  ? t("прокруток", {
                      count: data.targetWheels,
                    })
                  : undefined
              }
              needToShow={data.targetWheels !== null}
            />
            <CriteriaItem
              id={CRITERIA_IDS_TO_ACTION_MAP.nft}
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
              icon={<MintNftIcon />}
              title={t("Минты NFT")}
              starsPrice={data.nftMintsPrice}
              tonPrice={data.nftMintsPriceTon}
              description={
                data.targetNftMints !== null
                  ? t("минтов", {
                      count: data.targetNftMints,
                    })
                  : undefined
              }
              needToShow={data.targetNftMints !== null}
            />
          </div>
        )}

        <div className="pointer-events-none fixed inset-0 bottom-0 top-auto z-10 h-40 bg-gradient-to-b from-[#544871]/0 to-[#050D12]" />

        <div
          className={cn(
            "fixed left-1/2 z-20 w-full max-w-2xl -translate-x-1/2 px-3.5",
            Telegram.WebApp.platform === "weba"
              ? "bottom-4"
              : "bottom-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
          )}
        >
          <LargeButton
            appearance="white"
            contentClassName="gap-0"
            onClick={buyDrop}
            className="relative mt-2"
            disabled={
              !data ||
              isCommitPaymentLocked ||
              selectedItems.length === 0 ||
              !hasAvailableCriteria
            }
          >
            {!data || isCommitPaymentLocked ? (
              <Loader className="animate-spin" />
            ) : !hasAvailableCriteria ? (
              t("Все категории достигнуты")
            ) : selectedItems.length === 0 ? (
              t("Выберите категории")
            ) : (
              <>
                {t("Приобрести за")}
                {Telegram.WebApp.initData ? (
                  <>
                    <StarIcon className="ml-1.5 mr-1 h-auto w-5 text-inherit" />
                    <span>{Math.floor(totalPrice.withDiscount)}</span>
                    <span className="ml-1 scale-95 line-through opacity-50">
                      {totalPrice.withoutDiscount}
                    </span>
                  </>
                ) : (
                  <>
                    <TonIcon className="ml-1.5 mr-1 h-auto w-5 text-inherit" />
                    <span>{totalPrice.withDiscount.toFixed(2)}</span>
                    <span className="ml-1 scale-95 line-through opacity-50">
                      {totalPrice.withoutDiscount.toFixed(2)}
                    </span>
                  </>
                )}
              </>
            )}
          </LargeButton>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default BuyCriteriaModal

const CriteriaItem = ({
  id,
  icon,
  title,
  starsPrice,
  tonPrice,
  description,
  needToShow,
  selectedItems,
  setSelectedItems,
}: {
  id: number
  icon: React.ReactNode
  title: string
  starsPrice: number
  tonPrice: number
  description?: string
  needToShow: boolean
  selectedItems: { id: number; price: number }[]
  setSelectedItems: Dispatch<
    SetStateAction<
      {
        id: number
        price: number
      }[]
    >
  >
}) => {
  const { data } = useGetCriteriaDiscountsQuery()

  if (!data) return null
  if (!needToShow) return null

  const currentPrice = Telegram.WebApp.initData ? starsPrice : tonPrice
  if (currentPrice === null || currentPrice <= 0) return null

  return (
    <button
      className={cn(
        "flex flex-col gap-2 rounded-xl border p-3",
        selectedItems.find((el) => el.id === id)
          ? "border-[#283649] bg-[#152131]"
          : "border-transparent bg-[#0F1824] opacity-75",
      )}
      onClick={() => {
        const index = selectedItems.findIndex((el) => el.id === id)
        const price = Telegram.WebApp.initData ? starsPrice : tonPrice

        if (index >= 0) {
          setSelectedItems((prev) => [
            ...prev.slice(0, index),
            ...prev.slice(index + 1),
          ])
        } else {
          if (price !== null && price > 0) {
            setSelectedItems((prev) => [...prev, { id, price }])
          }
        }
      }}
    >
      <div className="flex w-full items-center gap-2">
        <div className="flex size-7 items-center justify-center">{icon}</div>
        <p className="font-tt-hoves-expanded text-base font-medium text-white">
          {title}
        </p>
        <div
          className={cn(
            "ml-auto flex h-[35px] min-w-[70px] items-center justify-center gap-[5px] rounded-lg px-2 ring-1 ring-[#121A2A]/10",
            Telegram.WebApp.initData ? "bg-[#F2DD22]/10" : "bg-[#0098EA]/10",
          )}
        >
          {Telegram.WebApp.initData ? (
            <>
              <StarIconYellow className="h-3 w-3.5 shrink-0" />
              <span className="font-tt-hoves-expanded text-sm/[13px] font-medium text-[#FEEB1D]">
                {Math.floor(
                  starsPrice - (starsPrice * data.discountPercent) / 100,
                )}
              </span>
              <span className="font-tt-hoves-expanded text-xs/[13px] font-medium text-[#FEEB1D]/50 line-through">
                {Math.floor(starsPrice)}
              </span>
            </>
          ) : (
            <>
              <TonIcon className="h-3 w-3.5 shrink-0 text-[#0098EA]" />
              <span>
                {(tonPrice - (tonPrice * data.discountPercent) / 100).toFixed(
                  2,
                )}
              </span>
              <span className="ml-1 scale-95 line-through opacity-50">
                {tonPrice.toFixed(2)}
              </span>
            </>
          )}
        </div>
      </div>
      {description && (
        <div className="flex items-center gap-2">
          <div className="size-7" />
          <span className="text-sm font-semibold">{description}</span>
        </div>
      )}
    </button>
  )
}
