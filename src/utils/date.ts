export const getDays = (seconds: number, disableZeroAtStart?: boolean) => {
  const days = Math.floor(seconds / 60 / 60 / 24)

  if (disableZeroAtStart) return days

  return days < 10 ? `0${days}` : days
}

export const getHours = (
  seconds: number,
  disableZeroAtStart?: boolean,
  showAllHours?: boolean,
) => {
  const hours = showAllHours
    ? Math.floor(seconds / 60 / 60)
    : Math.floor(seconds / 60 / 60) % 24

  if (disableZeroAtStart) return hours

  return hours < 10 ? `0${hours}` : hours
}

export const getMinutes = (seconds: number) => {
  const minutes = Math.floor(seconds / 60) % 60

  return minutes < 10 ? `0${minutes}` : minutes
}

export const getSeconds = (seconds: number) => {
  const secs = Math.floor(seconds % 60)

  return secs < 10 ? `0${secs}` : secs
}
