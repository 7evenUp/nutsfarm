import { useEffect, useMemo, useRef, useState } from "react"
import { useRiveFile } from "@rive-app/react-webgl2"
import { useNavigate } from "react-router-dom"

import EmptyLessonDialog from "./EmptyLessonDialog"
import LessonContent from "./LessonContent"

import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import {
  appendLessonProgress,
  removeLessonProgress,
  setOpenedLessonId,
} from "@/redux/slices/lesson"

import { Block, Lesson as LessonType } from "@/types/learn"

import {
  BackButton,
  initBackButton,
  RemoveEventListenerFn,
} from "@/demo/telegram-sdk"

let backButton: BackButton

if (true) {
  try {
    const [initializedBackButton] = initBackButton()
    backButton = initializedBackButton
  } catch {
    /* empty */
  }
}

const Lesson = ({
  lessonsList,
}: {
  lessonsList: (LessonType & { isActive: boolean })[]
}) => {
  const navigate = useNavigate()

  const dispatch = useAppDispatch()

  const [open, setOpen] = useState(false)
  const [activeBlock, setActiveBlock] = useState(0)
  const [isFinal, setIsFinal] = useState(false)
  const [lessonBlocks, setLessonBlocks] = useState<Block[] | null>(null)
  const [lessonInfoBlocks, setLessonInfoBlocks] = useState<Block[] | null>(null)
  const [wrongCount, setWrongCount] = useState<number>(0)
  const [elapsedTime, setElapsedTime] = useState<number>(0)
  const [currentLesson, setCurrentLesson] = useState<LessonType | null>(null)
  const [warningOpen, setWarningOpen] = useState<boolean>(false)

  const [hasQuizPreviewShown, setHasQuizPreviewShown] = useState(false)
  const [hasMatchingPreviewShown, setHasMatchingPreviewShown] = useState(false)
  const [claimedLessonPreview, setClaimedLessonPreview] = useState<
    "full" | "easy" | null
  >(null)

  const lang = useAppSelector((state) => state.language.value)
  const healthPoints = useAppSelector((state) => state.health.healthPoints)
  const openedLessonId = useAppSelector((state) => state.lesson.openedLessonId)
  const lessonsProgress = useAppSelector(
    (state) => state.lesson.lessonsProgress,
  )
  const selectedModuleId = useAppSelector(
    (state) => state.selectedModule.selectedModuleId,
  )

  const claimedLessons = useMemo(() => {
    return lessonsList.filter((lesson) => lesson.isClaimed)
  }, [lessonsList])

  const startTimeRef = useRef<number | null>(null)

  // Кеширование rive анимаций
  const { riveFile: sleepyAnimation } = useRiveFile({
    src: "/sleepy_1.riv",
  })
  const { riveFile: sigmaAnimation } = useRiveFile({
    src: "/sigma.riv",
  })
  const { riveFile: studentQuizAnimation } = useRiveFile({
    src: "/student_1.riv",
  })
  const { riveFile: studentMatchAnimation } = useRiveFile({
    src: "/student_2.riv",
  })

  // Кеширование фоток следующих блоков для более приятного взаимодействия пользователя
  useEffect(() => {
    if (!lessonBlocks || lessonBlocks.length <= 1) return
    if (activeBlock + 1 >= lessonBlocks.length) return

    const nextBlock = lessonBlocks[activeBlock + 1]

    if (nextBlock.type !== "INFO") return

    const cacheNextBlockImage = async () => {
      const promise = new Promise((resolve, reject) => {
        if (lang === "RU") {
          if (!nextBlock.image) return

          const img = new Image()
          img.src = nextBlock.image
          img.onload = resolve
          img.onerror = reject
        }

        if (lang === "EN") {
          if (!nextBlock.imageEn) return

          const img = new Image()
          img.src = nextBlock.imageEn
          img.onload = resolve
          img.onerror = reject
        }
      })

      await promise
    }

    cacheNextBlockImage()
  }, [activeBlock, lessonBlocks])

  useEffect(() => {
    if (openedLessonId === null) {
      setOpen(false)
      return
    }

    const neededLesson = lessonsList.find(
      (lesson) => lesson.id === openedLessonId,
    )

    if (neededLesson && neededLesson.blocks) {
      setCurrentLesson(neededLesson)
      setLessonBlocks([...neededLesson.blocks])
      setLessonInfoBlocks(
        neededLesson.blocks.filter((block) => block.type === "INFO"),
      )
      setActiveBlock(0)
      setOpen(true)

      startTimeRef.current = Date.now()
    }
  }, [openedLessonId])

  const resetState = () => {
    setHasMatchingPreviewShown(false)
    setHasQuizPreviewShown(false)
    setClaimedLessonPreview(null)

    setActiveBlock(0)
    setOpen(false)
    setIsFinal(false)
    setLessonBlocks(null)
    setLessonInfoBlocks(null)
    setWrongCount(0)
    setElapsedTime(0)
    dispatch(setOpenedLessonId(null))
  }

  // BackButton listener
  useEffect(() => {
    if (!backButton) return

    if (isFinal) {
      backButton.hide()
      return
    }

    let rmListener: RemoveEventListenerFn
    if (open) {
      backButton.show()
      rmListener = backButton.on("click", () => {
        if (!warningOpen) setWarningOpen(true)
      })
    } else {
      backButton.hide()
    }

    return () => {
      if (rmListener) {
        rmListener()
      }
    }
  }, [open, isFinal])

  useEffect(() => {
    if (!open) resetState()
  }, [open])

  const firstQuizId = useMemo(() => {
    if (!lessonBlocks || lessonBlocks.length === 0) return null

    const quizBlocks = lessonBlocks.filter((block) => block.type === "QUIZ")

    if (quizBlocks.length === 0) return null

    return quizBlocks[0].id
  }, [lessonBlocks])

  // for activation lesson progress
  useEffect(() => {
    if (!openedLessonId) return

    const progress = lessonsProgress[openedLessonId]
    if (!progress) return

    setClaimedLessonPreview(progress.type)
    setActiveBlock(progress.lastpage)
  }, [openedLessonId, lessonsProgress])

  // Поиск id первого Game блока в модуле для отображения правил мэтчинга
  const firstGameIdInModule = useMemo(() => {
    if (!lessonsList || lessonsList.length === 0) return null
    if (selectedModuleId === null) return null

    const gameBlocks = lessonsList
      .filter((lesson) => lesson.moduleId === selectedModuleId)
      .flatMap((lesson) => lesson.blocks)
      .filter((block) => block?.type === "GAME")

    if (gameBlocks.length === 0) return null

    if (!gameBlocks[0]) return null

    return gameBlocks[0].id
  }, [lessonsList, selectedModuleId])

  if (!lessonBlocks || !lessonInfoBlocks) return

  // Переключение на следующий блок
  const nextLesson = () => {
    if (activeBlock + 1 === lessonBlocks.length) {
      if (startTimeRef.current)
        setElapsedTime(Date.now() - startTimeRef.current)

      setIsFinal(true)
      setActiveBlock((prev) => prev + 1)
    } else {
      setActiveBlock((prev) => prev + 1)
    }
  }

  // Переключение на следующий информационный блок в облеченному  режиме перепроходления
  const nextInfoLesson = () => {
    if (activeBlock + 1 === lessonInfoBlocks.length) {
      if (startTimeRef.current)
        setElapsedTime(Date.now() - startTimeRef.current)

      setIsFinal(true)
      setActiveBlock((prev) => prev + 1)
    } else {
      setActiveBlock((prev) => prev + 1)
    }
  }

  // Возрат к предыдудщему блоку урока
  const previousLesson = () => {
    if (activeBlock > 0) {
      setActiveBlock((prev) => prev - 1)
    }
  }

  // Функция вызывающаяся при успешном завершении урока, для обнолвения спика уроков и для сброса необходимых состояний
  const finish = async () => {
    if (openedLessonId) dispatch(removeLessonProgress(openedLessonId))
    resetState()

    // Первый визит приложения и первый проход урока
    let storageValue: string | null

    if (!Telegram.WebApp.initData) {
      storageValue = localStorage.getItem("first-visit")
    } else {
      // @ts-expect-error Not-in-telegram-environment
      storageValue = await cloudStorage.get("first-visit")
    }

    if (storageValue && storageValue === "false") {
      if (claimedLessons.length <= 1) {
        navigate("/pass?showOnboarding=true")
      }
    }
  }

  // Функция эмитирующая колбэк нажатия на backbutton или swipeback
  const handleBackButton = () => {
    if (!warningOpen) setWarningOpen(true) // for tests with tmp back button
  }

  // Функция вызывающаяся после подтвердления закрытия урока
  const stopLesson = () => {
    // if (openedLessonId) dispatch(removeLessonProgress(openedLessonId))

    if (openedLessonId && claimedLessonPreview)
      dispatch(
        appendLessonProgress({
          lessonId: openedLessonId,
          type: claimedLessonPreview,
          lastpage: activeBlock,
        }),
      )
    resetState()
  }

  // Функция вызывающаяся при неудачном завершении урока, для обнолвения спика уроков и для сброса необходимых состояний
  const failed = () => {
    setOpen(false)
    dispatch(setOpenedLessonId(null))
    setActiveBlock(0)
    setIsFinal(false)
    setLessonBlocks(null)
  }

  const handleWrongAnswer = () => {
    setWrongCount((prev) => prev + 1)
  }

  if (healthPoints === null) return

  // Обработка исключения на пустой урок
  if (lessonBlocks.length === 0 && currentLesson) {
    return (
      <EmptyLessonDialog
        open={open}
        onOpenChange={setOpen}
        activeBlock={activeBlock}
        lessonBlocks={lessonBlocks}
        healthPoints={healthPoints}
        openedLessonId={openedLessonId}
        currentLesson={currentLesson}
        finish={finish}
        wrongCount={wrongCount}
        elapsedTime={elapsedTime}
        riveFile={sigmaAnimation}
      />
    )
  }

  if (currentLesson && openedLessonId)
    return (
      <LessonContent
        open={open}
        onOpenChange={setOpen}
        warningOpen={warningOpen}
        setWarningOpen={setWarningOpen}
        activeBlock={activeBlock}
        lessonBlocks={lessonBlocks}
        lessonInfoBlocks={lessonInfoBlocks}
        currentLesson={currentLesson}
        isFinal={isFinal}
        lang={lang}
        nextLesson={nextLesson}
        previousLesson={previousLesson}
        nextInfoLesson={nextInfoLesson}
        finish={finish}
        failed={failed}
        stopLesson={stopLesson}
        handleBackButton={handleBackButton}
        handleWrongAnswer={handleWrongAnswer}
        hasQuizPreviewShown={hasQuizPreviewShown}
        setHasQuizPreviewShown={setHasQuizPreviewShown}
        hasMatchingPreviewShown={hasMatchingPreviewShown}
        setHasMatchingPreviewShown={setHasMatchingPreviewShown}
        claimedLessonPreview={claimedLessonPreview}
        setClaimedLessonPreview={setClaimedLessonPreview}
        firstQuizId={firstQuizId}
        firstGameIdInModule={firstGameIdInModule}
        healthPoints={healthPoints}
        elapsedTime={elapsedTime}
        wrongCount={wrongCount}
        openedLessonId={openedLessonId}
        riveFiles={{
          sigmaAnimation,
          sleepyAnimation,
          studentMatchAnimation,
          studentQuizAnimation,
        }}
      />
    )
}

export default Lesson
