import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { Description } from "@radix-ui/react-dialog"
import { useEffect, useState } from "react"

import CoinPng from "@/assets/images/coin.png"
import AnimationGif from "@/assets/gif/Bonus.gif"
import LoaderIcon from "@/assets/icons/loader.svg?react"

import {
  DialogModal,
  DialogModalContent,
  DialogModalHeader,
} from "@/shared/ui/DialogModal"
import { LargeButton } from "@/shared/ui/LargeButton"

import { useClaimStartBonusMutation } from "@/redux/api/farming"
import {
  useClaimStreakMutation,
  useGetCurrentStreakQuery,
} from "@/redux/api/streak"

import { numberWithSpaces } from "@/utils/numberWithSpaces"
import { sendMetrika } from "@/utils/sendMetrika"

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

const Onboarding = ({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const { t } = useTranslation()

  const [finallyOpen, setFinallyOpen] = useState(false)
  const [claimLocked, setClaimLocked] = useState(false)

  const [mutate] = useClaimStartBonusMutation()
  const [claimStreak] = useClaimStreakMutation()
  const { refetch: refetchStreak } = useGetCurrentStreakQuery({
    timezone,
  })

  useEffect(() => {
    if (open) {
      const cacheContent = async () => {
        const promise = new Promise((resolve, reject) => {
          const img = new Image()
          img.src = AnimationGif
          img.onload = resolve
          img.onerror = reject
        })
        await promise

        setFinallyOpen(true)
      }

      cacheContent()
    } else {
      setFinallyOpen(false)
    }
  }, [open])

  const claimStartBonus = async () => {
    if (claimLocked) return

    setClaimLocked(true)

    try {
      // Клеймим стрик за первый день
      await claimStreak({ timezone, payForFreeze: true }).unwrap()
      refetchStreak()
    } catch {
      /* empty */
    }

    try {
      // Клеймим стартовый бонус
      const points = await mutate().unwrap()

      sendMetrika("greeting_bonus_claim")

      toast(
        <div className="flex flex-wrap items-center font-bold">
          <img
            src={CoinPng}
            alt="Nuts coin icon"
            className="mr-2.5 h-10 w-10"
          />
          <span className="text-[#FED900]">
            +{numberWithSpaces(points)} NUTS
          </span>
        </div>,
        {
          className: "justify-center",
        },
      )
    } catch {
      toast.error(t("Ошибка"), {
        description: t("Вы уже получали приветственный бонус"),
      })
    } finally {
      setOpen(false)
    }
  }

  return (
    <DialogModal open={finallyOpen} onOpenChange={setOpen}>
      <DialogModalContent className="h-[405px] w-[310px] items-center gap-0 px-[18px] pb-[18px] pt-6">
        <Description className="sr-only">Welcome bonus modal</Description>
        <DialogModalHeader className="font-semibold transition-all duration-300 animate-in fade-in-0 slide-in-from-top-10">
          {t("Добро пожаловать!")}
        </DialogModalHeader>

        <span className="mt-5 w-[215px] text-center text-sm/5 transition-all duration-500 animate-in fade-in-0 slide-in-from-top-10">
          {t("Скорее забирай приветственный бонус :)")}
        </span>

        <img
          src={AnimationGif}
          alt="Gif animation when coin is appearing on the screen"
          className="h-44 w-44"
        />

        <span className="-mt-2 text-2xl font-bold transition-all duration-700 animate-in fade-in-0 slide-in-from-top-10">
          +1337 NUTS
        </span>
        <LargeButton
          appearance="yellow-linear"
          className="mt-auto shrink-0 transition-all duration-1000 animate-in fade-in-0 slide-in-from-top-10"
          contentClassName="rounded-lg gap-2"
          shadowClassName="rounded-lg"
          onClick={claimStartBonus}
          disabled={claimLocked}
        >
          {claimLocked ? (
            <LoaderIcon className="h-4 w-4 animate-spin" />
          ) : (
            t("Забрать")
          )}
        </LargeButton>
      </DialogModalContent>
    </DialogModal>
  )
}

export default Onboarding
