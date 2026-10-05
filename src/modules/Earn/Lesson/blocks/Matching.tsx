import { useEffect, useState } from "react"
import { t } from "i18next"
import { RiveFile } from "@rive-app/react-webgl2"

import ArrowRight from "../components/ArrowRight"
import ForwardIcon from "@/assets/icons/forward.svg?react"
import SuccessCheckIcon from "@/assets/icons/check-success.svg?react"

import MatchingPreview from "./MatchingPreview"

import { LargeButton } from "@/shared/ui/LargeButton"

import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { loseHealth } from "@/redux/slices/health"
import { useDecreaseHealthMutation } from "@/redux/api/learn"

import { Match, MatchingGame } from "@/types/learn"

import { openLinkWithTelegram } from "@/utils/openLink"
import { isImageFile } from "@/utils/isImageString"
import { Sound } from "@/utils/Sound"
import { makeHapticFeedback } from "@/utils/makeHapticFeedback"

import { cn } from "@/lib/cn"

const matchColors = ["#FDF356", "#66FAFF", "#85E063", "#A4A8FF"]

const shuffleMatches = (matchers: Match[]): (Match & { color: string })[] => {
  const definitions = matchers.map((match) => match.definition)

  // Перемешиваем массив определений
  for (let i = definitions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[definitions[i], definitions[j]] = [definitions[j], definitions[i]]
  }

  // Создаем новый массив объектов Match с перемешанными определениями
  const shuffledMatches = matchers.map((match, index) => ({
    word: match.word,
    color: matchColors[index % matchColors.length],
    definition: definitions[index],
  }))

  return shuffledMatches
}

const Matching = ({
  goToNextLesson,
  goToPreviousLesson,
  readMatchingPreview,
  handleWrongAnswer,
  matchers,
  buttons,
  needToShowPreview,
  isClaimed,
  description,
  riveFile,
  previewSound,
  successSound,
  nextSound,
}: MatchingGame & {
  goToNextLesson: () => void
  goToPreviousLesson: () => void
  readMatchingPreview: () => void
  handleWrongAnswer: () => void
  needToShowPreview: boolean
  isClaimed: boolean
  riveFile: RiveFile | undefined
  previewSound: Sound
  successSound: Sound
  nextSound: Sound
}) => {
  const dispatch = useAppDispatch()

  const lang = useAppSelector((state) => state.language.value)

  const [decrease] = useDecreaseHealthMutation()

  const [isSucceeded, setIsSucceeded] = useState(false)
  const [selectedWord, setSelectedWord] = useState<Match | null>(null)
  const [selectedDefinition, setSelectedDefinition] = useState<string | null>(
    null,
  )
  const [matches, setMatches] = useState<Match[]>([])
  const [shuffledWords, setShuffledWords] = useState<
    (Match & { color: string })[]
  >([])
  const [hasPreviewShown, setHasPreviewShown] = useState(false)

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
    if (matchers) {
      setShuffledWords(shuffleMatches(matchers))
    }
  }, [matchers])

  useEffect(() => {
    if (needToShowPreview && !hasPreviewShown) {
      previewSound.play()
    } else {
      nextSound.play()
    }
  }, [matchers, needToShowPreview, hasPreviewShown])

  const onWordClick = (word: Match) => {
    const trulyPair = matchers?.find((el) => el.word === word.word)
    if (trulyPair) {
      setSelectedWord(trulyPair)
      setSelectedDefinition(null) // сбросить выбранное определение
    }
  }

  const onDefinitionClick = (definition: string) => {
    if (selectedWord) {
      if (definition === selectedWord.definition) {
        setMatches([...matches, selectedWord])
        setSelectedWord(null)
        setSelectedDefinition(null)
        makeHapticFeedback({ notificationOccured: 'success' })
        if (matches.length + 1 === matchers?.length) {
          successSound.play()
          setIsSucceeded(true)
        }
      } else {
        setSelectedDefinition(definition)
        makeHapticFeedback({ notificationOccured: 'error' })

        handleWrongAnswer()
        if (!isClaimed) {
          decrease()
          dispatch(loseHealth())
        }
      }
    }
  }

  const onNextClick = () => {
    makeHapticFeedback({ impactOccured: "rigid" })
    setMatches([])
    setIsSucceeded(false)
    goToNextLesson()
  }

  const matchColor = (match: Match & { color: string }) => {
    return shuffledWords.find(
      (elem) =>
        elem.word ===
        matchers?.find((el) => el.definition === match.definition)?.word,
    )?.color
  }

  if (needToShowPreview && !hasPreviewShown)
    return (
      <MatchingPreview
        onClick={() => {
          setHasPreviewShown(true)
          readMatchingPreview()
        }}
        riveFile={riveFile}
      />
    )

  if (!matchers)
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

  return (
    <>
      {isSucceeded ? (
        <span className="mb-6 mt-8 flex items-center gap-2 px-3.5 text-sm text-white phone-xsm:mb-8 phone-xsm:mt-10 phone-sm:mb-16 phone-sm:mt-12 phone-sm-fix:text-base">
          <SuccessCheckIcon className="w-6" />
          {t("Отличная работа")}
        </span>
      ) : (
        <span className="mb-6 mt-8 px-3.5 text-sm text-white/75 phone-xsm:mb-8 phone-xsm:mt-10 phone-sm-fix:mb-16 phone-sm-fix:mt-12 phone-sm-fix:text-base">
          {description ? description : t("Сопоставь слова и их определения:")}
        </span>
      )}
      {matchers && (
        <div className="z-50 flex w-full flex-col gap-2 px-3.5">
          {shuffledWords.map((match, i) => (
            <div
              className="flex min-h-[70px] gap-2 phone-sm-fix:min-h-[80px]"
              key={i}
            >
              <button
                onClick={() => onWordClick(match)}
                disabled={!!matches.find((el) => match.word === el.word)}
                className="flex w-[100px] shrink-0 items-center justify-center rounded-xl bg-[#1C2430] text-sm font-semibold ring-2 phone-sm-fix:w-[110px] phone-sm-fix:text-base"
                style={{
                  boxShadow:
                    selectedWord?.word === match.word
                      ? selectedDefinition
                        ? "var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) red"
                        : `var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) ${match.color}`
                      : matches.find((el) => match.word === el.word)
                        ? match.color
                        : "var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) transparent",
                }}
              >
                {isImageFile(match.word) ? (
                  <img className="h-10 w-10 object-cover" src={match.word} />
                ) : (
                  match.word
                )}
              </button>
              <button
                onClick={() => onDefinitionClick(match.definition)}
                disabled={
                  !!selectedDefinition ||
                  !selectedWord ||
                  !!matches.find((el) => el.definition === match.definition)
                }
                className="flex w-full items-center justify-center rounded-xl bg-[#1C2430] p-4 text-sm font-semibold ring-2 phone-sm-fix:text-base"
                style={{
                  boxShadow:
                    selectedDefinition === match.definition
                      ? "var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) red"
                      : matches.find((el) => match.definition === el.definition)
                        ? `var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) ${matchColor(match)}`
                        : "var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) transparent",
                }}
              >
                {match.definition}
              </button>
            </div>
          ))}
        </div>
      )}
      <div
        className="absolute inset-0 h-screen w-1/2 bg-transparent"
        onClick={() => goToPreviousLesson()}
      />

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
            disabled
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
              disabled
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
          disabled
        >
          {nextButtonTitle || t("Ответить")} <ArrowRight />
        </LargeButton>
      )}
    </>
  )
}

export default Matching
