import { Description, Close } from "@radix-ui/react-dialog"
import { useTranslation } from "react-i18next"

import CloseIcon from "@/assets/icons/close.svg?react"
import CoinIcon from "@/assets/icons/coin.svg?react"
import PassIcon from "@/assets/icons/ticket.svg?react"
import StarIcon from "@/assets/passV2/icons/star.svg?react"
import TonIcon from "@/assets/icons/ton.svg?react"
import Loader from "@/assets/icons/loader.svg?react"

import { Sheet, SheetContent } from "@/shared/ui/SideSheet"
import { LargeButton } from "@/shared/ui/LargeButton"

import { useGetCurrentUserQuery } from "@/redux/api/user"

import { numberWithSpaces } from "@/utils/numberWithSpaces"

import { cn } from "@/lib/cn"

const isDesktop =
  Telegram.WebApp.platform === "tdesktop" ||
  Telegram.WebApp.platform === "macos" ||
  Telegram.WebApp.platform === "web" ||
  Telegram.WebApp.platform === "weba"

const MintInfoModal = ({
  isOpen,
  setOpen,
  imgSrc,
  title,
  mintPrizeAmount,
  mintPrizeXpAmount,
  onMint,
  isMintProcessing,
  starsPrice,
  tonPrice,
  tonFullPrice,
}: {
  isOpen: boolean
  setOpen: (v: boolean) => void
  imgSrc: string
  title: string
  mintPrizeAmount: number
  mintPrizeXpAmount: number
  onMint: () => void
  isMintProcessing: boolean
  starsPrice: number
  tonPrice: number
  tonFullPrice: number
}) => {
  const { t } = useTranslation()

  const { data: userProfile } = useGetCurrentUserQuery()

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="max-h-screen gap-0 overflow-hidden overflow-y-scroll px-0 pb-[max(var(--tg-safe-area-inset-bottom,16px),16px)] pt-6">
        <Description className="sr-only">Mint info modal</Description>

        <div className="mb-4 flex justify-end px-4">
          <Close className="opacity-70 transition-opacity focus:outline-none active:opacity-100">
            <CloseIcon className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </Close>
        </div>

        <div className="flex flex-col items-center px-4">
          <img src={imgSrc} className="mb-5 h-[150px] w-[150px]" />

          <span className="mb-3.5 text-center font-tt-hoves-expanded text-2xl font-semibold tracking-[-0.02em]">
            {title}
          </span>

          <div className="mt-6 flex flex-col items-center gap-3">
            <p className="text-sm font-semibold">{t("Награда")}</p>
            <div className="flex items-center gap-2">
              <div className="flex h-10 items-center gap-1.5 rounded-[10px] bg-[#17202D] px-3">
                <CoinIcon className="h-5 w-5 shrink-0" />
                <span className="text-sm font-bold">
                  {numberWithSpaces(mintPrizeAmount || 0)}
                </span>
              </div>
              {mintPrizeXpAmount > 0 && (
                <div className="flex h-10 items-center gap-1.5 rounded-[10px] bg-[#17202D] px-3">
                  <PassIcon className="h-5 w-5 shrink-0" />
                  <span className="text-sm font-bold">
                    {numberWithSpaces(mintPrizeXpAmount || 0)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <LargeButton
            className={cn(isDesktop ? "mt-14" : "mt-14 phone-xsm:mt-20")}
            appearance="white"
            onClick={onMint}
            disabled={isMintProcessing}
          >
            {isMintProcessing ? (
              <Loader className="animate-spin" />
            ) : (
              <div className="flex items-center gap-1">
                {t("Минт")}
                {userProfile &&
                userProfile.freeNftMints &&
                userProfile.freeNftMints > 0 ? null : Telegram.WebApp
                    .initData ? (
                  <>
                    <StarIcon />
                    {starsPrice}
                  </>
                ) : (
                  <>
                    <TonIcon className="h-4 w-4" />
                    {tonPrice?.toFixed(2)}
                    <span className="translate-y-px text-sm line-through opacity-80">
                      {tonFullPrice?.toFixed(2)}
                    </span>
                  </>
                )}
              </div>
            )}
          </LargeButton>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default MintInfoModal
