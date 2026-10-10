import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Description } from "@radix-ui/react-dialog"

import CopyIcon from "@/assets/icons/copy.svg?react"
import CheckIcon from "@/assets/icons/check.svg?react"
import ForwardIcon from "@/assets/icons/forward.svg?react"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/shared/ui/SideSheet"

import { useGetCurrentUserQuery } from "@/redux/api/user"


const InviteFriendDialog = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation()

  const [isCopied, setIsCopied] = useState(false)

  const { data: currentUser } = useGetCurrentUserQuery()

  if (!currentUser) return

  const link = window.location.origin + "/?ref=" + currentUser.referralCode
  const onCopyClick = async () => {
    try { await navigator.clipboard.writeText(link); setIsCopied(true); setTimeout(() => setIsCopied(false), 3000) } catch { window.prompt(t("Скопировать ссылку"), link) }
  }
  const onSendClick = async () => {
    if (navigator.share) { try { await navigator.share({ title: "Nuts Farm — Demo", url: link }) } catch { /* User dismissed share. */ } }
    else await onCopyClick()
  }

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <Description className="sr-only">Referral links modal</Description>
        <SheetHeader>{t("Приглашай друзей")}</SheetHeader>
        <div className="flex w-full max-w-[500px] flex-col gap-2.5 self-center">
          <button
            className="flex h-[50px] w-full items-center justify-center gap-4 rounded-[14px] bg-[#17202D] font-tt-hoves-expanded text-sm font-medium text-white transition-colors active:bg-[#202936]"
            onClick={onSendClick}
          >
            <ForwardIcon className="h-5 w-5" />
            {t("Поделиться ссылкой")}
          </button>
          <button
            className="flex h-[50px] w-full items-center justify-center gap-4 rounded-[14px] bg-[#17202D] font-tt-hoves-expanded text-sm font-medium text-white transition-colors active:bg-[#202936]"
            onClick={onCopyClick}
          >
            {isCopied ? (
              <CheckIcon className="h-5 w-5 animate-in fade-in-0" />
            ) : (
              <CopyIcon className="h-5 w-5 animate-in fade-in-0" />
            )}
            {t("Скопировать ссылку")}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default InviteFriendDialog
