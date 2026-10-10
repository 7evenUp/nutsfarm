// Keep demo data separate from any credentials left by the original app.
export const DEMO_STORAGE_KEY = "nutsfarm-portfolio-v1"
export function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
export function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* Private browsing: keep playing in memory. */
  }
}
