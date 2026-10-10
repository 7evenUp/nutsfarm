import { useEffect, useLayoutEffect, useMemo, useState } from "react"
import { Description } from "@radix-ui/react-dialog"
import * as Collapsible from "@radix-ui/react-collapsible"
import { useTranslation } from "react-i18next"

import CheckIcon from "@/assets/drop-icons/check-icon.svg?react"
import LearnIcon from "@/assets/drop-icons/learn.svg?react"
import NutspassIcon from "@/assets/drop-icons/nutspass.svg?react"
import FireIcon from "@/assets/drop-icons/fire.svg?react"
import DonateIcon from "@/assets/drop-icons/donate.svg?react"
import AchievementsIcon from "@/assets/drop-icons/achievements.svg?react"
import LeaderboardIcon from "@/assets/drop-icons/leaderboard.svg?react"
import GamesIcon from "@/assets/drop-icons/games.svg?react"
import WheelIcon from "@/assets/drop-icons/wheel.svg?react"
import NutcrackerIcon from "@/assets/drop-icons/nutcrackers.svg?react"
import TasksIcon from "@/assets/drop-icons/tasks.svg?react"
import MintNftIcon from "@/assets/drop-icons/mint-nft.svg?react"
import NutsDashPNG from "@/assets/drop-icons/nuts-dash.png"
import PeopleIcon from "@/assets/drop-icons/people.svg?react"
import ChevronDown from "@/assets/icons/chevron-down.svg?react"

import { BUY_CRITERIA_DATE } from "./constants"

import Countdown from "./Countdown"
import BuyCriteriaModal from "./BuyCriteriaModal"
import BuyCriteriaPaymentStatus from "./BuyCriteriaPaymentStatus"

import BuyLevels from "@/modules/NutsPassV2/modals/buy-levels"
import BuyLevelsPaymentStatus from "@/modules/NutsPassV2/modals/BuyLevelsPaymentStatus"

import { LargeButton } from "@/shared/ui/LargeButton"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/shared/ui/SideSheet"
import { Skeleton } from "@/shared/ui/Skeleton"
import { Button } from "@/shared/ui/Button"

import {
  useGetCriteriaDiscountsQuery,
  useGetDropCriteriaQuery,
  useGetDropProgressQuery,
} from "@/redux/api/drop"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { setIsBuyLevelOpened } from "@/redux/slices/passv2"

import { numberWithSpaces } from "@/utils/numberWithSpaces"

import { DropCriteria, UserDropCriteriaProgress } from "@/types/drop"

import { cn } from "@/lib/cn"

import {
  BackButton,
  initBackButton,
  RemoveEventListenerFn,
} from "@/demo/telegram-sdk"
import { getDays, getHours } from "@/utils/date"

let backButton: BackButton

if (true) {
  try {
    const [initializedBackButton] = initBackButton()
    backButton = initializedBackButton
  } catch {
    /* empty */
  }
}

const targetTime = new Date(BUY_CRITERIA_DATE).getTime()

