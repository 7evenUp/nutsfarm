import { initCloudStorage } from "@/demo/telegram-sdk"

// @ts-expect-error Not-in-telegram-environment
let cloudStorage

if (true) {
  try {
    cloudStorage = initCloudStorage()
  } catch {
    /* empty */
  }
}

const STORAGE_KEY = "soundEnabled"

let soundEnabled = true

function notifySoundSetting() {
  window.dispatchEvent(new Event("nutsfarm:sound-setting"))
}

export async function initSound() {
  // @ts-expect-error Not-in-telegram-environment
  const storageValue: string = await cloudStorage.get(STORAGE_KEY)
  if (storageValue) {
    soundEnabled = storageValue === "true"
  } else {
    soundEnabled = true
  }
  notifySoundSetting()
}

export async function persistSoundEnabled(value: boolean) {
  soundEnabled = value
  notifySoundSetting()
  // @ts-expect-error Not-in-telegram-environment
  await cloudStorage.set(STORAGE_KEY, String(value))
}

export function isSoundEnabled() {
  return soundEnabled
}
