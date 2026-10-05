import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

import CoinIcon from "@/assets/games/shared-icons/coin-icon.svg?react"

import LuckyNuts from "./components/LuckyNuts"

import { Skeleton } from "@/shared/ui/Skeleton"

import { useGetJackpotQuery } from "@/redux/api/wheel"

import { makeHapticFeedback } from "@/utils/makeHapticFeedback"
import { numberWithSpaces } from "@/utils/numberWithSpaces"
import { sendMetrika } from "@/utils/sendMetrika"

import { cn } from "@/lib/cn"

const Games = () => {
  const { t } = useTranslation()

  const { data: jackpot } = useGetJackpotQuery()

  return (
    <main
      className={cn(
        "no-scroll flex flex-1 flex-col items-center overflow-hidden px-4 pb-24",
        Telegram.WebApp.platform === "tdesktop" ||
          Telegram.WebApp.platform === "macos"
          ? "pt-16"
          : "pt-16 phone-xsm:pt-[72px] phone-sm:pt-20",
      )}
    >
      <div className="flex w-full flex-col gap-4 phone-sm-fix:mt-10 phone-sm-fix:gap-[18px]">
        <LuckyNuts>
          <button
            className="relative flex h-[85px] flex-col items-start justify-center gap-1.5 pl-5 transition-transform duration-100 active:scale-95 phone-sm-fix:h-[96px]"
            onClick={() => sendMetrika("games_jackpot_click")}
          >
            <h2 className="relative z-[1] bg-gradient-to-b from-[#C18FFD] to-white to-[80%] bg-clip-text font-tt-hoves-expanded text-base font-semibold text-transparent drop-shadow-[0px_1px_2px_rgba(0,0,0,0.2)]">
              {t("Текущий Джекпот")}
            </h2>
            {jackpot !== undefined ? (
              <p className="relative z-[1] flex h-[30px] w-fit items-center gap-[5px] rounded-lg bg-gradient-to-r from-[#3A1A62]/70 to-[#5825A5]/70 px-2.5 ring-1 ring-[#270F45]/50 phone-sm-fix:h-[33px]">
                <CoinIcon className="h-5 w-5" />
                <span className="text-base font-bold text-[#FDEC1E]">
                  {numberWithSpaces(jackpot)}
                </span>
              </p>
            ) : (
              <Skeleton className="relative z-[1] h-[30px] w-32 rounded-lg bg-white/30 phone-sm-fix:h-[33px]" />
            )}

            <img
              className="absolute inset-0 h-full w-full rounded-xl object-cover object-right"
              src="/images/games/wheel-button-background.png"
            />
          </button>
        </LuckyNuts>

        <Link
          to="puzzles"
          className="transition-transform duration-100 active:scale-95"
          onClick={() => {
            sendMetrika("nuts_blocks_enter")
            makeHapticFeedback({ impactOccured: "light" })
          }}
        >
          <img
            className="h-[118px] w-full rounded-xl object-cover phone-sm-fix:h-[130px] phone-lg:h-[143px]"
            src="/images/games/nuts-blocks.png"
          />
        </Link>
        <Link
          to="flip-cards"
          className="transition-transform duration-100 active:scale-95"
          onClick={() => {
            sendMetrika("metamatch_enter")
            makeHapticFeedback({ impactOccured: "light" })
          }}
        >
          <img
            className="h-[118px] w-full rounded-xl object-cover phone-sm-fix:h-[130px] phone-lg:h-[143px]"
            src="/images/games/meta-match.png"
          />
        </Link>
        <Link
          to="cryptle"
          className="transition-transform duration-100 active:scale-95"
          onClick={() => {
            sendMetrika("cryptle_enter")
            makeHapticFeedback({ impactOccured: "light" })
          }}
        >
          <img
            className="h-[118px] w-full rounded-xl object-cover phone-sm-fix:h-[130px] phone-lg:h-[143px]"
            src="/images/games/cryptle.png"
          />
        </Link>

        {/* {Telegram.WebApp.initData ? (
          <>
            <Link
              to="puzzles"
              className="transition-transform duration-100 active:scale-95"
              onClick={() => {
                sendMetrika("nuts_blocks_enter")
                makeHapticFeedback({ impactOccured: "light" })
              }}
            >
              <img
                className="h-[118px] w-full rounded-xl object-cover phone-sm-fix:h-[130px] phone-lg:h-[143px]"
                src="/images/games/nuts-blocks.png"
              />
            </Link>
            <Link
              to="flip-cards"
              className="transition-transform duration-100 active:scale-95"
              onClick={() => {
                sendMetrika("metamatch_enter")
                makeHapticFeedback({ impactOccured: "light" })
              }}
            >
              <img
                className="h-[118px] w-full rounded-xl object-cover phone-sm-fix:h-[130px] phone-lg:h-[143px]"
                src="/images/games/meta-match.png"
              />
            </Link>
            <Link
              to="cryptle"
              className="transition-transform duration-100 active:scale-95"
              onClick={() => {
                sendMetrika("cryptle_enter")
                makeHapticFeedback({ impactOccured: "light" })
              }}
            >
              <img
                className="h-[118px] w-full rounded-xl object-cover phone-sm-fix:h-[130px] phone-lg:h-[143px]"
                src="/images/games/cryptle.png"
              />
            </Link>
          </>
        ) : (
          <div className="relative flex flex-col gap-4">
            <img
              className="h-[118px] w-full rounded-xl object-cover phone-sm-fix:h-[130px] phone-lg:h-[143px]"
              src="/images/games/nuts-blocks.png"
            />
            <img
              className="h-[118px] w-full rounded-xl object-cover phone-sm-fix:h-[130px] phone-lg:h-[143px]"
              src="/images/games/meta-match.png"
            />
            <img
              className="h-[118px] w-full rounded-xl object-cover phone-sm-fix:h-[130px] phone-lg:h-[143px]"
              src="/images/games/cryptle.png"
            />
            <div className="absolute inset-0 flex items-center justify-center text-balance rounded-xl bg-black/30 text-center text-2xl font-bold drop-shadow-[0px_0px_1px_black] backdrop-blur-[6px]">
              Функционал игр доступен только в TMA
            </div>
          </div>
        )} */}
      </div>
    </main>
  )
}

export default Games
