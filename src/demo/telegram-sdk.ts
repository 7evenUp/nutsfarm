import { completeDemoPayment } from "./backend"
import { readStorage, writeStorage } from "./storage"

export type RemoveEventListenerFn = () => void
export interface BackButton {
  show: () => void
  hide: () => void
  on: (event: string, callback: () => void) => RemoveEventListenerFn
}
const backHandles: {
  visible: boolean
  order: number
  callbacks: Set<() => void>
}[] = []
let backOrder = 0
const activeBackHandle = () =>
  backHandles
    .filter((h) => h.visible && h.callbacks.size)
    .sort((a, b) => b.order - a.order)[0]
const updateBack = () => {
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event("nutsfarm:demo-back"))
}
export const hasDemoBack = () => Boolean(activeBackHandle())
export const goDemoBack = () => {
  const callback = [...(activeBackHandle()?.callbacks || [])].pop()
  callback?.()
}
export function initBackButton(): [BackButton] {
  const handle = { visible: false, order: 0, callbacks: new Set<() => void>() }
  backHandles.push(handle)
  return [
    {
      show() {
        handle.visible = true
        handle.order = ++backOrder
        updateBack()
      },
      hide() {
        handle.visible = false
        updateBack()
      },
      on(_event, callback) {
        handle.callbacks.add(callback)
        updateBack()
        return () => {
          handle.callbacks.delete(callback)
          updateBack()
        }
      },
    },
  ]
}
export function initCloudStorage() {
  return {
    async get(key: string) {
      return readStorage(`nutsfarm-demo:${key}`) || ""
    },
    async set(key: string, value: string) {
      writeStorage(`nutsfarm-demo:${key}`, value)
    },
    async delete(key: string) {
      try {
        localStorage.removeItem(`nutsfarm-demo:${key}`)
      } catch {
        /* unavailable */
      }
    },
  }
}
export function initInvoice() {
  return { open: (url: string, _type?: string) => completeDemoPayment(url) }
}
