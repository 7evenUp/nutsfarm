import { Dispatch, SetStateAction, useEffect, useState } from "react"

import CloseIcon from "@/assets/icons/close.svg?react"

import { Sheet, SheetContent } from "@/shared/ui/SideSheet"

// Добавляем функцию для форматирования времени
const formatTimeLeft = (timeLeft: number): string => {
  const hours = Math.floor(timeLeft / 3600)
  const minutes = Math.floor((timeLeft % 3600) / 60)
  const seconds = timeLeft % 60
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

interface EnergySegmentProps {
  active: boolean
  progress?: number
  index: number
  total: number
}

const EnergySegment = ({
  active,
  progress = 0,
  index,
  total,
}: EnergySegmentProps) => {
  // Вычисляем углы для сегмента
  const segmentAngle = 360 / total
  const startAngle = index * segmentAngle - 90 // Начинаем с верхней точки (-90 градусов)
  const endAngle = startAngle + segmentAngle - 5

  // Конвертируем углы в радианы для расчетов
  const startRad = (startAngle * Math.PI) / 180
  const endRad = (endAngle * Math.PI) / 180

  // Радиус внешнего и внутреннего круга
  const outerRadius = 80
  const innerRadius = 75

  // Вычисляем координаты для пути SVG
  const x1 = Math.cos(startRad) * outerRadius
  const y1 = Math.sin(startRad) * outerRadius
  const x2 = Math.cos(endRad) * outerRadius
  const y2 = Math.sin(endRad) * outerRadius
  const x3 = Math.cos(endRad) * innerRadius
  const y3 = Math.sin(endRad) * innerRadius
  const x4 = Math.cos(startRad) * innerRadius
  const y4 = Math.sin(startRad) * innerRadius

  // Флаг для больших дуг (если угол > 180 градусов)
  const largeArcFlag = segmentAngle > 180 ? 1 : 0

  // Создаем путь для сегмента
  const path = [
    `M ${x1} ${y1}`, // Начальная точка
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`, // Внешняя дуга
    `L ${x3} ${y3}`, // Линия к внутреннему кругу
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`, // Внутренняя дуга
    "Z", // Закрыть путь
  ].join(" ")

  // Если сегмент активный, используем основной цвет
  // Если это сегмент с прогрессом, используем градиент
  // Иначе используем серый цвет
  let fill
  if (active) {
    fill = "var(--color-primary)"
  } else if (progress > 0) {
    // Для сегмента с прогрессом создаем градиент
    const gradientId = `segment-gradient-${index}`
    return (
      <g>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop
              offset={`${progress * 100}%`}
              stopColor="var(--color-primary)"
            />
            <stop offset={`${progress * 100}%`} stopColor="#E5E7EB" />
          </linearGradient>
        </defs>
        <path d={path} fill={`url(#${gradientId})`} />
      </g>
    )
  } else {
    fill = "#E5E7EB" // Серый цвет для неактивных сегментов
  }

  return <path d={path} fill={fill} />
}

export default function EnergyModal({
  open,
  setOpen,
  energyFullRecoverTime,
  currentEnergy = 0,
  maxEnergy = 5,
}: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  energyFullRecoverTime?: string
  currentEnergy: number
  maxEnergy: number
}) {
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [progressPercent, setProgressPercent] = useState<number>(0)
  const [nextEnergyTime, setNextEnergyTime] = useState<number>(0)

  useEffect(() => {
    if (!energyFullRecoverTime) return

    const calculateTimeAndProgress = () => {
      const endTime = new Date(energyFullRecoverTime).getTime()
      const currentTime = new Date().getTime()
      const timeLeftMs = Math.max(0, endTime - currentTime)

      // Предполагаем, что энергия восстанавливается равномерно
      const timePerEnergy = timeLeftMs / (maxEnergy - currentEnergy)

      // Время до следующей единицы энергии
      const nextEnergyTimeMs =
        timeLeftMs - timePerEnergy * (maxEnergy - currentEnergy - 1)
      const nextEnergyTimeSec = Math.max(0, Math.floor(nextEnergyTimeMs / 1000))

      // Прогресс заполнения следующего сегмента
      const progress =
        currentEnergy < maxEnergy ? 1 - nextEnergyTimeMs / timePerEnergy : 0

      setTimeLeft(Math.floor(timeLeftMs / 1000))
      setNextEnergyTime(nextEnergyTimeSec)
      setProgressPercent(Math.min(Math.max(progress, 0), 1))
    }

    calculateTimeAndProgress()
    const timer = setInterval(calculateTimeAndProgress, 1000)

    return () => clearInterval(timer)
  }, [energyFullRecoverTime, currentEnergy, maxEnergy])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="p-6">
        <div className="flex flex-col items-center gap-6">
          <div className="flex w-full items-center justify-between">
            <h2 className="text-2xl font-bold">Энергия</h2>
            <button onClick={() => setOpen(false)}>
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="relative flex h-48 w-48 items-center justify-center">
            {/* Круг с сегментами */}
            <svg viewBox="-100 -100 200 200" className="h-full w-full">
              {Array.from({ length: maxEnergy }).map((_, index) => (
                <EnergySegment
                  key={index}
                  active={index < currentEnergy}
                  progress={index === currentEnergy ? progressPercent : 0}
                  index={index}
                  total={maxEnergy}
                />
              ))}

              {/* Внутренний круг */}
              <circle cx="0" cy="0" r="50" fill="white" />
            </svg>

            {/* Центр круга с информацией */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold">
                {currentEnergy}/{maxEnergy}
              </div>
              <div className="text-sm text-gray-600">
                {formatTimeLeft(currentEnergy < maxEnergy ? nextEnergyTime : 0)}
              </div>
            </div>
          </div>

          <div className="text-center text-gray-600">
            {currentEnergy < maxEnergy
              ? "до следующей единицы энергии"
              : "энергия полностью восстановлена"}
          </div>

          {timeLeft > 0 && currentEnergy < maxEnergy && (
            <div className="text-xs text-gray-500">
              Полное восстановление через: {formatTimeLeft(timeLeft)}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
