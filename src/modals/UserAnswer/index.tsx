import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Description } from "@radix-ui/react-dialog"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/shared/ui/Dialog"
import { LargeButton } from "@/shared/ui/LargeButton"

import { cn } from "@/lib/cn"

const openLinkWithTelegram = (link: string) => {
  if (!link) return

  link.includes("https://t.me")
    ? Telegram.WebApp.openTelegramLink(link)
    : Telegram.WebApp.openLink(link, { try_instant_view: true })
}

const MarkdownLink = ({
  markdown,
  className,
  buttonClassName,
}: {
  markdown: string
  className?: string
  buttonClassName?: string
}) => {
  if (!markdown) return ""

  const parseMarkdownLinks = (text: string) => {
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g
    const parts = []
    let lastIndex = 0
    let match

    // Iterate through all matches
    while ((match = regex.exec(text)) !== null) {
      const [fullMatch, linkText, href] = match

      if (!fullMatch) return

      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index))
      }

      // Add the link as a React component
      parts.push(
        <button
          onClick={() => openLinkWithTelegram(href)}
          key={href}
          className={buttonClassName}
        >
          {linkText}
        </button>,
      )

      // Update the lastIndex to the end of this match
      lastIndex = regex.lastIndex
    }

    // Add any remaining text after the last link
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex))
    }

    return parts
  }

  return <h2 className={className}>{parseMarkdownLinks(markdown)}</h2>
}

const UserAnswerDialog = ({
  children,
  title,
  description,
  onClick,
  isError,
}: {
  children: React.ReactNode
  title: string
  description: string
  onClick: (answer: string) => void
  isError: boolean
}) => {
  const { t } = useTranslation()

  const [answer, setAnswer] = useState("")

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <Description className="sr-only">User answer task modal</Description>
        <DialogHeader>{t("Проверка задания")}</DialogHeader>
        <div className="flex flex-1 flex-col gap-4">
          <div className="mt-2">
            <h2 className="text-base text-white">{title}</h2>
            <MarkdownLink
              markdown={description}
              className="mt-1 text-sm text-white/75"
              buttonClassName="underline underline-offset-2"
            />
          </div>
          <div>
            <input
              className={cn(
                "flex h-14 w-full items-center justify-center gap-4 rounded-[14px] border-2 border-[#17202D] bg-transparent px-3 font-tt-hoves text-base font-semibold text-white outline-none transition-colors focus:border-[#405169]",
                isError && "border-red-400 focus:border-red-500",
              )}
              placeholder={t("Введите ваш ответ")}
              value={answer}
              onChange={(evt) => setAnswer(evt.currentTarget.value)}
            />
            {isError && (
              <p className="ml-1 mt-2 text-sm font-semibold text-red-300">
                {t("Ответ неверный, попробуйте ещё раз")}
              </p>
            )}
          </div>

          <div className="mt-auto flex flex-col gap-3">
            <LargeButton
              appearance="yellow-linear"
              onClick={() => {
                if (answer.trim().length > 0) {
                  onClick(answer.trim())
                }
              }}
            >
              {t("Проверить")}
            </LargeButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UserAnswerDialog
