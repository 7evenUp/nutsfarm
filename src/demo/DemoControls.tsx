import { goDemoBack, hasDemoBack } from "./telegram-sdk"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import "./demo-controls.css"
import { useTranslation } from "react-i18next"
import { demoSummary, refillDemo, resetDemo, startDemoStreak } from "./backend"
import { useAppDispatch } from "@/redux/hooks"
import { setLanguage } from "@/redux/slices/language"
import { useGetCurrentUserQuery } from "@/redux/api/user"
import { useGetCurrentStreakQuery } from "@/redux/api/streak"

export default function DemoControls() {
  const [back, setBack] = useState(hasDemoBack)
  const [summary, setSummary] = useState(demoSummary)
  const [open, setOpen] = useState(false)
  const [startingStreak, setStartingStreak] = useState(false)
  const { refetch: refetchStreak } = useGetCurrentStreakQuery({
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  })
  const [desktopContainer, setDesktopContainer] = useState<HTMLElement | null>(
    null,
  )
  const { i18n } = useTranslation()
  const dispatch = useAppDispatch()
  const { data: user } = useGetCurrentUserQuery()
  const ru = i18n.language.startsWith("ru")
  const launchStreak = async (daysMissed: 0 | 1 | 2) => {
    if (startingStreak) return
    setStartingStreak(true)
    setOpen(false)
    try {
      startDemoStreak(daysMissed)
      await refetchStreak().unwrap()
      window.dispatchEvent(
        new CustomEvent("nutsfarm:streak-preview", {
          detail: { daysMissed },
        }),
      )
    } finally {
      setStartingStreak(false)
    }
  }
  useEffect(() => {
    if (!window.frameElement?.hasAttribute("data-phone-screen")) return
    const media = window.parent.matchMedia(
      "(min-width: 1024px) and (hover: hover) and (pointer: fine)",
    )
    const update = () =>
      setDesktopContainer(
        media.matches
          ? window.parent.document.getElementById("desktop-demo-controls")
          : null,
      )
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])
  useEffect(() => {
    if (user) {
      dispatch(setLanguage(user.lang))
      void i18n.changeLanguage(user.lang.toLowerCase())
    }
  }, [user?.lang, dispatch, i18n])
  useEffect(() => {
    const update = () => setSummary(demoSummary())
    window.addEventListener("nutsfarm:demo-updated", update)
    return () => window.removeEventListener("nutsfarm:demo-updated", update)
  }, [])
  useEffect(() => {
    const update = () => setBack(hasDemoBack())
    update()
    window.addEventListener("nutsfarm:demo-back", update)
    return () => window.removeEventListener("nutsfarm:demo-back", update)
  }, [])
  const streakControls = (
    <section
      className="demo-scenarios"
      aria-label={ru ? "Сценарии стрика" : "Streak scenarios"}
    >
      {desktopContainer && (
        <h2 className="demo-scenarios-title">
          {ru ? "Ежедневный стрик" : "Daily streak"}
        </h2>
      )}
      <div className="demo-toolbar">
        <button
          className="demo-toggle demo-streak"
          disabled={startingStreak}
          onClick={() => void launchStreak(0)}
          aria-describedby="demo-streak-help"
        >
          {ru ? "🔥 Стрик" : "🔥 Streak"}
        </button>
        <button
          className="demo-toggle demo-freeze"
          disabled={startingStreak}
          onClick={() => void launchStreak(1)}
          aria-describedby="demo-streak-help"
        >
          {ru ? "❄ Заморозка · 1 день" : "❄ Freeze · 1 day"}
        </button>
        <button
          className="demo-toggle demo-freeze"
          disabled={startingStreak}
          onClick={() => void launchStreak(2)}
          aria-describedby="demo-streak-help"
        >
          {ru ? "❄ Заморозка · 2 дня" : "❄ Freeze · 2 days"}
        </button>
      </div>
      <div
        id="demo-streak-help"
        className="demo-streak-help"
        hidden={!desktopContainer && !open}
      >
        <p>
          {ru
            ? "В приложении стрик появлялся при первом запуске за день. Ежедневный вход приносил награду и продлевал серию."
            : "In the app, the streak appeared on the first launch each day. Daily visits earned a reward and extended the streak."}
        </p>
        <p>
          {ru
            ? "Пропуск одного дня открывал заморозку на 1 день, двух дней — на 2 дня. За орехи можно было сохранить серию, а при сбросе — начать её заново."
            : "Missing one or two days opened the corresponding freeze screen. Nuts could preserve the streak, while resetting started it over."}
        </p>
        <p>
          {ru
            ? "Кнопки выше запускают каждый сценарий вручную."
            : "Use the buttons above to launch each scenario manually."}
        </p>
      </div>
    </section>
  )
  const controls = (
    <div className="demo-controls">
      <section className="demo-resources">
        {desktopContainer && (
          <h2 className="demo-scenarios-title">{ru ? "Демо" : "Demo"}</h2>
        )}
        {desktopContainer && (
          <p id="demo-controls-help" className="demo-controls-help">
            {ru
              ? "API-сервер проекта не работает. В демо используется виртуальная валюта, а покупки, начисление наград и другие операции имитируются локально. Нажмите «Демо», чтобы пополнить ресурсы или сбросить прогресс и начать заново."
              : "The project's API server is offline. The demo uses virtual currency and simulates purchases, rewards and other operations locally. Click “Demo” to refill resources or reset your progress and start again."}
          </p>
        )}
        <div className="demo-toolbar">
          <button
            aria-expanded={open}
            aria-describedby={
              desktopContainer ? "demo-controls-help" : undefined
            }
            title={
              ru
                ? "Пополнить демо-ресурсы или начать заново"
                : "Refill demo resources or start again"
            }
            onClick={() => setOpen(!open)}
            className="demo-toggle"
          >
            {ru ? "Демо" : "Demo"} · ★ {summary.stars.toLocaleString()}
          </button>
        </div>
        {open && (
          <div className="demo-panel">
            <p className="demo-description">
              {ru
                ? "Портфолио Nuts Farm. Все покупки виртуальные; прогресс сохраняется в этом браузере."
                : "Nuts Farm portfolio. All purchases are virtual; progress is saved in this browser."}
            </p>
            <p>
              ⚡ {summary.energy} · 🎟 {summary.spins} + {summary.paidSpins}{" "}
              Premium
            </p>
            <button onClick={refillDemo} className="demo-refill">
              {ru ? "Пополнить демо-ресурсы" : "Refill demo resources"}
            </button>
            <button
              onClick={() => {
                if (
                  !window.confirm(
                    ru
                      ? "Сбросить покупки и прогресс демо?"
                      : "Reset demo purchases and progress?",
                  )
                )
                  return
                resetDemo()
                // Reset only this demo's preferences and gameplay, never other app data.
                try {
                  for (let i = localStorage.length - 1; i >= 0; i--) {
                    const key = localStorage.key(i)
                    if (key?.startsWith("nutsfarm-demo:"))
                      localStorage.removeItem(key)
                  }
                } catch {
                  /* Storage may be unavailable. */
                }
                // Reload the preview host too: portals live in its document.
                const host = window.frameElement?.hasAttribute(
                  "data-phone-screen",
                )
                  ? window.parent
                  : window
                host.location.assign("/")
              }}
              className="demo-reset"
            >
              {ru ? "Начать заново" : "Start again"}
            </button>
            <button onClick={() => setOpen(false)} className="demo-close">
              {ru ? "Закрыть" : "Close"}
            </button>
          </div>
        )}
      </section>
      {streakControls}
    </div>
  )

  return (
    <>
      {back && (
        <button
          onClick={goDemoBack}
          className="pointer-events-auto fixed left-3 top-1 z-[1001] rounded-full border border-white/20 bg-[#20142D]/95 px-3 py-1 font-nunito text-xs text-white"
        >
          ← {ru ? "Назад" : "Back"}
        </button>
      )}
      {desktopContainer ? createPortal(controls, desktopContainer) : controls}
    </>
  )
}
