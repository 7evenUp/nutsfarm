import { isSoundEnabled } from "./makeSoundFeedback"

const context = new AudioContext()

export class Sound {
  url = ""
  buffer: AudioBuffer | null = null
  sources: AudioBufferSourceNode[] = []

  constructor(url: string) {
    this.url = url
  }

  async load() {
    if (this.buffer) return this.buffer
    // Original audio files lived on a retired server. Small local tones keep
    // feedback playable without network requests or failed loading promises.
    const duration = /victory|claimed|success|win|opening/.test(this.url) ? 0.35 : 0.09
    const buffer = context.createBuffer(1, Math.floor(context.sampleRate * duration), context.sampleRate)
    const samples = buffer.getChannelData(0)
    const frequency = /incorrect|defeat|lose/.test(this.url) ? 180 : 660
    for (let i = 0; i < samples.length; i++) {
      const t = i / context.sampleRate
      samples[i] = Math.sin(2 * Math.PI * frequency * t) * 0.07 * Math.max(0, 1 - t / duration)
    }
    this.buffer = buffer
    return buffer
  }

  play(loop = false, volume = 1, time = 0) {
    if (!this.buffer) return
    
    // Проверяем, включен ли звук в настройках
    if (!isSoundEnabled()) return

    // Create a new sound source and assign it the loaded sound's buffer:
    if (context.state === "suspended") void context.resume()
    const source = context.createBufferSource()

    source.buffer = this.buffer
    source.loop = loop

    // Keep track of all sources created, and stop tracking them once they finish playing:
    const insertedAt = this.sources.push(source) - 1

    source.onended = () => {
      source.stop(0)

      this.sources.splice(insertedAt, 1)
    }

    // Create a gain node with the desired volume:
    const gainNode = context.createGain()

    gainNode.gain.value = volume

    // Connect nodes:
    source.connect(gainNode).connect(context.destination)

    // Start playing at the desired time:
    source.start(time)
  }

  stop() {
    // Stop any sources still playing:
    this.sources.forEach((source) => {
      source.stop(0)
    })

    this.sources = []
  }
}
