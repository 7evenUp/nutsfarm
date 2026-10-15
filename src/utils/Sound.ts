import { isSoundEnabled } from "./makeSoundFeedback"

let context: AudioContext | null = null
let masterGain: GainNode | null = null
const buffers = new Map<string, Promise<AudioBuffer | null>>()

function getContext() {
  if (!context) {
    context = new AudioContext()
    masterGain = context.createGain()
    masterGain.gain.value = isSoundEnabled() ? 1 : 0
    masterGain.connect(context.destination)
    // Browsers can suspend audio until a real user gesture, including after reload.
    const unlock = () => {
      void unlockAudio().then(() => {
        if (context?.state === "running") {
          window.removeEventListener("pointerdown", unlock)
          window.removeEventListener("keydown", unlock)
          window.removeEventListener("touchend", unlock)
        }
      })
    }
    window.addEventListener("pointerdown", unlock)
    window.addEventListener("keydown", unlock)
    window.addEventListener("touchend", unlock)
  }
  return context
}

export async function unlockAudio() {
  try {
    const audio = getContext()
    if (audio.state === "suspended") await audio.resume()
  } catch {
    // Unsupported or blocked audio must not prevent opening a game or lesson.
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("nutsfarm:sound-setting", () => {
    if (context && masterGain) {
      masterGain.gain.setValueAtTime(
        isSoundEnabled() ? 1 : 0,
        context.currentTime,
      )
    }
  })
}

export class Sound {
  url: string
  buffer: AudioBuffer | null = null
  sources: AudioBufferSourceNode[] = []

  constructor(url: string) {
    this.url = url
  }

  async load(): Promise<AudioBuffer | null> {
    if (this.buffer) return this.buffer
    let loading = buffers.get(this.url)
    if (!loading) {
      loading = (async () => {
        try {
          const audio = getContext()
          const response = await fetch(this.url)
          if (!response.ok) throw new Error(`HTTP ${response.status}`)
          return await audio.decodeAudioData(await response.arrayBuffer())
        } catch (error) {
          buffers.delete(this.url)
          console.warn(`Could not load audio: ${this.url}`, error)
          return null
        }
      })()
      buffers.set(this.url, loading)
    }
    this.buffer = await loading
    if (!this.buffer) buffers.delete(this.url)
    return this.buffer
  }

  play(loop = false, volume = 1, time = 0) {
    if (!this.buffer || !isSoundEnabled()) return
    // React effects may run twice; a track must never play over itself.
    if (loop && this.sources.some((source) => source.loop)) return
    const audio = getContext()
    void unlockAudio()
    const source = audio.createBufferSource()
    const gain = audio.createGain()
    source.buffer = this.buffer
    source.loop = loop
    gain.gain.value = Math.max(0, Math.min(1, volume))
    source.connect(gain).connect(masterGain!)
    this.sources.push(source)
    source.onended = () => {
      this.sources = this.sources.filter((active) => active !== source)
      source.disconnect()
      gain.disconnect()
    }
    source.start(time)
  }

  stop() {
    const active = this.sources
    this.sources = []
    active.forEach((source) => source.stop())
  }
}
