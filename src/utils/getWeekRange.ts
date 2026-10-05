export const getWeekRange = (): string => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  // Получаем текущую дату в указанном часовом поясе
  const today = new Date(new Date().toLocaleString("en-US", { timeZone }))
  const dayOfWeek = today.getDay() // 0 (воскресенье) до 6 (суббота)

  // Определяем смещение до понедельника
  const distanceToMonday = (dayOfWeek + 6) % 7

  // Дата понедельника
  const monday = new Date(today)
  monday.setDate(today.getDate() - distanceToMonday)

  // Дата воскресенья
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  }

  const formattedMonday = monday.toLocaleDateString(
    Intl.DateTimeFormat().resolvedOptions().locale,
    options,
  )
  const formattedSunday = sunday.toLocaleDateString(
    Intl.DateTimeFormat().resolvedOptions().locale,
    options,
  )

  return `${formattedMonday} - ${formattedSunday}`
}
