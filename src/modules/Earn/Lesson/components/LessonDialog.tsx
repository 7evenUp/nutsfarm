import React from "react"

// components
import LessonHeader from "./LessonHeader"

// ui
import { Dialog, DialogContent, DialogHeader } from "@/shared/ui/Dialog"
import { Description } from "@radix-ui/react-dialog"

const LessonDialog = ({
  open,
  onOpenChange,
  activeBlock,
  totalBlocks,
  healthPoints,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeBlock: number
  totalBlocks: number
  healthPoints: number
  children: React.ReactNode
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="items-center overflow-hidden rounded-t-none p-0">
      <DialogHeader className="sr-only">Lesson</DialogHeader>
      <Description className="sr-only">Lesson</Description>
      <div className="relative flex h-screen w-screen flex-col items-center">
        <LessonHeader
          activeBlock={activeBlock}
          totalBlocks={totalBlocks}
          healthPoints={healthPoints ?? 0}
        />
        {children}
      </div>
    </DialogContent>
  </Dialog>
)

export default LessonDialog
