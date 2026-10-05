import { useEffect } from "react"
import { RiveFile } from "@rive-app/react-webgl2"

import LessonDialog from "./components/LessonDialog"
import Final from "./blocks/Final"

import { Block, Lesson as LessonType } from "@/types/learn"

import { Sound } from "@/utils/Sound"

const finalScreenSound = new Sound(
  "https://s3-nutsfarm.crypton.xyz/sounds/final.mp3",
)

const EmptyLessonDialog = ({
  open,
  onOpenChange,
  activeBlock,
  lessonBlocks,
  healthPoints,
  openedLessonId,
  currentLesson,
  finish,
  wrongCount,
  elapsedTime,
  riveFile,
}: {
  open: boolean
  openedLessonId: string | null
  currentLesson: LessonType
  onOpenChange: (open: boolean) => void
  activeBlock: number
  lessonBlocks: Block[]
  healthPoints: number
  wrongCount: number
  elapsedTime: number
  finish: () => void
  riveFile: RiveFile | null
}) => {
  const { mark, isClaimed, reward, nutPassXp } = currentLesson

  useEffect(() => {
    Promise.all([finalScreenSound.load()])
  }, [])

  if (openedLessonId)
    return (
      <LessonDialog
        open={open}
        onOpenChange={onOpenChange}
        activeBlock={activeBlock}
        totalBlocks={lessonBlocks.length}
        healthPoints={healthPoints}
      >
        <Final
          mark={mark}
          onFinish={finish}
          mode="easy"
          isClaimed={isClaimed}
          lessonId={openedLessonId}
          reward={reward}
          nutPassXp={nutPassXp}
          statistic={{
            missmatches: wrongCount,
            percentage: 90,
            time: elapsedTime,
          }}
          riveFile={riveFile || undefined}
          sound={finalScreenSound}
        />
      </LessonDialog>
    )
}

export default EmptyLessonDialog
