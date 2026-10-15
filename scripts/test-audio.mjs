import assert from "node:assert/strict"
import { readFile, readdir } from "node:fs/promises"
import { createHash } from "node:crypto"
import { createServer } from "vite"

const root = new URL("../", import.meta.url)
const manifest = JSON.parse(
  await readFile(new URL("public/sounds/manifest.json", root), "utf8"),
)
const sources = JSON.parse(
  await readFile(new URL("scripts/audio-sources.json", root), "utf8"),
)
assert.equal(manifest.codeReferenceCommit, sources.codeReferenceCommit)
assert.equal(manifest.files.length, sources.files.length)
for (const file of manifest.files) {
  const original = sources.files.find((source) => source.path === file.path)
  assert.ok(original, file.path)
  assert.equal(file.url, original.url)
  assert.equal(file.url, "https://s3-nutsfarm.crypton.xyz" + file.path)
  const bytes = await readFile(new URL("public" + file.path, root))
  const hash = createHash("sha256").update(bytes).digest("hex")
  assert.equal(
    hash,
    file.sha256,
    file.path + ": downloaded bytes must be unchanged",
  )
  assert.equal(bytes.length, file.bytes)
}

const memory = new Map()
globalThis.localStorage = {
  getItem: (key) => memory.get(key) ?? null,
  setItem: (key, value) => memory.set(key, String(value)),
}
globalThis.window = new EventTarget()
const contexts = []
class Gain {
  gain = {
    value: 1,
    setValueAtTime(value) {
      this.value = value
    },
  }
  connect() {
    return this
  }
  disconnect() {}
}
class Voice {
  loop = false
  onended = null
  connect() {
    return this
  }
  disconnect() {}
  start() {
    this.started = true
  }
  stop() {
    this.stopped = true
    queueMicrotask(() => this.onended?.())
  }
}
globalThis.AudioContext = class {
  state = "suspended"
  currentTime = 0
  destination = {}
  gains = []
  decodes = 0
  constructor() {
    contexts.push(this)
  }
  createGain() {
    const gain = new Gain()
    this.gains.push(gain)
    return gain
  }
  createBufferSource() {
    return new Voice()
  }
  async resume() {
    this.state = "running"
  }
  async decodeAudioData(data) {
    this.decodes++
    assert.ok(data.byteLength)
    return { duration: 1 }
  }
}
const fetches = []
let failNext = false
globalThis.fetch = async (url) => {
  fetches.push(url)
  if (failNext) {
    failNext = false
    return { ok: false, status: 503 }
  }
  const bytes = await readFile(new URL(`public${url}`, root))
  return {
    ok: true,
    arrayBuffer: async () =>
      bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
  }
}

const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
})
try {
  // Every sound currently referenced by the app must resolve to a real local MP3.
  const referenced = new Set()
  async function walk(directory) {
    for (const entry of await readdir(new URL(directory, root), {
      withFileTypes: true,
    })) {
      const path = `${directory}/${entry.name}`
      if (entry.isDirectory()) await walk(path)
      else if (/\.tsx?$/.test(path)) {
        const source = await readFile(new URL(path, root), "utf8")
        assert.doesNotMatch(
          source,
          /https?:\/\/[^"'`\s]+\.mp3/,
          `${path}: runtime audio must stay local`,
        )
        for (const match of source.matchAll(/\/sounds\/[a-zA-Z0-9/_.-]+\.mp3/g))
          referenced.add(match[0])
      }
    }
  }
  await walk("src")
  assert.deepEqual(
    [...referenced].sort(),
    manifest.files.map((file) => file.path).sort(),
    "Every original S3 audio path must be used locally without substitutions",
  )
  for (const url of referenced)
    assert.ok((await readFile(new URL("public" + url, root))).length > 0, url)

  const { Sound, unlockAudio } = await server.ssrLoadModule(
    "/src/utils/Sound.ts",
  )
  const { persistSoundEnabled } = await server.ssrLoadModule(
    "/src/utils/makeSoundFeedback.ts",
  )
  const first = new Sound("/sounds/games/cryptle/cryptle-victory.mp3")
  const second = new Sound("/sounds/games/cryptle/cryptle-victory.mp3")
  first.play()
  assert.equal(first.sources.length, 0)
  await Promise.all([first.load(), first.load(), second.load()])
  assert.equal(
    fetches.length,
    1,
    "Concurrent instances share fetching and decoding",
  )
  assert.equal(contexts[0].decodes, 1)
  assert.equal(first.buffer, second.buffer)
  assert.equal(
    first.url,
    "/sounds/games/cryptle/cryptle-victory.mp3",
    "No remapping to another game or substitute file",
  )
  await unlockAudio()
  assert.equal(contexts[0].state, "running")
  first.play(true)
  first.play(true)
  assert.equal(first.sources.length, 1, "No duplicate background loops")
  await persistSoundEnabled(false)
  assert.equal(
    contexts[0].gains[0].gain.value,
    0,
    "Global mute silences existing playback immediately",
  )
  second.play()
  assert.equal(second.sources.length, 0)
  await persistSoundEnabled(true)
  assert.equal(contexts[0].gains[0].gain.value, 1)
  first.stop()
  assert.equal(first.sources.length, 0)
  second.play()
  second.play()
  const [voiceA, voiceB] = second.sources
  voiceA.onended()
  assert.deepEqual(
    second.sources,
    [voiceB],
    "Overlapping effects clean up by source identity",
  )
  second.stop()

  failNext = true
  const retry = new Sound("/sounds/preview.mp3")
  const warn = console.warn
  try {
    console.warn = () => {}
    assert.equal(
      await retry.load(),
      null,
      "A failed download cannot break a lesson",
    )
  } finally {
    console.warn = warn
  }
  assert.ok(await retry.load(), "A failed download can be retried")
  console.log(
    `Audio checks passed: ${manifest.files.length} S3 MP3 hashes; ${referenced.size} app URLs; shared loading, playback, mute, cleanup and retry.`,
  )
} finally {
  await server.close()
}
