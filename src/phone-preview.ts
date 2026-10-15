import "./phone-preview.css"
import "./demo/demo-controls.css"

const root = document.getElementById("root")!
const phone = document.createElement("main")
phone.className = "phone"

const speaker = document.createElement("div")
speaker.className = "phone-speaker"
speaker.setAttribute("aria-hidden", "true")

const screen = document.createElement("iframe")
screen.className = "phone-screen"
screen.setAttribute("data-phone-screen", "")
screen.title = "Nuts Farm — мобильное приложение"
screen.src = window.location.href
screen.allow = "autoplay; fullscreen"

const homeIndicator = document.createElement("div")
homeIndicator.className = "phone-home-indicator"
homeIndicator.setAttribute("aria-hidden", "true")

phone.append(speaker, screen, homeIndicator)
root.append(phone)

const desktopNote = document.createElement("aside")
desktopNote.className = "desktop-note"
desktopNote.setAttribute("aria-label", "Просмотр мобильного проекта")
desktopNote.innerHTML = `
  <p class="desktop-note-title">Создано для телефона</p>
  <p>Этот проект запускался исключительно на телефонах.</p>
  <p>Чтобы посмотреть сайт в нужных пропорциях, уменьшите масштаб страницы:</p>
  <ul>
    <li><kbd>Ctrl</kbd> + <kbd>колёсико мыши вниз</kbd></li>
    <li>или <kbd>Ctrl</kbd> + <kbd>−</kbd></li>
  </ul>
`
root.append(desktopNote)

const desktopDemoControls = document.createElement("div")
desktopDemoControls.id = "desktop-demo-controls"
desktopDemoControls.className = "desktop-demo-controls"
root.append(desktopDemoControls)

// Keep shared links and browser navigation pointed at the visible app route.
window.addEventListener("message", (event: MessageEvent) => {
  if (
    event.origin !== window.location.origin ||
    event.source !== screen.contentWindow ||
    event.data?.type !== "nutsfarm:location" ||
    typeof event.data.href !== "string"
  )
    return

  const url = new URL(event.data.href, window.location.href)
  if (url.origin === window.location.origin) {
    window.history.replaceState(null, "", url.href)
  }
})

window.addEventListener("popstate", () => {
  screen.src = window.location.href
})
