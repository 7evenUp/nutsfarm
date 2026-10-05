import BlockchainIcon from "@/assets/lesson-icons/blockchain.svg?react"
import KeyIcon from "@/assets/lesson-icons/key.svg?react"
import TradingMainIcon from "@/assets/lesson-icons/TradingMainIcon.svg?react"
import MemesMainIcon from "@/assets/lesson-icons/MemesMainIcon.svg?react"
import ScamIcon from "@/assets/lesson-icons/scam.svg?react"
import TonIcon from "@/assets/lesson-icons/ton.svg?react"
import PsyMainIcon from "@/assets/lesson-icons/PsyMainIcon.svg?react"
import AnalyzeModuleIcon from "@/assets/lesson-icons/AnalyzeModuleIcon.svg?react"
import TonModuleIcon from "@/assets/lesson-icons/TonModuleIcon.svg?react"

import { Module } from "@/types/learn"
import { isHexColor } from "@/utils/color"

const ModuleIcon = ({ icon, color }: Module) => {
  if (icon === "0")
    return (
      <BlockchainIcon
        className="h-9 w-9"
        style={{
          color: isHexColor(color) ? color : "#6C6AE1",
        }}
      />
    )
  if (icon === "1")
    return (
      <KeyIcon
        className="h-9 w-9"
        style={{
          color: isHexColor(color) ? color : "#6C6AE1",
        }}
      />
    )
  if (icon === "2")
    return (
      <TradingMainIcon
        className="h-9 w-9"
        style={{
          color: isHexColor(color) ? color : "#6C6AE1",
        }}
      />
    )
  if (icon === "3")
    return (
      <MemesMainIcon
        className="h-9 w-9"
        style={{
          color: isHexColor(color) ? color : "#6C6AE1",
        }}
      />
    )
  if (icon === "4")
    return (
      <ScamIcon
        className="h-9 w-9"
        style={{
          color: isHexColor(color) ? color : "#6C6AE1",
        }}
      />
    )
  if (icon === "5")
    return (
      <TonIcon
        className="h-9 w-9"
        style={{
          color: isHexColor(color) ? color : "#6C6AE1",
        }}
      />
    )
  if (icon === "6")
    return (
      <PsyMainIcon
        className="h-9 w-9"
        style={{
          color: isHexColor(color) ? color : "#6C6AE1",
        }}
      />
    )
  if (icon === "7")
    return (
      <AnalyzeModuleIcon
        className="h-9 w-9"
        style={{
          color: isHexColor(color) ? color : "#6C6AE1",
        }}
      />
    )
  if (icon === "8")
    return (
      <TonModuleIcon
        className="h-9 w-9"
        style={{
          color: isHexColor(color) ? color : "#6C6AE1",
        }}
      />
    )

  try {
    new URL(icon)
    return (
      <img
        className="h-9 w-9"
        style={{
          color: isHexColor(color) ? color : "#6C6AE1",
        }}
        src={icon}
      />
    )
  } catch {
    return (
      <BlockchainIcon
        className="h-9 w-9"
        style={{
          color: isHexColor(color) ? color : "#6C6AE1",
        }}
      />
    )
  }
}

export default ModuleIcon
