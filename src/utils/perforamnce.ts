export function getTelegramPerformanceClass(
  userAgent: string,
): "LOW" | "AVERAGE" | "HIGH" | "UNKNOWN" {
  const telegramAndroidRegex =
    /Telegram-Android\/[\d.]+ \([^)]+; Android [\d.]+; SDK \d+; (LOW|AVERAGE|HIGH)\)/

  const match = userAgent.match(telegramAndroidRegex)

  if (match && match[1]) {
    return match[1] as "LOW" | "AVERAGE" | "HIGH"
  }

  return "UNKNOWN"
}
