import { Dispatch, SetStateAction, useEffect } from "react"
import { RiveFile } from "@rive-app/react-webgl2"

import ClaimedLessonPreview from "./blocks/ClaimedLessonPreview"
import Matching from "./blocks/Matching"
import Failed from "./blocks/Failed"
import Final from "./blocks/Final"
import Learn from "./blocks/Learn"
import Quiz from "./blocks/Quiz"

import LessonDialog from "./components/LessonDialog"
import AlertPopUp from "./components/AlertPopUp"

import { Sound } from "@/utils/Sound"

import { Block, Lesson } from "@/types/learn"

const finalScreenSound = new Sound(
  "/sounds/final.mp3",
)
const nextClickSound = new Sound(
  "/sounds/next.mp3",
)
const previewStartsSound = new Sound(
  "/sounds/preview.mp3",
)
const successQuizSound = new Sound(
  "/sounds/quiz-success.mp3",
)

const LessonContent = ({
  failed,
  open,
  activeBlock,
  lessonBlocks,
  lessonInfoBlocks,
  healthPoints,
  currentLesson,
  isFinal,
  lang,
  onOpenChange,
  nextLesson,
  previousLesson,
  nextInfoLesson,
  finish,
  stopLesson,
  warningOpen,
  setWarningOpen,
  handleWrongAnswer,
  hasQuizPreviewShown,
  setHasQuizPreviewShown,
  hasMatchingPreviewShown,
  setHasMatchingPreviewShown,
  claimedLessonPreview,
  setClaimedLessonPreview,
  firstQuizId,
  firstGameIdInModule,
  elapsedTime,
  wrongCount,
  openedLessonId,
  riveFiles,
}: {
  finish: () => void
  failed: () => void
  stopLesson: () => void
  nextLesson: () => void
  nextInfoLesson: () => void
  previousLesson: () => void
  handleWrongAnswer: () => void
  handleBackButton: () => void
  onOpenChange: (open: boolean) => void
  setWarningOpen: Dispatch<SetStateAction<boolean>>
  setHasQuizPreviewShown: (open: boolean) => void
  setHasMatchingPreviewShown: (open: boolean) => void
  setClaimedLessonPreview: (state: "easy" | "full") => void
  open: boolean
  warningOpen: boolean
  activeBlock: number
  lessonBlocks: Block[]
  lessonInfoBlocks: Block[]
  currentLesson: Lesson
  lang: "EN" | "RU"
  isFinal: boolean
  riveFiles: {
    sleepyAnimation: RiveFile | null
    sigmaAnimation: RiveFile | null
    studentQuizAnimation: RiveFile | null
    studentMatchAnimation: RiveFile | null
  }
  firstQuizId: string | null
  firstGameIdInModule: string | null
  claimedLessonPreview: "easy" | "full" | null
  hasQuizPreviewShown: boolean
  hasMatchingPreviewShown: boolean
  openedLessonId: string
  wrongCount: number
  elapsedTime: number
  healthPoints: number
}) => {
  const { mark, isClaimed, reward, nutPassXp } = currentLesson

  useEffect(() => {
    Promise.all([
      finalScreenSound.load(),
      nextClickSound.load(),
      previewStartsSound.load(),
      successQuizSound.load(),
    ])
  }, [])

  return (
    <LessonDialog
      open={open}
      onOpenChange={onOpenChange}
      activeBlock={activeBlock}
      totalBlocks={
        claimedLessonPreview === "easy"
          ? lessonInfoBlocks.length
          : lessonBlocks.length
      }
      healthPoints={healthPoints}
    >
      <AlertPopUp
        open={warningOpen}
        setOpen={setWarningOpen}
        handleCloseLesson={stopLesson}
      />
      {/*  Relearn Lesson, select easy or full mode  */}
      {currentLesson.isClaimed && !claimedLessonPreview ? (
        <ClaimedLessonPreview
          riveFile={riveFiles.studentMatchAnimation || undefined}
          selectVariant={setClaimedLessonPreview}
        />
      ) : // Claimed Lesson only with easy only INFO mode
      isClaimed && claimedLessonPreview === "easy" && lessonInfoBlocks ? (
        isFinal ? (
          <Final
            mark={mark}
            onFinish={finish}
            isClaimed={isClaimed}
            lessonId={openedLessonId}
            reward={reward}
            nutPassXp={nutPassXp}
            mode="easy"
            statistic={{
              missmatches: wrongCount,
              percentage: 90,
              time: elapsedTime,
            }}
            riveFile={riveFiles.sigmaAnimation || undefined}
            sound={finalScreenSound}
          />
        ) : (
          <Learn
            {...(lang === "RU"
              ? lessonInfoBlocks[activeBlock].body
              : lessonInfoBlocks[activeBlock].bodyEn)}
            image={lessonInfoBlocks[activeBlock].image}
            imageEn={lessonInfoBlocks[activeBlock].imageEn}
            buttons={lessonInfoBlocks[activeBlock].buttons}
            goToNextLesson={nextInfoLesson}
            goToPreviousLesson={previousLesson}
            sound={nextClickSound}
            isEasyMode={true}
          />
        )
      ) : healthPoints === 0 ? (
        <Failed
          onReturn={failed}
          riveFile={riveFiles.sleepyAnimation || undefined}
        />
      ) : // Claimed lesson with full game mode
      isFinal ? (
        <Final
          mark={mark}
          onFinish={finish}
          mode="full"
          isClaimed={isClaimed}
          lessonId={openedLessonId}
          reward={reward}
          nutPassXp={nutPassXp}
          statistic={{
            missmatches: wrongCount,
            percentage: 90,
            time: elapsedTime,
          }}
          riveFile={riveFiles.sigmaAnimation || undefined}
          sound={finalScreenSound}
        />
      ) : lessonBlocks[activeBlock].type === "INFO" ? (
        <Learn
          {...(lang === "RU"
            ? lessonBlocks[activeBlock].body
            : lessonBlocks[activeBlock].bodyEn)}
          image={lessonBlocks[activeBlock].image}
          imageEn={lessonBlocks[activeBlock].imageEn}
          buttons={lessonBlocks[activeBlock].buttons}
          goToNextLesson={nextLesson}
          goToPreviousLesson={previousLesson}
          sound={nextClickSound}
        />
      ) : lessonBlocks[activeBlock].type === "QUIZ" ? (
        <Quiz
          {...(lang === "RU"
            ? lessonBlocks[activeBlock].body
            : lessonBlocks[activeBlock].bodyEn)}
          goToNextLesson={nextLesson}
          goToPreviousLesson={previousLesson}
          isClaimed={isClaimed}
          buttons={lessonBlocks[activeBlock].buttons}
          handleWrongAnswer={handleWrongAnswer}
          needToShowPreview={
            lessonBlocks[activeBlock].id === firstQuizId && !hasQuizPreviewShown
          }
          readQuizPreview={() => setHasQuizPreviewShown(true)}
          riveFile={riveFiles.studentQuizAnimation}
          previewSound={previewStartsSound}
          successSound={successQuizSound}
          nextSound={nextClickSound}
        />
      ) : (
        lessonBlocks[activeBlock].type === "GAME" && (
          <Matching
            {...(lang === "RU"
              ? lessonBlocks[activeBlock].body
              : lessonBlocks[activeBlock].bodyEn)}
            goToNextLesson={nextLesson}
            goToPreviousLesson={previousLesson}
            isClaimed={isClaimed}
            handleWrongAnswer={handleWrongAnswer}
            buttons={lessonBlocks[activeBlock].buttons}
            readMatchingPreview={() => setHasMatchingPreviewShown(true)}
            needToShowPreview={
              lessonBlocks[activeBlock].id === firstGameIdInModule &&
              !hasMatchingPreviewShown
            }
            riveFile={riveFiles.studentMatchAnimation}
            previewSound={previewStartsSound}
            successSound={successQuizSound}
            nextSound={nextClickSound}
          />
        )
      )}
    </LessonDialog>
  )
}

export default LessonContent
