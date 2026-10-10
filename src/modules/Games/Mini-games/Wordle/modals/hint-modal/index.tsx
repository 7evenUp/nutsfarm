import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

// import GlassIcon from "./GlassIcon"
import Loader from "@/assets/icons/loader.svg?react"
import StarIcon from "@/assets/games/cryptle/icons/star-icon.svg?react"
import HintIcon from "@/assets/games/cryptle/icons/hint-icon.svg?react"

import {
  Modal,
  ModalContent,
  ModalTitle,
  ModalHeader,
  ModalDescription,
  ModalTrigger,
} from "../../shared/Modal"

import { useAppSelector } from "@/redux/hooks"
import {
  useCommitPaymentMutation,
  useGetPaymentItemsQuery,
} from "@/redux/api/payment"

import { SkinType } from "@/types/cryptle"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

import { cn } from "@/lib/cn"

import { initInvoice } from "@/demo/telegram-sdk"

import HintPaymentStatus from "./HintPaymentStatus"

// @ts-expect-error Not-in-telegram-environment
let invoice

if (true) {
  try {
    invoice = initInvoice()
  } catch {
    /* empty */
  }
}

interface SkinsSelectModalProps {
  description: string
  targetWord: string
  theme: SkinType
}

type HintItem =
  | "description"
  | "letter_1"
  | "letter_2"
  | "letter_3"
  | "letter_4"
  | "letter_5"
  | null

const HINT_PRICE_MAP = {
  description: 30,
  letter_1: 35,
  letter_2: 25,
  letter_3: 25,
  letter_4: 25,
  letter_5: 10,
}

