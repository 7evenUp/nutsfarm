import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"

import LoaderIcon from "@/assets/icons/loader.svg?react"
import PlusIcon from "@/assets/games/shared-icons/plus.svg?react"
import EnergyFullIcon from "@/assets/games/shared-icons/energy-full.svg?react"

import { cn } from "@/lib/cn"

import TopUpEnergyDialog from "@/modals/TopUpEnergy"
import SuccessfullEnergyPaymentDialog from "@/modals/TopUpEnergy/SuccessfullEnergyPayment"

import PuzzlesTopUpEnergy from "@/modules/Games/Mini-games/Puzzles/modals/TopUpEnergy"
import CryptleBuyEnergyModal from "@/modules/Games/Mini-games/Wordle/modals/buy-energy"
import FlipCardsTopUpEnergy from "@/modules/Games/Mini-games/FlipCards/modals/TopUpEnergy"

import PuzzlesEnergyPaymentStatus from "@/modules/Games/Mini-games/Puzzles/modals/EnergyPaymentStatus"
import FlipCardsEnergyPaymentStatus from "@/modules/Games/Mini-games/FlipCards/modals/EnergyPaymentStatus"
import EnergyPaymentStatus from "@/modules/Games/Mini-games/Wordle/modals/payment-status"

import { useGetGameEnergyQuery } from "@/redux/api/games"

import { sendMetrika } from "@/utils/sendMetrika"

import { GameTheme } from "@/types/games"
import { useAppSelector } from "@/redux/hooks"

const MAX_ENERGY = 5

interface EnergyProps {
  theme: GameTheme
}

export default function Energy({ theme }: EnergyProps) {
  const { pathname } = useLocation()

  const skin = useAppSelector((state) => state.game.skin)

  const [energyModalOpened, setEnergyModalOpened] = useState(false)
  const [openPaymentStatus, setOpenPaymentStatus] = useState(false)

  const { data: gameEnergy } = useGetGameEnergyQuery()

  const CorrectEnergyModal = pathname.includes("puzzles")
    ? PuzzlesTopUpEnergy
    : pathname.includes("flip-cards")
      ? FlipCardsTopUpEnergy
      : pathname.includes("cryptle")
        ? CryptleBuyEnergyModal
        : TopUpEnergyDialog

  const CorrectEnergyPaymentStatusModal = pathname.includes("puzzles")
    ? PuzzlesEnergyPaymentStatus
    : pathname.includes("flip-cards")
      ? FlipCardsEnergyPaymentStatus
      : pathname.includes("cryptle")
        ? EnergyPaymentStatus
        : SuccessfullEnergyPaymentDialog

  const isGameplayMode = pathname.includes("gameplay")

  useEffect(() => {
    if (energyModalOpened) {
      sendMetrika("games_energy_click")
    }
  }, [energyModalOpened])

  return (
    <>
      {isGameplayMode ? (
        <div
          className={cn(
            "relative flex h-[30px] items-center gap-[5px] rounded-lg border bg-gradient-to-b pl-2 pr-2.5 text-white",
            theme === "flip-cards" &&
              "border-[#010036] from-[#695AB8] to-[#393165]",
            theme === "puzzles-gameplay" &&
              "border-[#492C06] from-[#96550B] to-[#5C3204]",
            theme === "cryptle" &&
              skin === "DEFAULT" &&
              "border-[#3A2485] from-[#35207C] to-[#3A2485]",
            theme === "cryptle" &&
              skin === "GREEN" &&
              "border-[#15351B] from-[#68974A] to-[#37603D]",
            theme === "cryptle" &&
              skin === "PURPLE" &&
              "border-[#5A2485] from-[#6B2C9E] to-[#5A2485]",
          )}
        >
          {gameEnergy !== undefined ? (
            <>
              <EnergyFullIcon className="h-[18px] w-auto" />
              <span className="text-sm font-bold">{gameEnergy.gameEnergy}</span>
            </>
          ) : (
            <LoaderIcon className="h-4 w-4 animate-spin" />
          )}
        </div>
      ) : (
        <div className="relative flex h-[30px] items-center">
          <div
            className={cn(
              "relative z-10 flex h-[30px] w-[30px] items-center justify-center rounded-lg border bg-gradient-to-b",
              theme === "default" &&
                "border-[#010036] from-[#695AB8] to-[#393164]",
              theme === "flip-cards" &&
                "border-[#010036] from-[#695AB8] to-[#393164]",
              theme === "puzzles" &&
                "border-[#094541]/60 from-[#0D5B56] to-[#15857F]",
              theme === "puzzles-gameplay" &&
                "border-[#492C06]/60 from-[#96550B] to-[#4F2B02]",
              theme === "cryptle" &&
                "border-[#3A2485] from-[#8866F0] to-[#4D349F]",
            )}
          >
            <EnergyFullIcon className="h-[18px] w-[18px] drop-shadow-[0px_2px_3px_rgba(0,0,0,0.25)]" />
          </div>
          <div
            className={cn(
              "flex h-[22px] -translate-x-px items-center justify-center pl-2.5 pr-5 text-xs font-bold text-white phone-xsm:text-sm",
              theme === "default" && "bg-[#2F2852]",
              theme === "flip-cards" && "bg-[#2F2852]",
              theme === "puzzles" &&
                "bg-gradient-to-r from-[#0C5853] via-[#0F6D67] to-[#094541]",
              theme === "puzzles-gameplay" &&
                "bg-gradient-to-r from-[#211201b3] via-[#552D01b3] to-[#221200b3]",
              theme === "cryptle" &&
                "bg-gradient-to-r from-[#3C2788] via-[#2D1875] to-[#503E9C]",
            )}
          >
            {gameEnergy !== undefined ? (
              `${gameEnergy.gameEnergy}/${MAX_ENERGY}`
            ) : (
              <LoaderIcon className="h-4 w-4 animate-spin" />
            )}
          </div>
          <button
            className={cn(
              "absolute right-0 flex h-6 w-6 translate-x-1/2 items-center justify-center rounded-full border bg-gradient-to-b from-[#B1FC0A] to-[#56C602] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.2)] outline-none transition-opacity active:opacity-90",
              theme === "default" && "border-[#010036]",
              theme === "flip-cards" && "border-[#010036]",
              theme === "puzzles" && "border-[#094541]/60",
              theme === "puzzles-gameplay" && "border-[#492C06]",
              theme === "cryptle" && "border-[#412D8B]",
            )}
            onClick={() => setEnergyModalOpened(true)}
          >
            <PlusIcon className="h-2.5 w-2.5" />
          </button>
        </div>
      )}

      {gameEnergy && (
        <CorrectEnergyModal
          open={energyModalOpened}
          setOpen={setEnergyModalOpened}
          energy={gameEnergy.gameEnergy}
          maxEnergy={5}
          setOpenPaymentStatus={setOpenPaymentStatus}
        />
      )}

      <CorrectEnergyPaymentStatusModal
        open={openPaymentStatus}
        setOpen={setOpenPaymentStatus}
      />
    </>
  )
}