const DropModal = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)
  const [criteriaOpened, setCriteriaOpened] = useState(false)
  const [paymentStatusOpen, setPaymentStatusOpen] = useState(false)

  const { data: discountsData } = useGetCriteriaDiscountsQuery(undefined, {
    skip: !open,
  })
  const { data: dropCriteria } = useGetDropCriteriaQuery(undefined, {
    skip: !open,
  })
  const { data: dropProgress } = useGetDropProgressQuery(undefined, {
    skip: !open,
  })

  useEffect(() => {
    if (!backButton) return

    let rmListener: RemoveEventListenerFn
    if (open) {
      backButton.show()
      rmListener = backButton.on("click", () => {
        setOpen(false)
      })
    } else {
      backButton.hide()
    }

    return () => {
      if (rmListener) {
        rmListener()
      }
    }
  }, [open])

  useLayoutEffect(() => {
    const { start_param } = Telegram.WebApp.initDataUnsafe

    if (!start_param) return

    const openCriteriaParam = start_param
      .split("-")
      .find((param) => param.startsWith("openCriteria"))

    if (!openCriteriaParam) return

    setOpen(true)
    setCriteriaOpened(true)
  }, [])

  const nutcrackerProgressValue = useMemo(() => {
    if (!dropProgress) return 0

    const neededProgress = dropProgress.find((el) => el.type === "NUTCRACKER")

    if (neededProgress) return neededProgress.userAmount

    return 0
  }, [dropProgress])

  const puchasedModuleProgressValue = useMemo(() => {
    if (!dropProgress) return 0

    const neededProgress = dropProgress.find(
      (el) => el.type === "PURCHASE_MODULE",
    )

    if (neededProgress) return neededProgress.userAmount

    return 0
  }, [dropProgress])

  const learnProgress = useMemo(() => {
    if (!dropProgress) return null

    const neededProgress = dropProgress.find(
      (el) => el.type === "PASSED_LESSONS",
    )

    if (neededProgress) return neededProgress

    return null
  }, [dropProgress])

  const puchasedNutpassProgressValue = useMemo(() => {
    if (!dropProgress) return 0

    const neededProgress = dropProgress.find(
      (el) => el.type === "PURCHASE_NUT_PASS",
    )

    if (neededProgress) return neededProgress.userAmount

    return 0
  }, [dropProgress])

  const passProgress = useMemo(() => {
    if (!dropProgress) return null

    const neededProgress = dropProgress.find(
      (el) => el.type === "NUT_PASS_LEVELS",
    )

    if (neededProgress) return neededProgress

    return null
  }, [dropProgress])

  const streakProgress = useMemo(() => {
    if (!dropProgress) return null

    const neededProgress = dropProgress.find((el) => el.type === "STREAK_DAYS")

    if (neededProgress) return neededProgress

    return null
  }, [dropProgress])

  const donateProgress = useMemo(() => {
    if (!dropProgress) return null

    const neededProgress = dropProgress.find(
      (el) => el.type === "PAYS_IN_STARS",
    )

    if (neededProgress) return neededProgress

    return null
  }, [dropProgress])

  const achievementsProgress = useMemo(() => {
    if (!dropProgress) return null

    const neededProgress = dropProgress.find((el) => el.type === "ACHIEVEMENTS")

    if (neededProgress) return neededProgress

    return null
  }, [dropProgress])

  const leaderboardProgress = useMemo(() => {
    if (!dropProgress) return null

    const neededProgress = dropProgress.find((el) => el.type === "XP_AMOUNT")

    if (neededProgress) return neededProgress

    return null
  }, [dropProgress])

  const gamesProgress = useMemo(() => {
    if (!dropProgress) return null

    const neededProgress = dropProgress.find(
      (el) => el.type === "LEVELS_PASSED",
    )

    if (neededProgress) return neededProgress

    return null
  }, [dropProgress])

  const wheelProgress = useMemo(() => {
    if (!dropProgress) return null

    const neededProgress = dropProgress.find((el) => el.type === "WHEEL_SPINS")

    if (neededProgress) return neededProgress

    return null
  }, [dropProgress])

  const tasksProgress = useMemo(() => {
    if (!dropProgress) return null

    const neededProgress = dropProgress.find(
      (el) => el.type === "TASK_COMPLETED",
    )

    if (neededProgress) return neededProgress

    return null
  }, [dropProgress])

  const mintNftProgress = useMemo(() => {
    if (!dropProgress) return null

    const neededProgress = dropProgress.find((el) => el.type === "MINT_NFT")

    if (neededProgress) return neededProgress

    return null
  }, [dropProgress])

  const cupsProgress = useMemo(() => {
    if (!dropProgress) return null

    const neededProgress = dropProgress.find((el) => el.type === "CUPS_NFT")

    if (neededProgress) return neededProgress

    return null
  }, [dropProgress])

  const onBuyCriteriaClick = async () => {
    setCriteriaOpened(true)
  }

  const hasAvailableCriteria = useMemo(() => {
    if (!discountsData) return false

    const isValidPrice = (price: number | null) => price !== null && price > 0

    const canBuyCourse =
      discountsData.hasCourse !== discountsData.targetCourse &&
      isValidPrice(
        Telegram.WebApp.initData
          ? discountsData.coursePrice
          : discountsData.coursePriceTon,
      )

    const canBuyNutPass =
      !discountsData.hasCourse &&
      discountsData.targetCourse &&
      isValidPrice(
        Telegram.WebApp.initData
          ? discountsData.nutPassPrice
          : discountsData.nutPassPriceTon,
      )

    const canBuyPassLevel =
      (discountsData.targetPassLevel
        ? discountsData.passLevelUpper === null
          ? true
          : discountsData.nowPassLevels <= discountsData.passLevelUpper
        : false) &&
      isValidPrice(
        Telegram.WebApp.initData
          ? discountsData.passLevelPrice
          : discountsData.passLevelPriceTon,
      )

    const canBuyGames =
      (discountsData.targetGames
        ? discountsData.totalGamesUpper === null
          ? true
          : discountsData.nowGames <= discountsData.totalGamesUpper
        : false) &&
      isValidPrice(
        Telegram.WebApp.initData
          ? discountsData.gamesPrice
          : discountsData.gamesPriceTon,
      )

    const canBuyWheels =
      discountsData.targetWheels !== null &&
      isValidPrice(
        Telegram.WebApp.initData
          ? discountsData.wheelsPrice
          : discountsData.wheelsPriceTon,
      )

    const canBuyNftMints =
      discountsData.targetNftMints !== null &&
      isValidPrice(
        Telegram.WebApp.initData
          ? discountsData.nftMintsPrice
          : discountsData.nftMintsPriceTon,
      )

    return (
      canBuyCourse ||
      canBuyPassLevel ||
      canBuyNutPass ||
      canBuyGames ||
      canBuyWheels ||
      canBuyNftMints
    )
  }, [discountsData])

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent
          className={cn(
            "h-screen gap-0 overflow-y-auto overflow-x-hidden rounded-t-none px-4",
            Telegram.WebApp.platform === "weba"
              ? "pb-4"
              : "pb-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
          )}
        >
          <Description className="sr-only">Drop modal</Description>
          <SheetHeader
            titleClassName="text-center relative text-2xl mt-10"
            className="shrink-0"
          >
            {t("Мультипликаторы дропа")}
          </SheetHeader>

          <div className="mb-10 flex flex-col gap-2 pb-16">
            <p className="mt-3 text-balance text-center text-sm text-white/80">
              {t(
                "Каждый мультипликатор повышает коэффициент конвертации NUTS в $OA",
              )}
            </p>

            <Countdown />

            {!dropCriteria || !dropProgress ? (
              <DropSkeleton />
            ) : (
              <>
                <Learn
                  isPremium={puchasedModuleProgressValue > 0}
                  progress={learnProgress}
                  criteria={dropCriteria.PASSED_LESSONS.map((el) => el).sort(
                    (a, b) => a.amount - b.amount,
                  )}
                />
                <NutsPass
                  isPremium={puchasedNutpassProgressValue > 0}
                  progress={passProgress}
                  criteria={dropCriteria.NUT_PASS_LEVELS.map((el) => el).sort(
                    (a, b) => a.amount - b.amount,
                  )}
                />
                <DailyStreak
                  progress={streakProgress}
                  criteria={dropCriteria.STREAK_DAYS.map((el) => el).sort(
                    (a, b) => a.amount - b.amount,
                  )}
                />
                <Donate
                  progress={donateProgress}
                  criteria={dropCriteria.PAYS_IN_STARS.map((el) => el).sort(
                    (a, b) => a.amount - b.amount,
                  )}
                />
                <Achievements
                  progress={achievementsProgress}
                  criteria={dropCriteria.ACHIEVEMENTS.map((el) => el).sort(
                    (a, b) => a.amount - b.amount,
                  )}
                />
                <Leaderboard
                  progress={leaderboardProgress}
                  criteria={dropCriteria.XP_AMOUNT.map((el) => el).sort(
                    (a, b) => a.amount - b.amount,
                  )}
                />
                <Games
                  progress={gamesProgress}
                  criteria={dropCriteria.LEVELS_PASSED.map((el) => el).sort(
                    (a, b) => a.amount - b.amount,
                  )}
                />
                <Wheel
                  progress={wheelProgress}
                  criteria={dropCriteria.WHEEL_SPINS.map((el) => el).sort(
                    (a, b) => a.amount - b.amount,
                  )}
                />
                <Nutcracker hasNutcracker={nutcrackerProgressValue > 0} />
                <Tasks
                  progress={tasksProgress}
                  criteria={dropCriteria.TASK_COMPLETED.map((el) => el).sort(
                    (a, b) => a.amount - b.amount,
                  )}
                />
                <Mints
                  progress={mintNftProgress}
                  criteria={dropCriteria.MINT_NFT.map((el) => el).sort(
                    (a, b) => a.amount - b.amount,
                  )}
                />
                <NutsDash
                  progress={cupsProgress}
                  criteria={dropCriteria.CUPS_NFT.map((el) => el).sort(
                    (a, b) => a.amount - b.amount,
                  )}
                />
              </>
            )}
          </div>
          {Date.now() < targetTime && discountsData && hasAvailableCriteria && (
            <div
              className={cn(
                "fixed left-1/2 z-20 w-full max-w-2xl -translate-x-1/2 px-3.5",
                Telegram.WebApp.platform === "weba"
                  ? "bottom-4"
                  : "bottom-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
              )}
            >
              <LargeButton
                appearance="yellow-linear"
                onClick={onBuyCriteriaClick}
                contentClassName="gap-4"
              >
                {t("Докупить критерии")}
                <p>
                  {getDays(Math.round((targetTime - Date.now()) / 1000), true)}
                  {t("d")}{" "}
                  {getHours(
                    Math.round((targetTime - Date.now()) / 1000),
                    false,
                    false,
                  )}
                  {t("h")}
                </p>
              </LargeButton>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <BuyCriteriaModal
        open={criteriaOpened}
        setOpen={setCriteriaOpened}
        openPaymentStatus={() => {
          setPaymentStatusOpen(true)
        }}
        hasAvailableCriteria={hasAvailableCriteria}
      />

      <BuyCriteriaPaymentStatus
        open={paymentStatusOpen}
        setOpen={setPaymentStatusOpen}
      />
    </>
  )
}