const HintModal = ({
  description,
  targetWord,
  // theme,
}: SkinsSelectModalProps) => {
  const { t } = useTranslation()

  const lang = useAppSelector((state) => state.language.value)

  const [buyTarget, setBuyTarget] = useState<"letter" | "description" | null>(
    null,
  )
  const [tryies, setTryies] = useState<number | null>(null)

  const [currentInvoiceHint, setCurrentInvoiceHint] = useState<HintItem>(null)
  const [paymentStatusOpen, setPaymentStatusOpen] = useState<boolean>(false)
  const [paymentStatus, setPaymentStatus] = useState<
    "cancelled" | "paid" | null
  >(null)

  const [paidHints, setPaidHints] = useState({
    description: false,
    letter_1: false,
    letter_2: false,
    letter_3: false,
    letter_4: false,
    letter_5: false,
  })

  const { data: paymentItems } = useGetPaymentItemsQuery(undefined, {
    skip: !open,
  })
  const [isCommitPaymentLocked, setIsCommitPaymentLocked] = useState(false)
  const [commitPayment, { reset }] = useCommitPaymentMutation({
    fixedCacheKey: "buy-hint-payment",
  })

  const hintItem = useMemo(() => {
    if (!paymentItems) return null

    const neededItem = paymentItems.find((item) => item.type === "GAME_HELP")

    if (!neededItem) return null

    return neededItem
  }, [paymentItems])

  // Ответ от ТМА
  useEffect(() => {
    if (paymentStatus === null) return

    if (paymentStatus === "cancelled") {
      setPaymentStatus(null)
      return
    }

    // Если ТМА говорит, что оплачено - идём на бекенд удостовериться в этом
    if (paymentStatus === "paid") {
      setPaymentStatus(null)
      setPaymentStatusOpen(true)
      return
    }
  }, [paymentStatus])

  const buyHint = async (selectedItem: HintItem) => {
    if (isCommitPaymentLocked) return
    if (hintItem === null) return
    if (selectedItem === null) return

    if (selectedItem.includes("letter")) setBuyTarget("letter")
    else setBuyTarget("description")

    makeHapticFeedback({ notificationOccured: "success" })

    setIsCommitPaymentLocked(true)

    try {
      const response = await commitPayment({
        id: hintItem.id,
        lang,
        quantity: HINT_PRICE_MAP[selectedItem],
      }).unwrap()

      // @ts-expect-error Not-in-telegram-environment
      const status = await invoice.open(response.paymentFormUrl, "url")
      setPaymentStatus(status)
      setCurrentInvoiceHint(selectedItem)
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
      setBuyTarget(null)
    }
  }

  const handlePaymentSuccess = (hint: HintItem) => {
    if (hint === null) return

    setPaidHints((prev) => ({ ...prev, [hint]: true }))
    setCurrentInvoiceHint(null)
    reset()
  }

  const handlePaymentFailed = () => {
    setCurrentInvoiceHint(null)
    reset()
  }

  const onButtonClick = async () => {
    const hintItem = `letter_${tryies}` as HintItem

    buyHint(hintItem)

    setTryies(null)
  }

  const isLoadingState = (target: "letter" | "description") => {
    return isCommitPaymentLocked && buyTarget === target
  }

  return (
    <Modal>
      <ModalTrigger>
        <HintIcon className="animate-shake size-[30px] drop-shadow-[0px_2px_3px_rgba(254,245,162,0.5)]" />
        {/* <div
          className={cn(
            "flex h-[30px] w-[30px] items-center justify-center rounded-lg border-[1px] bg-gradient-to-b transition-opacity active:opacity-80",
            theme === "GREEN" && "border-[#15351B] from-[#49724A] to-[#28563C]",
            theme === "PURPLE" &&
              "border-[#301F49] from-[#9161C7] via-[#653B95] to-[#3A1D5D]",
            theme === "DEFAULT" &&
              "border-[#3A2485] from-[#795ADC] to-[#382383]",
          )}
        >
          <GlassIcon
            color={
              theme === "GREEN"
                ? "#B4C79F"
                : theme === "PURPLE"
                  ? "#CAA3F7"
                  : theme === "DEFAULT"
                    ? "#8F74FB"
                    : undefined
            }
          />
        </div> */}
      </ModalTrigger>
      <ModalContent className="w-[290px] shadow-[#0B0C48]/25 outline-none">
        <ModalTitle className="sr-only">Hints modal</ModalTitle>
        <ModalDescription className="sr-only">Hints modal</ModalDescription>

        <ModalHeader className="w-full">{t("Подсказки")}</ModalHeader>

        <div className="h-full px-4 pb-4 pt-6">
          <p className="mb-6 px-0 text-center font-nunito text-sm/4 font-semibold text-[#46319080]/50">
            {t("Возникли трудности? Возьми подсказку!")}
          </p>
          <div className="flex flex-col">
            {paidHints.description ? (
              <div className="flex flex-col items-center gap-2.5 rounded-lg bg-gradient-to-b from-[#7F60E5]/90 to-[#573DAE]/90 p-1.5">
                <h2 className="font-nunito text-sm/4 font-bold text-white">
                  {t("Описание слова")}
                </h2>
                <p className="text-balance text-center text-sm/4 text-white/90">
                  {description}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2.5 rounded-lg px-1">
                <h2 className="font-nunito text-sm/4 font-bold text-[#463190BF]/75">
                  {t("Получить описание слова")}
                </h2>
                <button
                  className="flex h-9 w-full flex-row items-center justify-center rounded-md border border-[#7D6ABA33]/20 bg-gradient-to-r from-[#D5D7FF] to-[#E0E7FE] px-2.5 py-1 text-sm/4 font-bold text-[#2F2852] shadow-[0_1px_0_rgba(125,106,186,0.25)] active:translate-y-0.5 active:shadow-none"
                  onClick={() => buyHint("description")}
                  disabled={isLoadingState("description")}
                >
                  {isCommitPaymentLocked && buyTarget === "description" ? (
                    <Loader className="animate-spin" />
                  ) : (
                    <>
                      {t("Приобрести за")}
                      <StarIcon className="mx-1 h-4 w-4" />
                      {HINT_PRICE_MAP.description}
                    </>
                  )}
                </button>
              </div>
            )}

            <p className="mb-5 mt-7 text-balance px-6 text-center font-nunito text-sm/4 font-bold text-[#463190BF]/75">
              {t(
                "Достаточно узнать одну или пару букв? Выбери ту, что нужна 😉",
              )}
            </p>

            <div className="mb-4 flex justify-center gap-2.5">
              {Array(5)
                .fill(null)
                .map((_, index) => {
                  const letterKey =
                    `letter_${index + 1}` as keyof typeof paidHints
                  const isPurchased = paidHints[letterKey]

                  if (isPurchased)
                    return (
                      <motion.div
                        key={`hard${index}`}
                        animate={{
                          rotateY: [0, 90, 0],
                        }}
                        transition={{
                          duration: 0.4,
                          ease: "easeInOut",
                        }}
                      >
                        <button
                          key={`hard${index}`}
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-b from-[#C5FF0D] to-[#8FF605] shadow-[0_1px_0_rgba(91,87,179,0.30)]",
                          )}
                        >
                          <span
                            className={cn(
                              "bg-gradient-to-b from-[#3AAA02] to-[#1A6C0E] bg-clip-text font-nunito text-2xl font-black text-transparent",
                              index + 1 === tryies &&
                                "from-[#7B5BDE] to-[#260D7E]",
                            )}
                          >
                            {targetWord[index]}
                          </span>
                        </button>
                      </motion.div>
                    )

                  return (
                    <button
                      key={`hard${index}`}
                      onClick={() => {
                        if (index + 1 === tryies) setTryies(null)
                        else setTryies(index + 1)
                      }}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-b from-[#DEEAFF] to-[#EFF4FF] shadow-[0_1px_0_rgba(91,87,179,0.30)]",
                        index + 1 === tryies && "from-[#E2EBFE] to-[#D3D5FF]",
                      )}
                    >
                      <span
                        className={cn(
                          "bg-gradient-to-b from-[#A3C0F3] to-[#CEDFFC] bg-clip-text font-nunito text-2xl font-black text-transparent",
                          index + 1 === tryies && "from-[#7B5BDE] to-[#260D7E]",
                        )}
                      >
                        {index + 1}
                      </span>
                    </button>
                  )
                })}
            </div>

            <button
              className="flex h-9 w-full flex-row items-center justify-center rounded-md border border-[#7D6ABA33]/20 bg-gradient-to-r from-[#D5D7FF] to-[#E0E7FE] px-2.5 py-1 text-sm/4 font-bold text-[#2F2852] shadow-[0_1px_0_rgba(125,106,186,0.25)] active:translate-y-0.5 active:shadow-none"
              onClick={onButtonClick}
              disabled={!tryies || isLoadingState("letter")}
            >
              {isCommitPaymentLocked && buyTarget === "letter" ? (
                <Loader className="animate-spin" />
              ) : !tryies ? (
                t("Выбери букву")
              ) : (
                <>
                  {t("Приобрести за")}
                  <StarIcon className="mx-1 h-4 w-4" />
                  {HINT_PRICE_MAP[`letter_${tryies}` as keyof typeof paidHints]}
                </>
              )}
            </button>
          </div>
        </div>

        <HintPaymentStatus
          open={paymentStatusOpen}
          setOpen={setPaymentStatusOpen}
          currentHint={currentInvoiceHint}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentFailed={handlePaymentFailed}
        />
      </ModalContent>
    </Modal>
  )
}

export default HintModal
