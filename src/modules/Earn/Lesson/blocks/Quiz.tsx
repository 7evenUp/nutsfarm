import { useEffect, useMemo, useState } from "react"
import { t } from "i18next"
import { RiveFile } from "@rive-app/react-webgl2"

import ArrowRight from "../components/ArrowRight"
import ForwardIcon from "@/assets/icons/forward.svg?react"
import SuccessCheckIcon from "@/assets/icons/check-success.svg?react"

import QuizPreview from "./QuizPreview"

import { LargeButton } from "@/shared/ui/LargeButton"

import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { loseHealth } from "@/redux/slices/health"
import { useDecreaseHealthMutation } from "@/redux/api/learn"

import { Quiz as QuizType } from "@/types/learn"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"
import { openLinkWithTelegram } from "@/utils/openLink"
import { arraysEqual } from "@/utils/arrays"
import { Sound } from "@/utils/Sound"

import { cn } from "@/lib/cn"

const shuffleAnswers = (
  answers: { text: string; isCorrect: boolean }[],
): { text: string; isCorrect: boolean }[] => {
  const shuffled = [...answers]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1))

    ;[shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]]
  }
  return shuffled
}

const Quiz = ({
  goToNextLesson,
  goToPreviousLesson,
  handleWrongAnswer,
  readQuizPreview,
  question,
  answers,
  buttons,
  needToShowPreview,
  isClaimed,
  riveFile,
  previewSound,
  successSound,
  nextSound,
}: QuizType & {
  goToNextLesson: () => void
  goToPreviousLesson: () => void
  handleWrongAnswer: () => void
  readQuizPreview: () => void
  needToShowPreview: boolean
  isClaimed: boolean
  riveFile: RiveFile | undefined
  previewSound: Sound
  successSound: Sound
  nextSound: Sound
}) => {
  const dispatch = useAppDispatch()
  const [decrease] = useDecreaseHealthMutation()

  const lang = useAppSelector((state) => state.language.value)

  const quizMode = useMemo(() => {
    if (answers) {
      return answers.filter((elem) => elem.isCorrect).length > 1
        ? "multi"
        : "single"
    }

    return "single"
  }, [answers])

  const [selectedVariant, setSelectedVariant] = useState<null | string>(null)
  const [selectedVariants, setSelectedVariants] = useState<string[]>([])

  const [isSucceeded, setIsSucceeded] = useState(false)
  const [isFailed, setIsFailed] = useState(false)
  const [hasPreviewShown, setHasPreviewShown] = useState(false)
  const [shuffledAnswers, setShuffledAnswers] = useState<
    { text: string; isCorrect: boolean }[]
  >([])

  const buttonsNext = buttons.filter((button) => button.type === "NEXT_BUTTON")
  const buttonsLink = buttons.filter(
    (button) => button.type === "LINK" || button.type === "REF_LINK",
  )

  const nextButtonTitle = buttonsNext.find(
    (button) => button.lang === lang,
  )?.title

  const linkButtonTitle = buttonsLink.find(
    (button) => button.lang.toUpperCase() === lang,
  )?.title
  const linkButtonHref = buttonsLink.find(
    (button) => button.lang.toUpperCase() === lang,
  )?.link

  useEffect(() => {
    // Перемешиваем слова и определения при монтировании компонента
    if (answers) {
      setShuffledAnswers(shuffleAnswers(answers))
    }
  }, [answers])

  useEffect(() => {
    if (needToShowPreview && !hasPreviewShown) {
      previewSound.play()
    } else {
      nextSound.play()
    }
  }, [answers, needToShowPreview, hasPreviewShown])

  const resetState = () => {
    setSelectedVariant(null)
    setSelectedVariants([])
    setIsSucceeded(false)
  }

  const onPrevClick = () => {
    resetState()
    goToPreviousLesson()
  }

  const onNextClick = () => {
    makeHapticFeedback({ impactOccured: "rigid" })
    resetState()
    goToNextLesson()
  }

  if (!question || !shuffledAnswers)
    return (
      <>
        <span className="mb-8 mt-12 flex items-center gap-2 text-center font-tt-hoves-expanded text-2xl font-semibold text-white">
          {t("У нас тут технические шоколадки")}
        </span>
        <span className="flex items-center gap-2 px-10 py-10 text-center text-white">
          {t(
            "К сожалению в уроке обнаружена ошибка, мы уже решаем этот вопрос",
          )}
        </span>
        <LargeButton
          appearance="white"
          hasRing
          className={cn(
            "absolute inset-x-3.5 w-auto",
            Telegram.WebApp.platform === "weba"
              ? "bottom-4"
              : "bottom-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
          )}
          contentClassName="gap-2.5"
          onClick={goToNextLesson}
        >
          {lang === "RU" ? "Продолжить урок" : "Continue the lesson"}
        </LargeButton>
      </>
    )

  const correctVariant = shuffledAnswers.find((answer) => answer.isCorrect)

  const submit = () => {
    if (quizMode === "single") {
      if (selectedVariant === correctVariant?.text) {
        successSound.play()
        setIsSucceeded(true)
        setIsFailed(false)
        makeHapticFeedback({ notificationOccured: 'success' })
      } else {
        makeHapticFeedback({ notificationOccured: 'error' })
        handleWrongAnswer()
        if (!isClaimed) {
          decrease()
          dispatch(loseHealth())
        }
        setIsFailed(true)
      }
    } else if (quizMode === "multi") {
      if (
        arraysEqual(
          selectedVariants,
          answers
            ?.filter((value) => value.isCorrect)
            .map((value) => value.text) ?? [],
        )
      ) {
        successSound.play()
        setIsSucceeded(true)
        setIsFailed(false)
        makeHapticFeedback({ notificationOccured: 'success' })
      } else {
        makeHapticFeedback({ notificationOccured: 'error' })
        handleWrongAnswer()
        if (!isClaimed) {
          decrease()
          dispatch(loseHealth())
        }
        setIsFailed(true)
      }
    }
  }

  if (needToShowPreview && !hasPreviewShown)
    return (
      <QuizPreview
        onClick={() => {
          setHasPreviewShown(true)
          readQuizPreview()
        }}
        riveFile={riveFile}
      />
    )

  return (
    <>
      <span className="mb-6 mt-8 px-3.5 text-sm text-white/75 phone-xsm:mb-8 phone-xsm:mt-10 phone-sm-fix:text-base">
        {quizMode === "single"
          ? t("Выбери правильный ответ:")
          : t("Выбери все правильные ответы:")}
      </span>

      <span className="mb-5 px-3.5 text-center font-tt-hoves-expanded text-lg font-semibold phone-xsm:mb-6 phone-sm:mb-7 phone-sm-fix:text-xl">
        {question}
      </span>
      {shuffledAnswers && (
        <div className="z-10 flex w-full flex-col gap-2 px-3.5">
          {shuffledAnswers.map((answer, i) => {
            if (quizMode == "multi")
              return (
                <button
                  key={i}
                  disabled={isSucceeded}
                  className={cn(
                    "rounded-xl bg-[#1C2430] px-5 py-3.5 text-center text-sm/[19px] font-semibold text-white transition-all phone-sm-fix:px-8 phone-sm-fix:text-base",
                    selectedVariants?.includes(answer.text) &&
                      "text-[#66FAFF] ring-2 ring-[#66FAFF]",
                    selectedVariants?.includes(answer.text) &&
                      isFailed &&
                      "text-[#FF3E31] ring-2 ring-[#FF3E31]",
                    selectedVariants?.includes(answer.text) &&
                      isSucceeded &&
                      "text-[#8FEB7B] ring-2 ring-[#8FEB7B]",
                  )}
                  onClick={() => {
                    if (isFailed) {
                      setIsFailed(false)
                      setSelectedVariants(() => [])
                    }

                    selectedVariants.includes(answer.text)
                      ? setSelectedVariants((prev) =>
                          prev.filter((x) => x != answer.text),
                        )
                      : setSelectedVariants((prev) => [...prev, answer.text])
                  }}
                >
                  {answer.text}
                </button>
              )
            else
              return (
                <button
                  key={i}
                  disabled={isSucceeded}
                  className={cn(
                    "rounded-xl bg-[#1C2430] px-5 py-3.5 text-center text-sm/[19px] font-semibold text-white transition-all phone-sm-fix:px-8 phone-sm-fix:text-base",
                    answer.text === selectedVariant &&
                      "text-[#66FAFF] ring-2 ring-[#66FAFF]",
                    answer.text === selectedVariant &&
                      isFailed &&
                      "text-[#FF3E31] ring-2 ring-[#FF3E31]",
                    answer.text === selectedVariant &&
                      isSucceeded &&
                      "text-[#8FEB7B] ring-2 ring-[#8FEB7B]",
                  )}
                  onClick={() => {
                    if (isFailed) {
                      setIsFailed(false)
                    }
                    setSelectedVariant(answer.text)
                  }}
                >
                  {answer.text}
                </button>
              )
          })}
        </div>
      )}
      <button
        aria-label="go to previous slide"
        className="z-1 absolute inset-0 h-screen w-1/2 cursor-default bg-transparent"
        onClick={onPrevClick}
      />

      <>
        {isFailed ? (
          <span className="absolute bottom-24 flex items-center text-center text-sm font-semibold text-[#FF3E31] phone-sm-fix:text-base">
            {t("Неправильно")}
          </span>
        ) : (
          isSucceeded && (
            <span className="absolute bottom-24 flex items-center text-center text-sm font-semibold text-[#8BE874] phone-sm-fix:text-base">
              <SuccessCheckIcon className="w-6" />
              {t("Правильно")}!
            </span>
          )
        )}

        {buttonsLink.length === 0 ? (
          isSucceeded ? (
            <LargeButton
              className={cn(
                "absolute inset-x-3.5 w-auto",
                Telegram.WebApp.platform === "weba"
                  ? "bottom-4"
                  : "bottom-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
              )}
              appearance="green"
              hasRing
              contentClassName="gap-2.5"
              onClick={onNextClick}
            >
              {t("Продолжить")} <ArrowRight />
            </LargeButton>
          ) : (
            <LargeButton
              className={cn(
                "absolute inset-x-3.5 w-auto",
                Telegram.WebApp.platform === "weba"
                  ? "bottom-4"
                  : "bottom-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
              )}
              appearance="white"
              hasRing
              contentClassName="gap-2.5"
              disabled={
                (quizMode === "single"
                  ? selectedVariant === null
                  : selectedVariants.length === 0) || isFailed
              }
              onClick={submit}
            >
              {nextButtonTitle || t("Ответить")} <ArrowRight />
            </LargeButton>
          )
        ) : linkButtonTitle && linkButtonHref ? (
          <div
            className={cn(
              "absolute inset-x-3.5 flex gap-2",
              Telegram.WebApp.platform === "weba"
                ? "bottom-4"
                : "bottom-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
            )}
          >
            <LargeButton
              appearance="blue-radial"
              hasRing
              contentClassName="gap-2.5"
              onClick={() => {
                makeHapticFeedback({ impactOccured: "rigid" })
                openLinkWithTelegram(linkButtonHref)
              }}
            >
              {linkButtonTitle} <ForwardIcon className="h-5 w-5" />
            </LargeButton>

            {isSucceeded ? (
              <LargeButton
                appearance="green"
                hasRing
                contentClassName="gap-2.5"
                onClick={onNextClick}
              >
                {t("Продолжить")} <ArrowRight />
              </LargeButton>
            ) : (
              <LargeButton
                appearance="white"
                hasRing
                contentClassName="gap-2.5"
                disabled={
                  (quizMode === "single"
                    ? selectedVariant === null
                    : selectedVariants.length === 0) || isFailed
                }
                onClick={submit}
              >
                {nextButtonTitle || t("Ответить")} <ArrowRight />
              </LargeButton>
            )}
          </div>
        ) : isSucceeded ? (
          <LargeButton
            className={cn(
              "absolute inset-x-3.5 w-auto",
              Telegram.WebApp.platform === "weba"
                ? "bottom-4"
                : "bottom-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
            )}
            appearance="green"
            hasRing
            contentClassName="gap-2.5"
            onClick={onNextClick}
          >
            {t("Продолжить")} <ArrowRight />
          </LargeButton>
        ) : (
          <LargeButton
            className={cn(
              "absolute inset-x-3.5 w-auto",
              Telegram.WebApp.platform === "weba"
                ? "bottom-4"
                : "bottom-[max(var(--tg-safe-area-inset-bottom,16px),16px)]",
            )}
            appearance="white"
            hasRing
            contentClassName="gap-2.5"
            disabled={
              (quizMode === "single"
                ? selectedVariant === null
                : selectedVariants.length === 0) || isFailed
            }
            onClick={submit}
          >
            {nextButtonTitle || t("Ответить")} <ArrowRight />
          </LargeButton>
        )}
      </>
    </>
  )
}

export default Quiz
