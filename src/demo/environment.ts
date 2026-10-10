import { RuntimeLoader } from "@rive-app/react-webgl2"
RuntimeLoader.setWasmUrl("/rive.wasm")

// Loaded before app modules: the portfolio always uses Telegram presentation,
// without requiring Telegram, launch parameters, credentials or a real invoice.
const noop = () => {}
const openLink = (link: string) => {
  const url = new URL(link, window.location.href)
  if (url.origin === window.location.origin) window.location.assign(url.href)
  else if (["https:", "http:"].includes(url.protocol))
    window.open(url.href, "_blank", "noopener,noreferrer")
}
Object.assign(window, {
  Telegram: {
    WebApp: {
      initData: "portfolio-demo",
      initDataUnsafe: {
        user: {
          id: 1337,
          first_name: "Demo",
          last_name: "Player",
          username: "demo_player",
          language_code: "ru",
        },
      },
      platform: "weba",
      version: "8.0",
      colorScheme: "dark",
      viewportHeight: window.innerHeight,
      viewportStableHeight: window.innerHeight,
      isExpanded: true,
      ready: noop,
      expand: noop,
      close: noop,
      setHeaderColor: noop,
      setBackgroundColor: noop,
      disableVerticalSwipes: noop,
      enableVerticalSwipes: noop,
      requestFullscreen: noop,
      exitFullscreen: noop,
      onEvent: noop,
      offEvent: noop,
      openLink,
      openTelegramLink: openLink,
      HapticFeedback: {
        impactOccurred: noop,
        notificationOccurred: noop,
        selectionChanged: noop,
      },
      BackButton: { show: noop, hide: noop, onClick: noop, offClick: noop },
      MainButton: {
        show: noop,
        hide: noop,
        setParams: noop,
        onClick: noop,
        offClick: noop,
      },
    },
  },
  ym: noop,
})
document.documentElement.style.setProperty("--tg-viewport-height", "100dvh")
document.documentElement.style.setProperty(
  "--tg-viewport-stable-height",
  "100dvh",
)
