interface EnergyIndicatorProps {
  currentEnergy: number
  maxEnergy: number
}

export function EnergyIndicator({ currentEnergy }: EnergyIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-primary flex h-4 w-4 items-center justify-center rounded-full">
        <span className="text-xs font-bold text-white">{currentEnergy}</span>
      </div>
    </div>
  )
}
