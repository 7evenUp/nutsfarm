import { useEffect, useMemo, useState } from "react"
import { RiveFile, useRive } from "@rive-app/react-webgl2"
import { toast } from "sonner"
import { t } from "i18next"
import {
  AnimatePresence,
  useAnimate,
  motion,
  AnimationPlaybackControls,
} from "framer-motion"

import Loader from "@/assets/icons/loader.svg?react"
import BrainCheckIcon from "@/assets/icons/brain-check.svg?react"
import SpaceRocketIcon from "@/assets/icons/space-rocket-launch.svg?react"
import MedalIcon from "@/assets/icons/medal.svg?react"
import CoinIcon from "@/assets/icons/coin.svg?react"
import PassIcon from "@/assets/icons/ticket.svg?react"
import StarIcon from "@/assets/lesson-icons/star-icon.svg?react"
import ForwardIcon from "@/assets/icons/forward.svg?react"
import FeedbackIcon from "@/assets/lesson-icons/feedback.svg?react"
import Refs from "@/assets/icons/group.svg?react"

import StarsSelect from "../components/StarsSelect"

import DonateDialog from "@/modals/Donate"
import SuccessfullDonate from "@/modals/Donate/SuccessfullDonate"

import { LargeButton } from "@/shared/ui/LargeButton"

import { useGetCurrentUserQuery } from "@/redux/api/user"
import {
  useClaimLessonMutation,
  useGetActiveModulesQuery,
} from "@/redux/api/learn"
import { useAppSelector } from "@/redux/hooks"

import { numberWithSpaces } from "@/utils/numberWithSpaces"
import { generateScore } from "@/utils/usersPercentage"
import { openLinkWithTelegram } from "@/utils/openLink"
import { sendMetrika } from "@/utils/sendMetrika"
import { Sound } from "@/utils/Sound"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

import { cn } from "@/lib/cn"

const TG_BOT_NAME = import.meta.env.VITE_BOT_NAME

interface FinalStaticProps {
  time: number
  percentage: number
  missmatches: number
}

