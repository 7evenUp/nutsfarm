import { RiveFile } from "@rive-app/react-webgl2"

// components
import Failed from "./blocks/Failed"
import LessonDialog from "./components/LessonDialog"

// types
import { Block } from "@/types/learn"

const GameOverDialog = ({
  open,
  onOpenChange,
  activeBlock,
  lessonBlocks,
  healthPoints,
  failed,
  riveFile,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeBlock: number
  lessonBlocks: Block[]
  healthPoints: number
  failed: () => void
  riveFile: RiveFile | null
}) => (
  <LessonDialog
    open={open}
    onOpenChange={onOpenChange}
    activeBlock={activeBlock}
    totalBlocks={lessonBlocks.length}
    healthPoints={healthPoints}
  >
    <Failed onReturn={failed} riveFile={riveFile || undefined} />
  </LessonDialog>
)

export default GameOverDialog
