import { useMemo } from "react"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { Description } from "@radix-ui/react-dialog"
import { toast } from "sonner"

import CalendarIcon from "@/assets/icons/calendar.svg?react"
import IdIcon from "@/assets/task-icons/Id.svg?react"
import Loader from "@/assets/icons/loader.svg?react"
import RetrodropIcon from "@/assets/icons/retrodrop.svg?react"
import RefIcon from "@/assets/icons/high-five.svg?react"
import RetrodropLegend from "@/assets/icons/retrodrop-legend.svg?react"

import CryptonImage from "@/assets/retrodrop-images/crypton.png"
import NutcrackerImage from "@/assets/retrodrop-images/nutcracker.png"
import ResearchImage from "@/assets/retrodrop-images/research.png"
import XmasImage from "@/assets/retrodrop-images/xmas.png"
import PrimeImage from "@/assets/images/prime-logo.png"
import CoinPng from "@/assets/images/coin.png"

import RetrodropItem from "./RetrodropItem"

import { LargeButton } from "@/shared/ui/LargeButton"
import { Sheet, SheetContent, SheetHeader } from "@/shared/ui/SideSheet"

import { useClaimDropMutation, useGetDropInfoQuery } from "@/redux/api/farming"
import { useGetCurrentUserQuery } from "@/redux/api/user"

import { numberWithSpaces } from "@/utils/numberWithSpaces"

const list = {
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.15,
    },
  },
  hidden: { opacity: 0 },
}

