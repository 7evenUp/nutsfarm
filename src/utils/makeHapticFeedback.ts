import { initCloudStorage } from "@telegram-apps/sdk"

// @ts-expect-error Not-in-telegram-environment
let cloudStorage

if (import.meta.env.VITE_IS_DEV_LOCAL === undefined) {
  try {
    cloudStorage = initCloudStorage()
  } catch {
    /* empty */
  }
}

const STORAGE_KEY = "vibrationEnabled"

let vibrationEnabled = true

export async function initVibration() {
  // @ts-expect-error Not-in-telegram-environment
  const storageValue: string = await cloudStorage.get(STORAGE_KEY)
  if (storageValue) {
    vibrationEnabled = storageValue === "true"
  } else {
    vibrationEnabled = false
  }
}

export async function persistVibrationEnabled(value: boolean) {
  vibrationEnabled = value
  // @ts-expect-error Not-in-telegram-environment
  await cloudStorage.set(STORAGE_KEY, String(value))
}

export function isVibrationEnabled() {
  return vibrationEnabled
}

export const makeHapticFeedback = ({
  impactOccured,
  notificationOccured,
}: {
  impactOccured?: ImpactOccured
  notificationOccured?: NotificationOccured
}) => {
  if (!vibrationEnabled) return

  if (impactOccured !== undefined) {
    Telegram.WebApp.HapticFeedback.impactOccurred(impactOccured)
  } else if (notificationOccured !== undefined) {
    Telegram.WebApp.HapticFeedback.notificationOccurred(notificationOccured)
  }
}

type ImpactOccured = "light" | "medium" | "heavy" | "rigid" | "soft"
type NotificationOccured = "error" | "success" | "warning"