const Final = ({
  onFinish,
  mark,
  lessonId,
  nutPassXp,
  reward,
  isClaimed,
  statistic,
  riveFile,
  mode,
  sound,
}: {
  onFinish: () => void
  lessonId: string
  mark: null | number
  nutPassXp: number
  reward: number
  isClaimed: boolean
  statistic: FinalStaticProps
  mode: "easy" | "full"
  riveFile: RiveFile | undefined
  sound: Sound
}) => {
  const [scope, animate] = useAnimate()

  const [currentAnimation, setCurrentAnimation] =
    useState<AnimationPlaybackControls | null>(null)
  const [rand, setRand] = useState(0)
  const [starWasSelected, setStarWasSelected] = useState(false)
  const [donateOpen, setDonateOpen] = useState(false)
  const [successfullDonateOpen, setSuccessfullDonateOpen] = useState(false)

  const [claimLesson, { isLoading }] = useClaimLessonMutation()

  const lang = useAppSelector((state) => state.language.value)
  const countryCode = useAppSelector((state) => state.countryCode.value)
  const selectedModuleId = useAppSelector(
    (state) => state.selectedModule.selectedModuleId,
  )

  const { data: modules } = useGetActiveModulesQuery({
    lang,
    region: countryCode,
  })
  const { data: currentUser } = useGetCurrentUserQuery()

  const { RiveComponent } = useRive({
    riveFile,
    autoplay: true,
  })

  const calculatedScore = useMemo(() => {
    return Math.floor(
      generateScore(statistic.missmatches, Math.floor(statistic.time / 1000)),
    )
  }, [])

  const selectedModule = useMemo(() => {
    if (!modules) return null

    if (!selectedModuleId) return null

    return modules.find((module) => module.id === selectedModuleId)
  }, [modules, selectedModuleId])

  const onReturn = () => {
    makeHapticFeedback({ impactOccured: "rigid" })
    onFinish()
  }

  useEffect(() => {
    sendMetrika("learn_success_visit", { userBalance: currentUser?.balance })

    sound.play()

    setRand(Math.random())

    if (isClaimed) return

    const claim = async () => {
      if (isLoading) return

      try {
        await claimLesson({
          lessonId,
          mistakes: statistic.missmatches,
          duration: Math.floor(statistic.time / 1000),
        }).unwrap()
      } catch {
        toast.error(t("Ошибка"), {
          description: t("Упс, что-то пошло не так"),
        })
      }
    }

    claim()
  }, [])

  useEffect(() => {
    if (scope.current && scope.animations) {
      // Анимация, которую можно проскипать
      const animation = animate([
        [
          ".final",
          {
            opacity: 0,
            transform: "translateY(-100px)",
          },
          { duration: 0.8, at: "<", ease: "easeInOut" },
        ],
        //setup styles
        [
          ".congratulation-text",
          {
            bottom: 0,
            opacity: 0,
            transform: "translate(-50%)",
          },
          { duration: 0, at: "<" },
        ],
        [
          ".bottom-animation",
          {
            bottom: "-20%",
            opacity: 0,
            transform: "translateX(-50%) scale(0.8)",
          },
          { duration: 0, at: "<" },
        ],
        [
          ".claim-btn",
          {
            transform: "translateY(100px)",
            opacity: 0,
          },
          { duration: 0, at: "<" },
        ],
        // Начало анимации
        [
          ".congratulation-text",
          {
            bottom: "60%",
            opacity: 1,
            transform: "translate(-50%)",
          },
          { duration: 0.8, at: ">", ease: "easeInOut" },
        ],
        [
          ".bottom-animation",
          { bottom: 0, opacity: 1, transform: "translateX(-50%) scale(1)" },
          { duration: 1, at: "-0.8", ease: "easeInOut" },
        ],

        //вторая стадия
        [
          ".bottom-animation",
          {
            bottom: "-20%",
            opacity: 0,
            transform: "translateX(-50%) scale(1)",
          },
          { duration: 1, at: "+2", ease: "easeInOut" },
        ],
        [
          ".congratulation-text",
          {
            bottom: "-20%",
            opacity: 0,
            transform: "translate(-50%)",
          },
          { duration: 0.8, at: "<", ease: "easeInOut" },
        ],
      ])
      // Анимация, которая появляется после скипа
      animation.then(() => {
        animate([
          // поялвение статов
          [
            ".final",
            {
              opacity: 1,
              transform: "translateY(0px)",
            },
            { duration: 0.8, at: "<", ease: "easeInOut" },
          ],
          [
            ".claim-btn",
            {
              transform: "translateY(0)",
              opacity: 1,
            },
            { delay: 0.4, duration: 0.8, at: "<", ease: "easeInOut" },
          ],
        ])
        setCurrentAnimation(null)
      })
      setCurrentAnimation(animation)
    }
  }, [animate, isClaimed])

  useEffect(() => {
    if (currentAnimation === null) return

    if (mode === "easy") {
      currentAnimation.complete()
      return
    }

    const controller = new AbortController()

    window.addEventListener(
      "click",
      () => {
        currentAnimation.complete()
      },
      { once: true, signal: controller.signal },
    )

    return () => {
      controller.abort()
    }
  }, [currentAnimation])

  if (!currentUser) return

  const handleLinkClick = () => {
    if (lang === "RU")
      openLinkWithTelegram("https://forms.gle/1rcA1DBPQR1iA8it9")
    if (lang === "EN")
      openLinkWithTelegram(
        "https://docs.google.com/forms/d/e/1FAIpQLSdkMOTRbpyrxPqv2H4hwGo-td2WotvdsCxKER50OYFYQzyYCA/viewform?usp=header",
      )
  }

  const handleShareClick = () => {
    const url = `https://t.me/${TG_BOT_NAME}?startapp=ref_${currentUser.referralCode}-to_earn-lessonid_${lessonId}-moduleid_${selectedModuleId}-utmCampaign_lessonShare-utmContent_${lessonId}-utmSource_${currentUser.referralCode}`

    const text = encodeURI(
      lang === "RU"
        ? `${Telegram.WebApp.platform === "ios" ? "" : "\n"}👋 Привет! Прошёл 3-минутный урок по основам крипты прямо в TG и решил поделиться с тобой\n\n🎮 Написано максимально просто и доступно, а изученное можно сразу закрепить на практике!\n\n🚀 Думаю, тебе тоже стоит попробовать!`
        : `${Telegram.WebApp.platform === "ios" ? "" : "\n"}👋 Hey! I just completed a 3-minute lesson on crypto basics right in Telegram and had to share it with you\n\n🎮 The content is super simple and easy to follow, plus you can immediately apply what you’ve learned!\n\n🚀 You should give it a try too!`,
    )

    Telegram.WebApp.openTelegramLink(
      `https://t.me/share/url?text=${text}&url=${url}`,
    )
  }

  return (
    <>
      <div className="relative h-screen w-screen" ref={scope}>
        <p className="congratulation-text absolute left-1/2 mb-8 mt-12 flex w-full -translate-x-1/2 items-center justify-center gap-2 text-center font-tt-hoves-expanded text-2xl font-semibold text-white">
          {t("Ура, урок пройден!")}
          <br />
          {t("Ты молодец!")}
        </p>
        <RiveComponent
          style={{
            bottom: 0,
            opacity: 1,
            transform: "translateX(-50%) scale(1)",
          }}
          className="bottom-animation absolute bottom-10 left-1/2 h-[280px] w-screen max-w-[350px] phone-xsm:h-[300px] phone-sm:h-[400px] phone-sm-fix:max-w-[390px]"
        />

        <div className="final absolute flex w-full flex-col opacity-0">
          <span className="mt-4 flex justify-center text-center font-tt-hoves-expanded text-base font-semibold text-white phone-xsm:mt-5 phone-xsm:text-lg phone-sm-fix:mt-6 phone-sm-fix:text-2xl">
            {rand > 0.3
              ? t("Хорошая работа!")
              : rand > 0.6
                ? t("У тебя талант!")
                : t("Восхитительно!")}
          </span>

          {mode === "full" && (
            <div className="mt-3 flex items-center justify-center gap-2.5 px-4 phone-xsm:mt-4 phone-sm-fix:mt-6">
              <div className="flex min-h-[90px] w-full flex-col items-center justify-center gap-2 rounded-2xl bg-[#17202D] px-2 phone-sm-fix:min-h-[106px] phone-sm-fix:gap-3.5 phone-sm-fix:px-5">
                <BrainCheckIcon className="h-7 w-7 phone-sm-fix:h-9 phone-sm-fix:w-9" />
                <span className="text-center font-nunito text-xs text-[#8EEB7A]">
                  {t("ошибок", { count: statistic.missmatches })}
                </span>
              </div>
              <div className="flex min-h-[90px] w-full flex-col items-center justify-center gap-2 rounded-2xl bg-[#17202D] px-2 phone-sm-fix:min-h-[106px] phone-sm-fix:gap-3.5 phone-sm-fix:px-5">
                <MedalIcon className="h-7 w-7 phone-sm-fix:h-9 phone-sm-fix:w-9" />
                <span className="text-center font-nunito text-xs text-[#FDF356]">
                  {lang === "RU"
                    ? `Лучше ${calculatedScore}% учеников`
                    : `Better than ${calculatedScore}% students`}
                </span>
              </div>
              <div className="flex min-h-[90px] w-full flex-col items-center justify-center gap-2 rounded-2xl bg-[#17202D] px-2 phone-sm-fix:min-h-[106px] phone-sm-fix:gap-3.5 phone-sm-fix:px-5">
                <SpaceRocketIcon className="h-7 w-7 phone-sm-fix:h-9 phone-sm-fix:w-9" />
                <span className="text-center font-nunito text-xs text-[#FFAB43]">
                  {lang === "RU"
                    ? `Быстро! Всего ${Math.floor(statistic.time / 1000)} сек`
                    : `That was fast! Only ${Math.floor(statistic.time / 1000)} sec`}
                </span>
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-col items-center justify-center phone-xsm:mt-6 phone-sm-fix:mt-9">
            <div className="flex w-[280px] flex-col gap-2">
              <AnimatePresence mode="wait">
                {mark === null && !starWasSelected ? (
                  <StarsSelect
                    key="stars-select"
                    lessonId={lessonId}
                    mark={mark}
                    setStarWasSelected={setStarWasSelected}
                  />
                ) : (
                  <motion.button
                    key="feedback-button"
                    initial={{ x: -200, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    onClick={handleLinkClick}
                    className="flex items-center justify-center rounded-xl bg-[#17202D] px-5 py-3 hover:bg-[#17202D]/80"
                  >
                    <FeedbackIcon className="mr-2 h-6 w-6" />
                    <span className="text-sm">
                      {t("Оставить отзыв об уроке")}
                    </span>
                    <ForwardIcon className="ml-1 h-4 w-4" />
                  </motion.button>
                )}
              </AnimatePresence>

              <button
                onClick={handleShareClick}
                className="flex items-center justify-center rounded-xl bg-[#17202D] px-5 py-3 hover:opacity-80"
              >
                <Refs className="h-5 w-5" />
                <span className="mx-2 text-sm">{t("Расскажи другу")}</span>
              </button>

              {selectedModule &&
                (selectedModule.isPurchased === undefined ||
                  selectedModule.isPurchased === null) && (
                  <LargeButton
                    appearance="blue-radial"
                    className="h-[52px] translate-y-0.5"
                    contentClassName="gap-2 -translate-y-px font-nunito font-bold text-sm h-12 group-active:translate-y-1"
                    shadowClassName="h-[52px] group-active:h-[48px] group-active:translate-y-1"
                    onClick={() => {
                      makeHapticFeedback({ notificationOccured: "success" })
                      sendMetrika("start_donate_button", {
                        userBalance: currentUser.balance,
                      })
                      setDonateOpen(true)
                    }}
                  >
                    <StarIcon className="h-5 w-5" />
                    {t("Поддержать проект")}
                  </LargeButton>
                )}
            </div>

            {/* Блок с текстом наградами*/}
            <div className="mt-4 flex flex-col items-center justify-between phone-xsm:mt-6 phone-sm-fix:mt-8">
              <div className="mb-3 flex items-center gap-2 text-center font-tt-hoves-expanded text-base font-semibold text-white phone-xsm:mb-4 phone-xsm:text-lg phone-sm-fix:text-xl">
                <span>{isClaimed ? t("Уже получено") : t("Твоя награда")}</span>
              </div>

              <div className="flex gap-2.5">
                <div
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-xl bg-[#17202D] px-3 py-2 phone-sm-fix:rounded-2xl phone-sm-fix:px-4 phone-sm-fix:py-3",
                    isClaimed && "opacity-70",
                  )}
                >
                  <CoinIcon className="h-6 w-6 shrink-0 phone-sm-fix:h-8 phone-sm-fix:w-8" />
                  <span className="text-center font-tt-hoves-expanded text-lg font-semibold text-[#FDF356] phone-sm-fix:text-xl">
                    {numberWithSpaces(reward)}
                  </span>
                </div>
                <div
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-2xl bg-[#17202D] px-3 py-2 phone-sm-fix:px-5 phone-sm-fix:py-4",
                    isClaimed && "opacity-70",
                  )}
                >
                  <PassIcon className="h-6 w-6 shrink-0 phone-sm-fix:h-10 phone-sm-fix:w-10" />
                  <span className="whitespace-nowrap text-center font-tt-hoves-expanded text-lg font-semibold text-[#F68DF1] phone-sm-fix:text-xl">
                    {nutPassXp}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <LargeButton
          appearance="white"
          className={cn(
            "claim-btn absolute inset-x-3.5 w-auto",
            Telegram.WebApp.platform === "weba"
              ? "bottom-4"
              : "bottom-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
          )}
          contentClassName="gap-2.5 text-lg"
          onClick={onReturn}
        >
          {isLoading ? (
            <Loader className="animate-spin" />
          ) : (
            t("Вернуться к модулю")
          )}
        </LargeButton>
      </div>

      <DonateDialog
        open={donateOpen}
        setOpen={setDonateOpen}
        openSuccessfullPayment={() => {
          setDonateOpen(false)
          setSuccessfullDonateOpen(true)
        }}
      />
      <SuccessfullDonate
        lessonId={lessonId}
        open={successfullDonateOpen}
        setOpen={setSuccessfullDonateOpen}
      />
    </>
  )
}

export default Final
