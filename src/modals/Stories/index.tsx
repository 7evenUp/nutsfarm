import React, { useEffect, useRef, useState } from "react"
import { Description, DialogClose } from "@radix-ui/react-dialog"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import CloseIcon from "@/assets/icons/close.svg?react"
import CoinPng from "@/assets/images/coin.png"

import StoryPartsPreview from "./StoryPartsPreview"

import { Sheet, SheetContent, SheetTitle } from "@/shared/ui/SideSheet"

import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { useGetCurrentUserQuery } from "@/redux/api/user"
import {
  useGetCurrentStoriesQuery,
  useGetStoryByIdQuery,
  useReadStoryMutation,
} from "@/redux/api/stories"
import { setOpenedStoryId } from "@/redux/slices/story"

import { useHandleBackButton } from "@/hooks/useHandleBackButton"
import { useRafThrottle } from "@/hooks/useRafThrottle"

import { numberWithSpaces } from "@/utils/numberWithSpaces"

const StoriesDialog = () => {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)
  const [translateY, setTranslateY] = useState(0)
  const [storyPartIndex, setStoryPartIndex] = useState<null | number>(null)
  const startY = useRef<number | null>(null)

  const dispatch = useAppDispatch()
  const { openedStoryId } = useAppSelector((state) => state.story)

  const [read, { data: currentStoryData, isLoading, reset }] =
    useReadStoryMutation()
  const { data: currentStories, isFetching: isCurrentStoriesFetching } =
    useGetCurrentStoriesQuery()
  const { refetch: refetchCurrentUser } = useGetCurrentUserQuery()
  const { data: story } = useGetStoryByIdQuery(
    { storyId: openedStoryId! },
    { skip: openedStoryId === undefined || openedStoryId === null },
  )

  const refetchData = () => {
    refetchCurrentUser()
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
  }

  const handleTouchMove = useRafThrottle((e: React.TouchEvent) => {
    if (startY.current === null) return

    const currentY = e.touches[0].clientY
    const diffY = currentY - startY.current

    if (diffY > 0) {
      setTranslateY(diffY)
    }
  })

  const handleTouchEnd = () => {
    if (translateY > 100) {
      setOpen(false)
      refetchData()

      setTimeout(() => {
        setTranslateY(0)
      }, 250)
    } else {
      setTranslateY(0) // Возвращаем модалку в исходное положение
    }
    startY.current = null
  }

  // Сбрасываем translateY после закрытия модалки
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      refetchData()
      setTranslateY(0)
    }
  }

  // Используем хук для обработки кнопки "Назад"
  useHandleBackButton(open, () => {
    setOpen(false)
    refetchData()
  })

  useEffect(() => {
    if (openedStoryId === null) {
      setOpen(false)
      refetchData()
    } else {
      setOpen(true)
    }
  }, [openedStoryId])

  useEffect(() => {
    if (!open) {
      dispatch(setOpenedStoryId(null))
      setStoryPartIndex(null)

      if (currentStoryData)
        toast(
          <div className="flex w-auto flex-wrap items-center font-bold">
            <img
              src={CoinPng}
              alt="Nuts coin icon"
              className="mr-2.5 h-10 w-10"
            />
            <span className="text-[#FED900]">
              {`${t("Получено")} ${numberWithSpaces(currentStoryData)} NUTS`}
            </span>
          </div>,
          {
            className: "justify-center",
          },
        )
      reset()
    }
  }, [open])

  useEffect(() => {
    if (storyPartIndex === null || !story) return

    if (!story) return

    // Кешируем фотку некст стори парта
    if (storyPartIndex !== story.storyParts.length - 1) {
      const img = new Image()
      img.src = story.storyParts[storyPartIndex + 1].image
    }

    // Если на последнем стори парте
    if (storyPartIndex === story.storyParts.length - 1) {
      // Если уже читали, то не отправляем лишний HTTP запрос
      if (
        currentStories &&
        currentStories.find(
          (currentStory) => currentStory.story.id === story.id,
        )
      )
        return

      // Если http запрос уже выполняется, то скипаем
      if (isLoading || isCurrentStoriesFetching) return

      read({ storyId: story.id })
    }
  }, [storyPartIndex])

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        className="h-[100dvh] rounded-t-none p-0 focus:outline-none"
        style={{ bottom: -translateY }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <SheetTitle className="sr-only">
          Instagram like story modal where you can see the story's content
        </SheetTitle>
        <Description className="sr-only">
          Instagram like story modal where you can see the story's content
        </Description>
        <StoryPartsPreview setStoryPartIndex={setStoryPartIndex} />
        <DialogClose className="fixed right-2 top-[7px] z-[1002] focus:outline-none phone-sm:top-[5px]">
          <CloseIcon className="h-5 w-5 text-white/50 drop-shadow-[0_0_1px_rgba(0,0,0,1)] phone-sm:h-6 phone-sm:w-6" />
        </DialogClose>
      </SheetContent>
    </Sheet>
  )
}

export default StoriesDialog
