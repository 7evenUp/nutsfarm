export const openLinkWithTelegram = (
  link: string,
  tryInstantView: boolean = false,
) => {
  link.includes("https://t.me")
    ? Telegram.WebApp.openTelegramLink(link)
    : Telegram.WebApp.openLink(link, { try_instant_view: tryInstantView })
}