const RetrodropDialog = ({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const { t } = useTranslation()

  const { data: currentUser } = useGetCurrentUserQuery()
  const { data: drop } = useGetDropInfoQuery(undefined, { skip: !open })
  const [mutate, { isLoading }] = useClaimDropMutation()

  const nutcrackersReward = useMemo(() => {
    let sum = 0

    if (!drop) return sum

    const {
      cryptonRetroDrop: { nutcrackers },
    } = drop

    if (nutcrackers === null) return 0

    for (const entries of Object.entries(nutcrackers)) {
      if (entries[1] !== null) {
        sum += entries[1].tokens
      }
    }

    return sum
  }, [drop])

  if (!drop) return null

  const {
    cryptonRetroDropAmount,
    communityLegend,
    cryptonRetroDrop: {
      accountCreationDateGroup,
      accountFillStatus,
      accountPrizesFromWEB3XMS,
      calendarUser,
      paidReferrals,
      researchUser,
      subscriptions,
    },
  } = drop

  const onClaimClick = async () => {
    if (isLoading) return
    if (currentUser && currentUser.isCryptonRetroDropClaimed) return

    try {
      await mutate().unwrap()
      toast(t("Ретродроп успешно получен"), {
        className: "justify-center",
      })
    } catch (error) {
      // @ts-expect-error RTKQ_NO_ERROR_TYPES
      if (error.originalStatus === 400) {
        toast.error(t("Ошибка"), {
          description: t("Вы уже получали ретродроп"),
        })
      } else {
        toast.error(t("Ошибка"), {
          description: t("Упс, что-то пошло не так"),
        })
      }
    } finally {
      setOpen(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        id="retrodrop-modal"
        className="h-screen gap-0 overflow-y-auto overflow-x-hidden rounded-t-none px-4"
      >
        <Description className="sr-only">Retrodrop modal</Description>
        <SheetHeader
          titleClassName="max-w-[270px] text-center relative text-2xl"
          className="shrink-0"
          headerIcon={
            <RetrodropIcon className="absolute right-10 top-2.5 h-20 w-20 rotate-[24deg]" />
          }
        >
          {t("Ретродроп")}
        </SheetHeader>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={list}
          className="mt-8 flex flex-col gap-2"
        >
          <RetrodropItem
            title={t("Участник NFT-клуба миллионеров")}
            reward={nutcrackersReward}
            isEligible={nutcrackersReward !== 0}
          >
            <img src={NutcrackerImage} alt="Nutcracker logo" className="h-8" />
          </RetrodropItem>
          <RetrodropItem
            title={
              subscriptions === null
                ? t("Трушный криптан-хулиган")
                : subscriptions.primeActiveUserBonus.tokens !== 0 ||
                    subscriptions.primeCurrentActiveUserBonus.tokens !== 0
                  ? t("Трушный криптан-хулиган")
                  : t("Трушный криптан-ветеран")
            }
            reward={
              subscriptions === null
                ? 0
                : subscriptions.primeActiveUserBonus.tokens !== 0 ||
                    subscriptions.primeCurrentActiveUserBonus.tokens !== 0
                  ? subscriptions.primeActiveUserBonus.tokens +
                    subscriptions.primeCurrentActiveUserBonus.tokens
                  : subscriptions.nonSubscribedPrimer.tokens
            }
            isEligible={
              subscriptions === null
                ? false
                : (subscriptions.primeActiveUserBonus.tokens !== 0 &&
                    subscriptions.primeCurrentActiveUserBonus.tokens !== 0) ||
                  subscriptions.nonSubscribedPrimer.tokens !== 0
            }
          >
            <img src={PrimeImage} alt="Prime logo" className="h-8 w-[28px]" />
          </RetrodropItem>
          <RetrodropItem
            title={t("(Я) Календарь приобрету и...")}
            reward={
              subscriptions === null ? 0 : subscriptions.calendar.tokens || 0
            }
            isEligible={
              subscriptions === null
                ? false
                : subscriptions.calendar.tokens !== 0
            }
          >
            <CalendarIcon className="h-8 w-8" />
          </RetrodropItem>
          <RetrodropItem
            title={t("Да, это заявка на жирный дроп")}
            reward={calendarUser === null ? 0 : calendarUser.tokens || 0}
            isEligible={
              calendarUser === null ? false : calendarUser.group !== "0"
            }
          >
            <CalendarIcon className="h-8 w-8" />
          </RetrodropItem>
          <RetrodropItem
            title={t("Прошаренный ресёрчер вышел на след")}
            reward={researchUser === null ? 0 : researchUser.tokens || 0}
            isEligible={
              researchUser === null ? false : researchUser.tokens !== 0
            }
          >
            <img src={ResearchImage} alt="Research logo" className="h-8 w-8" />
          </RetrodropItem>
          <RetrodropItem
            title={
              accountCreationDateGroup === null
                ? t("Обнаружен OLD Crypton ID")
                : accountCreationDateGroup.group === "olds"
                  ? t("Обнаружен OLD Crypton ID")
                  : accountCreationDateGroup.group === "web3xms"
                    ? t("Хо-хо-хо, WEB3 X-MAS на горизонте")
                    : accountCreationDateGroup.group === "nutcrackers"
                      ? t("Залетел в минт-ивент – лови орехи")
                      : accountCreationDateGroup.group === "cals"
                        ? t("Тестил Календарь – получай награды")
                        : t("Обнаружен OLD Crypton ID")
            }
            reward={
              accountCreationDateGroup === null
                ? 0
                : accountCreationDateGroup.tokens || 0
            }
            isEligible={
              accountCreationDateGroup === null
                ? false
                : accountCreationDateGroup.tokens !== 0
            }
          >
            <img src={CryptonImage} alt="Crypton logo" className="h-8" />
          </RetrodropItem>
          <RetrodropItem
            title={t("Рефовод - не ботовод")}
            reward={paidReferrals === null ? 0 : paidReferrals.tokens || 0}
            isEligible={
              paidReferrals === null ? false : paidReferrals.group !== "0refs"
            }
          >
            <RefIcon className="h-8 w-8" />
          </RetrodropItem>
          <RetrodropItem
            title={t("Борец за новогодний Mustang")}
            reward={
              accountPrizesFromWEB3XMS === null
                ? 0
                : accountPrizesFromWEB3XMS.token || 0
            }
            isEligible={
              accountPrizesFromWEB3XMS === null
                ? false
                : accountPrizesFromWEB3XMS.token !== 0
            }
          >
            <img src={XmasImage} alt="Web3xms logo" className="h-8 w-8" />
          </RetrodropItem>
          <RetrodropItem
            title={t("Заполнил ID - монеты получи")}
            reward={
              accountFillStatus === null ? 0 : accountFillStatus.tokens || 0
            }
            isEligible={
              accountFillStatus === null
                ? false
                : accountFillStatus.tokens !== 0
            }
          >
            <IdIcon className="h-8 w-8" />
          </RetrodropItem>
          {communityLegend && (
            <RetrodropItem
              title={t("Легенда сообщества")}
              reward={communityLegend.tokens}
              isSpecial={true}
            >
              <RetrodropLegend className="h-[38px] w-[38px]" />
            </RetrodropItem>
          )}
        </motion.div>
        <div className="mt-8 flex shrink-0 items-center justify-center gap-1.5 text-center font-tt-hoves text-2xl font-semibold -tracking-[0.02em]">
          +{numberWithSpaces(cryptonRetroDropAmount)}{" "}
          <span className="text-[#FED900]">NUTS</span>
          <img src={CoinPng} alt="Nuts coin icon" className="h-6 w-6" />
        </div>
        <LargeButton
          appearance="yellow-linear"
          className="mt-7 shrink-0"
          onClick={onClaimClick}
          disabled={currentUser?.isCryptonRetroDropClaimed}
        >
          {currentUser?.isCryptonRetroDropClaimed ? (
            t("Заклеймлено")
          ) : isLoading ? (
            <Loader className="animate-spin" />
          ) : (
            t("Забрать")
          )}
        </LargeButton>
      </SheetContent>
    </Sheet>
  )
}

export default RetrodropDialog
