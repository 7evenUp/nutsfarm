import { useState } from "react"
import { useTonConnectUI, useTonConnectModal } from "@tonconnect/ui-react"
import { useTranslation } from "react-i18next"
import { Description } from "@radix-ui/react-dialog"

import SwapIcon from "@/assets/icons/swap.svg?react"
import CopyIcon from "@/assets/icons/copy.svg?react"
import CheckIcon from "@/assets/icons/check.svg?react"

import { Sheet, SheetContent, SheetHeader } from "@/shared/ui/SideSheet"

import { useGetCurrentUserQuery } from "@/redux/api/user"

const TON_PAYLOAD_SECRET = "979ee024cb967134d0fd43556582b374"

const TonInfo = ({
  open,
  setOpen,
  close,
  openRoot,
}: {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  close: () => void
  openRoot: () => void
}) => {
  const { t } = useTranslation()

  const [isCopied, setIsCopied] = useState(false)

  const { data: currentUser } = useGetCurrentUserQuery()

  const [tonConnectUI] = useTonConnectUI()
  const { open: openTonConnect } = useTonConnectModal()

  const onCopyClick = () => {
    navigator.clipboard.writeText(currentUser!.tonWallet)
    setIsCopied(true)
    setTimeout(() => {
      setIsCopied(false)
    }, 3000)
  }

  const onDisconnectClick = async () => {
    tonConnectUI.setConnectRequestParameters({
      state: "ready",
      value: { tonProof: TON_PAYLOAD_SECRET },
    })
    if (tonConnectUI.connected) {
      await tonConnectUI.disconnect()
      openTonConnect()
      close()
    } else {
      openTonConnect()
      close()
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent>
        <Description className="sr-only">
          Connecting TON wallet modal
        </Description>

        <SheetHeader>{t("TON кошелёк")}</SheetHeader>
        <button
          className="flex h-[50px] items-center justify-center gap-4 rounded-lg bg-[#17202D] font-tt-hoves-expanded text-sm font-medium text-white transition-colors active:bg-[#202936]"
          onClick={onCopyClick}
        >
          {isCopied ? (
            <CheckIcon className="h-5 w-5 animate-in fade-in-0" />
          ) : (
            <CopyIcon className="h-5 w-5 animate-in fade-in-0" />
          )}
          {t("Скопировать адрес")}
        </button>
        <button
          className="flex h-[50px] items-center justify-center gap-4 rounded-lg bg-[#17202D] font-tt-hoves-expanded text-sm font-medium text-white transition-colors active:bg-[#202936]"
          onClick={onDisconnectClick}
        >
          <SwapIcon className="h-5 w-5" />
          {t("Сменить кошелёк")}
        </button>
        <div className="flex items-center gap-2">
          <button
            className="flex h-[50px] flex-1 items-center justify-center gap-4 rounded-lg bg-[#17202D] font-tt-hoves-expanded text-sm font-medium text-white transition-colors active:bg-[#202936]"
            onClick={() => {
              close()
              openRoot()
            }}
          >
            {t("Назад")}
          </button>
          <button
            className="flex h-[50px] flex-1 items-center justify-center gap-4 rounded-lg bg-[#17202D] font-tt-hoves-expanded text-sm font-medium text-white transition-colors active:bg-[#202936]"
            onClick={close}
          >
            {t("Закрыть")}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default TonInfo