export default DropModal

const Learn = ({
  isPremium,
  progress,
  criteria,
}: {
  isPremium: boolean
  progress: UserDropCriteriaProgress | null
  criteria: DropCriteria[]
}) => {
  const { t } = useTranslation()

  if (progress === null) return null

  return (
    <Collapsible.Root
      className={cn(
        "flex flex-col rounded-xl bg-[#0F1824] px-3 py-4",
        progress.userAmount < criteria[0].amount && "opacity-70",
      )}
    >
      <div className="mb-5 flex items-center gap-2">
        <LearnIcon />
        <p className="font-tt-hoves-expanded text-base font-medium text-white">
          {t("Обучение")}
        </p>
        <Collapsible.Trigger className="ml-auto transition-transform data-[state=open]:rotate-180">
          <ChevronDown className="text-white/50" />
        </Collapsible.Trigger>
      </div>

      <UserLevel text={t("Пройдено уроков")} {...progress} />

      <Progress>
        {criteria.map((el, i) => (
          <ProgressValue
            key={i}
            currentValue={progress.userAmount}
            value={el.amount}
            usersOnLevel={el.usersOnLevel}
          />
        ))}
      </Progress>

      <div className="mt-5 flex items-center justify-between">
        <p
          className={cn(
            "text-sm font-semibold",
            isPremium ? "text-white" : "text-white/50",
          )}
        >
          {t("Куплен платный курс")}
        </p>
        <CheckIcon
          className={cn(isPremium ? "text-[#A3FF47]" : "text-[#283649]")}
        />
      </div>

      <Collapsible.Content className="w-full overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="my-6 h-px w-full bg-[#283649]" />
        <p className="text-sm/[22px] font-semibold text-white/50">
          {t("Мой уровень выше, чем")}{" "}
          <span className="font-bold text-white/75">
            {numberWithSpaces(progress.userAmountBelow)} (
            {progress.userPercentBellow}%)
          </span>{" "}
          {t("польз.")}
        </p>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

const NutsPass = ({
  isPremium,
  progress,
  criteria,
}: {
  isPremium: boolean
  progress: UserDropCriteriaProgress | null
  criteria: DropCriteria[]
}) => {
  const { t } = useTranslation()

  const [paymentStatusOpen, setPaymentStatusOpen] = useState(false)

  // const navigate = useNavigate()

  const dispatch = useAppDispatch()
  const { isBuyLevelOpened } = useAppSelector((state) => state.passv2)

  const remainigToNextLevel = useMemo(() => {
    if (!progress) return null

    const neededCriteria = criteria.find(
      (el) => progress.userAmount < el.amount,
    )

    if (!neededCriteria) return null

    return neededCriteria.amount - progress.userAmount
  }, [criteria, progress])

  if (progress === null) return null

  return (
    <>
      <Collapsible.Root
        className={cn(
          "flex flex-col rounded-xl bg-[#0F1824] px-3 py-4",
          progress.userAmount < criteria[0].amount && "opacity-70",
        )}
      >
        <div className="mb-5 flex items-center gap-2">
          <NutspassIcon />
          <p className="font-tt-hoves-expanded text-base font-medium text-white">
            Nuts Pass
          </p>
          <Collapsible.Trigger className="ml-auto transition-transform data-[state=open]:rotate-180">
            <ChevronDown className="text-white/50" />
          </Collapsible.Trigger>
        </div>

        <UserLevel text={t("Уровень Nuts Pass")} {...progress} />

        <Progress>
          {criteria.map((el, i) => (
            <ProgressValue
              key={i}
              currentValue={progress.userAmount}
              value={el.amount}
              usersOnLevel={el.usersOnLevel}
            />
          ))}
        </Progress>

        <div className="mt-5 flex items-center justify-between">
          <p
            className={cn(
              "text-sm font-semibold",
              isPremium ? "text-white" : "text-white/50",
            )}
          >
            Nuts Pass Premium
          </p>
          <CheckIcon
            className={cn(isPremium ? "text-[#A3FF47]" : "text-[#283649]")}
          />
        </div>

        <Collapsible.Content className="w-full overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <div className="my-6 h-px w-full bg-[#283649]" />
          <p className="text-sm/[22px] font-semibold text-white/50">
            {t("Мой уровень выше, чем")}{" "}
            <span className="font-bold text-white/75">
              {numberWithSpaces(progress.userAmountBelow)} (
              {progress.userPercentBellow}%)
            </span>{" "}
            {t("польз.")}
          </p>
          {remainigToNextLevel && (
            <div className="mt-5 flex items-center justify-between gap-2">
              <div className="flex flex-col text-sm">
                <p className="font-medium">{t("До следующей отметки:")}</p>
                <p className="font-bold">
                  {remainigToNextLevel} {t("уровня")}
                </p>
              </div>
              <Button
                appearance="white"
                className="shrink-0"
                onClick={() => {
                  dispatch(setIsBuyLevelOpened(true))
                }}
              >
                {t("Купить уровни")}
              </Button>
            </div>
          )}
        </Collapsible.Content>
      </Collapsible.Root>

      <BuyLevels
        open={isBuyLevelOpened}
        setOpen={(value) => dispatch(setIsBuyLevelOpened(value))}
        openPaymentStatus={() => {
          dispatch(setIsBuyLevelOpened(false))
          setPaymentStatusOpen(true)
        }}
      />

      <BuyLevelsPaymentStatus
        open={paymentStatusOpen}
        setOpen={setPaymentStatusOpen}
      />
    </>
  )
}

const DailyStreak = ({
  progress,
  criteria,
}: {
  progress: UserDropCriteriaProgress | null
  criteria: DropCriteria[]
}) => {
  const { t } = useTranslation()

  if (progress === null) return null

  return (
    <Collapsible.Root
      className={cn(
        "flex flex-col rounded-xl bg-[#0F1824] px-3 py-4",
        progress.userAmount < criteria[0].amount && "opacity-70",
      )}
    >
      <div className="mb-5 flex items-center gap-2">
        <FireIcon />
        <p className="font-tt-hoves-expanded text-base font-medium text-white">
          {t("Ореховый забег")}
        </p>
        <Collapsible.Trigger className="ml-auto transition-transform data-[state=open]:rotate-180">
          <ChevronDown className="text-white/50" />
        </Collapsible.Trigger>
      </div>

      <UserLevel text={t("Текущее значение")} {...progress} />

      <Progress>
        {criteria.map((el, i) => (
          <ProgressValue
            key={i}
            currentValue={progress.userAmount}
            value={el.amount}
            usersOnLevel={el.usersOnLevel}
          />
        ))}
      </Progress>

      <Collapsible.Content className="w-full overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="my-6 h-px w-full bg-[#283649]" />
        <p className="text-sm/[22px] font-semibold text-white/50">
          {t("Мой уровень выше, чем")}{" "}
          <span className="font-bold text-white/75">
            {numberWithSpaces(progress.userAmountBelow)} (
            {progress.userPercentBellow}%)
          </span>{" "}
          {t("польз.")}
        </p>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

const Donate = ({
  progress,
  criteria,
}: {
  progress: UserDropCriteriaProgress | null
  criteria: DropCriteria[]
}) => {
  const { t } = useTranslation()

  if (progress === null) return null

  return (
    <Collapsible.Root
      className={cn(
        "flex flex-col rounded-xl bg-[#0F1824] px-3 py-4",
        progress.userAmount < criteria[0].amount && "opacity-70",
      )}
    >
      <div className="mb-5 flex items-center gap-2">
        <DonateIcon />
        <p className="font-tt-hoves-expanded text-base font-medium text-white">
          {t("Меценат")}
        </p>
        <Collapsible.Trigger className="ml-auto transition-transform data-[state=open]:rotate-180">
          <ChevronDown className="text-white/50" />
        </Collapsible.Trigger>
      </div>

      <UserLevel text={t("Сделано донатов Stars/TON")} {...progress} />

      <Progress>
        {criteria.map((el, i) => (
          <ProgressValue
            key={i}
            currentValue={progress.userAmount}
            value={el.amount}
            usersOnLevel={el.usersOnLevel}
          />
        ))}
      </Progress>

      <Collapsible.Content className="w-full overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="my-6 h-px w-full bg-[#283649]" />
        <p className="text-sm/[22px] font-semibold text-white/50">
          {t("Мой уровень выше, чем")}{" "}
          <span className="font-bold text-white/75">
            {numberWithSpaces(progress.userAmountBelow)} (
            {progress.userPercentBellow}%)
          </span>{" "}
          {t("польз.")}
        </p>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

const Achievements = ({
  progress,
  criteria,
}: {
  progress: UserDropCriteriaProgress | null
  criteria: DropCriteria[]
}) => {
  const { t } = useTranslation()

  if (progress === null) return null

  return (
    <Collapsible.Root
      className={cn(
        "flex flex-col rounded-xl bg-[#0F1824] px-3 py-4",
        progress.userAmount < criteria[0].amount && "opacity-70",
      )}
    >
      <div className="mb-5 flex items-center gap-2">
        <AchievementsIcon />
        <p className="font-tt-hoves-expanded text-base font-medium text-white">
          {t("Достижения")}
        </p>
        <Collapsible.Trigger className="ml-auto transition-transform data-[state=open]:rotate-180">
          <ChevronDown className="text-white/50" />
        </Collapsible.Trigger>
      </div>

      <UserLevel text={t("Текущее значение")} {...progress} />

      <Progress>
        {criteria.map((el, i) => (
          <ProgressValue
            key={i}
            currentValue={progress.userAmount}
            value={el.amount}
            usersOnLevel={el.usersOnLevel}
          />
        ))}
      </Progress>

      <Collapsible.Content className="w-full overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="my-6 h-px w-full bg-[#283649]" />
        <p className="text-sm/[22px] font-semibold text-white/50">
          {t("Мой уровень выше, чем")}{" "}
          <span className="font-bold text-white/75">
            {numberWithSpaces(progress.userAmountBelow)} (
            {progress.userPercentBellow}%)
          </span>{" "}
          {t("польз.")}
        </p>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

const Leaderboard = ({
  progress,
  criteria,
}: {
  progress: UserDropCriteriaProgress | null
  criteria: DropCriteria[]
}) => {
  const { t } = useTranslation()

  if (progress === null) return null

  return (
    <Collapsible.Root
      className={cn(
        "flex flex-col rounded-xl bg-[#0F1824] px-3 py-4",
        progress.userAmount < criteria[0].amount && "opacity-70",
      )}
    >
      <div className="mb-5 flex items-center gap-2">
        <LeaderboardIcon />
        <p className="font-tt-hoves-expanded text-base font-medium text-white">
          {t("Лидерборд")}
        </p>
        <Collapsible.Trigger className="ml-auto transition-transform data-[state=open]:rotate-180">
          <ChevronDown className="text-white/50" />
        </Collapsible.Trigger>
      </div>

      <UserLevel text={t("Очков опыта")} {...progress} />

      <Progress>
        {criteria.map((el, i) => (
          <ProgressValue
            key={i}
            currentValue={progress.userAmount}
            value={el.amount}
            usersOnLevel={el.usersOnLevel}
          />
        ))}
      </Progress>

      <Collapsible.Content className="w-full overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="my-6 h-px w-full bg-[#283649]" />
        <p className="text-sm/[22px] font-semibold text-white/50">
          {t("Мой уровень выше, чем")}{" "}
          <span className="font-bold text-white/75">
            {numberWithSpaces(progress.userAmountBelow)} (
            {progress.userPercentBellow}%)
          </span>{" "}
          {t("польз.")}
        </p>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

const Games = ({
  progress,
  criteria,
}: {
  progress: UserDropCriteriaProgress | null
  criteria: DropCriteria[]
}) => {
  const { t } = useTranslation()

  if (progress === null) return null

  return (
    <Collapsible.Root
      className={cn(
        "flex flex-col rounded-xl bg-[#0F1824] px-3 py-4",
        progress.userAmount < criteria[0].amount && "opacity-70",
      )}
    >
      <div className="mb-5 flex items-center gap-2">
        <GamesIcon />
        <p className="font-tt-hoves-expanded text-base font-medium text-white">
          {t("Игры")}
        </p>
        <Collapsible.Trigger className="ml-auto transition-transform data-[state=open]:rotate-180">
          <ChevronDown className="text-white/50" />
        </Collapsible.Trigger>
      </div>

      <UserLevel text={t("Уровней пройдено")} {...progress} />

      <Progress>
        {criteria.map((el, i) => (
          <ProgressValue
            key={i}
            currentValue={progress.userAmount}
            value={el.amount}
            usersOnLevel={el.usersOnLevel}
          />
        ))}
      </Progress>

      <Collapsible.Content className="w-full overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="my-6 h-px w-full bg-[#283649]" />
        <p className="text-sm/[22px] font-semibold text-white/50">
          {t("Мой уровень выше, чем")}{" "}
          <span className="font-bold text-white/75">
            {numberWithSpaces(progress.userAmountBelow)} (
            {progress.userPercentBellow}%)
          </span>{" "}
          {t("польз.")}
        </p>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

const Wheel = ({
  progress,
  criteria,
}: {
  progress: UserDropCriteriaProgress | null
  criteria: DropCriteria[]
}) => {
  const { t } = useTranslation()

  if (progress === null) return null

  return (
    <Collapsible.Root
      className={cn(
        "flex flex-col rounded-xl bg-[#0F1824] px-3 py-4",
        progress.userAmount < criteria[0].amount && "opacity-70",
      )}
    >
      <div className="mb-5 flex items-center gap-2">
        <WheelIcon />
        <p className="font-tt-hoves-expanded text-base font-medium text-white">
          Lucky Wheel
        </p>
        <Collapsible.Trigger className="ml-auto transition-transform data-[state=open]:rotate-180">
          <ChevronDown className="text-white/50" />
        </Collapsible.Trigger>
      </div>

      <UserLevel text={t("Прокруток сделано")} {...progress} />

      <Progress>
        {criteria.map((el, i) => (
          <ProgressValue
            key={i}
            currentValue={progress.userAmount}
            value={el.amount}
            usersOnLevel={el.usersOnLevel}
          />
        ))}
      </Progress>

      <Collapsible.Content className="w-full overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="my-6 h-px w-full bg-[#283649]" />
        <p className="text-sm/[22px] font-semibold text-white/50">
          {t("Мой уровень выше, чем")}{" "}
          <span className="font-bold text-white/75">
            {numberWithSpaces(progress.userAmountBelow)} (
            {progress.userPercentBellow}%)
          </span>{" "}
          {t("польз.")}
        </p>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

const Nutcracker = ({ hasNutcracker }: { hasNutcracker: boolean }) => {
  if (!hasNutcracker) return null

  return (
    <div className="flex flex-col rounded-xl bg-[#0F1824] px-3 py-4">
      <div className="flex items-center gap-2">
        <NutcrackerIcon />
        <p className="font-tt-hoves-expanded text-base font-medium text-white">
          Nutcracker
        </p>
        <CheckIcon
          className={cn(
            "ml-auto",
            hasNutcracker ? "text-[#A3FF47]" : "text-[#283649]",
          )}
        />
      </div>
    </div>
  )
}

const Tasks = ({
  progress,
  criteria,
}: {
  progress: UserDropCriteriaProgress | null
  criteria: DropCriteria[]
}) => {
  const { t } = useTranslation()

  if (progress === null) return null

  return (
    <Collapsible.Root
      className={cn(
        "flex flex-col rounded-xl bg-[#0F1824] px-3 py-4",
        progress.userAmount < criteria[0].amount && "opacity-70",
      )}
    >
      <div className="mb-5 flex items-center gap-2">
        <TasksIcon />
        <p className="font-tt-hoves-expanded text-base font-medium text-white">
          {t("Задания")}
        </p>
        <Collapsible.Trigger className="ml-auto transition-transform data-[state=open]:rotate-180">
          <ChevronDown className="text-white/50" />
        </Collapsible.Trigger>
      </div>

      <UserLevel text={t("Выполнено")} {...progress} />

      <Progress>
        {criteria.map((el, i) => (
          <ProgressValue
            key={i}
            currentValue={progress.userAmount}
            value={el.amount}
            usersOnLevel={el.usersOnLevel}
          />
        ))}
      </Progress>

      <Collapsible.Content className="w-full overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="my-6 h-px w-full bg-[#283649]" />
        <p className="text-sm/[22px] font-semibold text-white/50">
          {t("Мой уровень выше, чем")}{" "}
          <span className="font-bold text-white/75">
            {numberWithSpaces(progress.userAmountBelow)} (
            {progress.userPercentBellow}%)
          </span>{" "}
          {t("польз.")}
        </p>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

const Mints = ({
  progress,
  criteria,
}: {
  progress: UserDropCriteriaProgress | null
  criteria: DropCriteria[]
}) => {
  const { t } = useTranslation()

  if (progress === null) return null

  return (
    <Collapsible.Root
      className={cn(
        "flex flex-col rounded-xl bg-[#0F1824] px-3 py-4",
        progress.userAmount < criteria[0].amount && "opacity-70",
      )}
    >
      <div className="mb-5 flex items-center gap-2">
        <MintNftIcon />
        <p className="font-tt-hoves-expanded text-base font-medium text-white">
          {t("Минты NFT")}
        </p>
        <Collapsible.Trigger className="ml-auto transition-transform data-[state=open]:rotate-180">
          <ChevronDown className="text-white/50" />
        </Collapsible.Trigger>
      </div>

      <UserLevel text={t("Сминчено NFT")} {...progress} />

      <Progress>
        {criteria.map((el, i) => (
          <ProgressValue
            key={i}
            currentValue={progress.userAmount}
            value={el.amount}
            usersOnLevel={el.usersOnLevel}
          />
        ))}
      </Progress>

      <Collapsible.Content className="w-full overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="my-6 h-px w-full bg-[#283649]" />
        <p className="text-sm/[22px] font-semibold text-white/50">
          {t("Мой уровень выше, чем")}{" "}
          <span className="font-bold text-white/75">
            {numberWithSpaces(progress.userAmountBelow)} (
            {progress.userPercentBellow}%)
          </span>{" "}
          {t("польз.")}
        </p>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

const NutsDash = ({
  progress,
  criteria,
}: {
  progress: UserDropCriteriaProgress | null
  criteria: DropCriteria[]
}) => {
  const { t } = useTranslation()

  if (progress === null) return null

  return (
    <Collapsible.Root
      className={cn(
        "flex flex-col rounded-xl bg-[#0F1824] px-3 py-4",
        progress.userAmount < criteria[0].amount && "opacity-70",
      )}
    >
      <div className="mb-5 flex items-center gap-2">
        <img src={NutsDashPNG} className="h-7 w-7 rounded-sm" />
        <p className="font-tt-hoves-expanded text-base font-medium text-white">
          Nuts Dash SuperCup
        </p>
        <Collapsible.Trigger className="ml-auto transition-transform data-[state=open]:rotate-180">
          <ChevronDown className="text-white/50" />
        </Collapsible.Trigger>
      </div>

      <UserLevel text={t("Количество NFT")} {...progress} />

      <Progress>
        {criteria.map((el, i) => (
          <ProgressValue
            key={i}
            currentValue={progress.userAmount}
            value={el.amount}
            usersOnLevel={el.usersOnLevel}
          />
        ))}
      </Progress>

      <Collapsible.Content className="w-full overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="my-6 h-px w-full bg-[#283649]" />
        <p className="text-sm/[22px] font-semibold text-white/50">
          {t("Мой уровень выше, чем")}{" "}
          <span className="font-bold text-white/75">
            {numberWithSpaces(progress.userAmountBelow)} (
            {progress.userPercentBellow}%)
          </span>{" "}
          {t("польз.")}
        </p>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

const Progress = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex items-center gap-1">{children}</div>
}

const ProgressValue = ({
  value,
  currentValue,
  usersOnLevel = 0,
}: {
  value: number
  currentValue: number
  usersOnLevel: number
}) => {
  const actualValue = useMemo(() => {
    if (value < 1000) return value
    return `${value / 1000}k`
  }, [value])

  return (
    <div className="flex flex-1 flex-col items-center gap-1.5">
      <p
        className={cn(
          "text-xs font-bold",
          currentValue >= value ? "text-white" : "text-white/50",
        )}
      >
        {actualValue}
      </p>
      <div
        className={cn(
          "h-1.5 w-full rounded-full",
          currentValue >= value ? "bg-cyan" : "bg-[#283649]",
        )}
      />
      <div className="flex items-center gap-0.5 text-[#5DCDFF]/50">
        <PeopleIcon />
        <p className="text-xs font-semibold">{usersOnLevel}</p>
      </div>
    </div>
  )
}

const UserLevel = ({
  text,
  userAmount,
  maxTimes,
}: {
  text: string
} & UserDropCriteriaProgress) => {
  return (
    <div className="mb-4 flex items-center justify-between">
      <p className="text-sm font-semibold">{text}</p>
      <div className="flex items-center gap-3">
        <p className="text-sm font-bold">{numberWithSpaces(userAmount)}</p>
        {maxTimes && (
          <div className="flex h-[26px] items-center justify-center rounded-full bg-[#283649] px-2 text-sm font-bold text-[#5BC3FF]">
            x{maxTimes.toFixed(2)}
          </div>
        )}
      </div>
    </div>
  )
}

const DropSkeleton = () => {
  const { t } = useTranslation()

  return (
    <>
      <div className="flex flex-col rounded-xl bg-[#0F1824] px-3 py-4">
        <div className="mb-5 flex items-center gap-2">
          <LearnIcon />
          <p className="font-tt-hoves-expanded text-base font-medium text-white">
            {t("Обучение")}
          </p>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold">{t("Пройдено уроков")}</p>
          <Skeleton className="h-5 w-4 rounded-sm" />
        </div>

        <Progress>
          <div className="h-7 flex-1">
            <Skeleton className="h-1.5 rounded-full" />
          </div>
          <div className="h-7 flex-1">
            <Skeleton className="h-1.5 rounded-full" />
          </div>
          <div className="h-7 flex-1">
            <Skeleton className="h-1.5 rounded-full" />
          </div>
        </Progress>

        <div className="mt-5 flex items-center justify-between">
          <p className="text-sm font-semibold text-white/50">
            {t("Куплен платный курс")}
          </p>
          <Skeleton className="size-5 rounded-full" />
        </div>
      </div>

      <div className="flex flex-col rounded-xl bg-[#0F1824] px-3 py-4">
        <div className="mb-5 flex items-center gap-2">
          <NutspassIcon />
          <p className="font-tt-hoves-expanded text-base font-medium text-white">
            Nuts Pass
          </p>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold">{t("Уровень Nuts Pass")}</p>
          <Skeleton className="h-5 w-4 rounded-sm" />
        </div>

        <Progress>
          <div className="h-7 flex-1">
            <Skeleton className="h-1.5 rounded-full" />
          </div>
          <div className="h-7 flex-1">
            <Skeleton className="h-1.5 rounded-full" />
          </div>
          <div className="h-7 flex-1">
            <Skeleton className="h-1.5 rounded-full" />
          </div>
          <div className="h-7 flex-1">
            <Skeleton className="h-1.5 rounded-full" />
          </div>
        </Progress>

        <div className="mt-5 flex items-center justify-between">
          <p className="text-sm font-semibold text-white/50">
            Nuts Pass Premium
          </p>
          <Skeleton className="size-5 rounded-full" />
        </div>
      </div>

      <div className="flex flex-col rounded-xl bg-[#0F1824] px-3 py-4">
        <div className="mb-5 flex items-center gap-2">
          <FireIcon />
          <p className="font-tt-hoves-expanded text-base font-medium text-white">
            {t("Ореховый забег")}
          </p>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold">{t("Текущее значение")}</p>
          <Skeleton className="h-5 w-4 rounded-sm" />
        </div>

        <Progress>
          <div className="h-7 flex-1">
            <Skeleton className="h-1.5 rounded-full" />
          </div>
          <div className="h-7 flex-1">
            <Skeleton className="h-1.5 rounded-full" />
          </div>
          <div className="h-7 flex-1">
            <Skeleton className="h-1.5 rounded-full" />
          </div>
          <div className="h-7 flex-1">
            <Skeleton className="h-1.5 rounded-full" />
          </div>
        </Progress>
      </div>
    </>
  )
}
