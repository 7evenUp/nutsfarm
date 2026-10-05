export const generateScore = (
  errors: number,
  timeInSeconds: number,
): number => {
  const errorRanges: Record<number, { min: number; max: number }> = {
    0: { min: 95, max: 99 },
    1: { min: 90, max: 95 },
    2: { min: 85, max: 90 },
    3: { min: 80, max: 85 },
    4: { min: 75, max: 80 },
    5: { min: 70, max: 75 },
  }

  const { min, max } = errorRanges[errors] ?? { min: 95, max: 99 }

  const basePercentage = Math.floor(Math.random() * (max - min + 1)) + min

  let timePenalty = 0

  if (timeInSeconds <= 60) {
    timePenalty = timeInSeconds * 0.01
  } else if (timeInSeconds <= 120) {
    timePenalty = 60 * 0.01 + (timeInSeconds - 60) * 0.015
  } else {
    timePenalty = 60 * 0.01 + 60 * 0.015 + (timeInSeconds - 120) * 0.02
  }

  // Итоговый процент с округлением до двух знаков после запятой
  let finalPercentage = basePercentage - timePenalty
  finalPercentage = Math.round(finalPercentage * 100) / 100 // Округление до сотых

  // Ограничение диапазона итогового процента от 10 до 99
  if (finalPercentage < 10) {
    finalPercentage = 10
  } else if (finalPercentage > 99) {
    finalPercentage = 99
  }

  return finalPercentage
}
