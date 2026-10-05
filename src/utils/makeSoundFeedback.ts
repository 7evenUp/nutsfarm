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

const STORAGE_KEY = "soundEnabled"

let soundEnabled = true

export async function initSound() {
  // @ts-expect-error Not-in-telegram-environment
  const storageValue: string = await cloudStorage.get(STORAGE_KEY)
  if (storageValue) {
    soundEnabled = storageValue === "true"
  } else {
    soundEnabled = true
  }
}

export async function persistSoundEnabled(value: boolean) {
  soundEnabled = value
  // @ts-expect-error Not-in-telegram-environment
  await cloudStorage.set(STORAGE_KEY, String(value))
}

export function isSoundEnabled() {
  return soundEnabled
} 