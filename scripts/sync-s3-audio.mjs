import { readFile, writeFile, mkdir } from "node:fs/promises"
import { createHash } from "node:crypto"

const root = new URL("../", import.meta.url)
const sources = JSON.parse(
  await readFile(new URL("scripts/audio-sources.json", root), "utf8"),
)
const output = new URL("public/", root)

async function download(file) {
  const url = new URL(file.url)
  if (
    url.origin !== "https://s3-nutsfarm.crypton.xyz" ||
    url.pathname !== file.path ||
    !/^\/sounds\/[a-zA-Z0-9/_.-]+\.mp3$/.test(file.path) ||
    file.path.includes("..")
  ) {
    throw new Error(`Unexpected audio source: ${file.url}`)
  }
  let lastError
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(30000) })
      if (!response.ok) throw new Error(`${file.path}: HTTP ${response.status}`)
      const bytes = Buffer.from(await response.arrayBuffer())
      if (
        !bytes.length ||
        /^(<!doctype|<html)/i.test(bytes.subarray(0, 40).toString().trim())
      ) {
        throw new Error(
          `${file.path}: expected audio, received empty data or HTML`,
        )
      }
      return {
        bytes,
        metadata: {
          path: file.path,
          url: file.url,
          bytes: bytes.length,
          sha256: createHash("sha256").update(bytes).digest("hex"),
          contentType: response.headers.get("content-type"),
          etag: response.headers.get("etag"),
          lastModified: response.headers.get("last-modified"),
          usedBy: file.usedBy,
        },
      }
    } catch (error) {
      lastError = error
    }
  }
  throw lastError
}

// Download and validate the entire set before replacing any existing audio.
const downloaded = []
for (let offset = 0; offset < sources.files.length; offset += 6) {
  downloaded.push(
    ...(await Promise.all(
      sources.files.slice(offset, offset + 6).map(download),
    )),
  )
  console.log(
    `Downloaded ${downloaded.length}/${sources.files.length} original S3 files`,
  )
}
for (const file of downloaded) {
  const target = new URL(file.metadata.path.slice(1), output)
  await mkdir(new URL("./", target), { recursive: true })
  await writeFile(target, file.bytes)
}
const manifest = {
  source:
    "Original production S3 audio, downloaded without conversion or substitutions",
  downloadedAt: new Date().toISOString(),
  codeReferenceCommit: sources.codeReferenceCommit,
  files: downloaded.map((file) => file.metadata),
}
await writeFile(
  new URL("sounds/manifest.json", output),
  JSON.stringify(manifest, null, 2) + "\n",
)

console.log(
  `Saved ${manifest.files.length} exact S3 originals (${downloaded.reduce((sum, file) => sum + file.bytes.length, 0)} bytes).`,
)
