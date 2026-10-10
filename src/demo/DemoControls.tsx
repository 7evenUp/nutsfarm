import { goDemoBack, hasDemoBack } from "./telegram-sdk"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { demoSummary, refillDemo, resetDemo } from "./backend"
import { useAppDispatch } from "@/redux/hooks"
import { setLanguage } from "@/redux/slices/language"
import { useGetCurrentUserQuery } from "@/redux/api/user"

export default function DemoControls() {
  const [back, setBack] = useState(hasDemoBack)
  const [summary, setSummary] = useState(demoSummary)
  const [open, setOpen] = useState(false)
  const { i18n } = useTranslation()
  const dispatch = useAppDispatch()
  const { data: user } = useGetCurrentUserQuery()
  const ru = i18n.language.startsWith("ru")
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
      <div className="pointer-events-auto fixed right-3 top-1 z-[1001] font-nunito text-xs">
        <button
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="rounded-full border border-white/20 bg-[#20142D]/95 px-3 py-1 text-white shadow-lg"
        >
          {ru ? "Демо" : "Demo"} · ★ {summary.stars.toLocaleString()}
        </button>
        {open && (
          <div className="mt-2 w-72 rounded-2xl border border-white/20 bg-[#20142D] p-4 text-white shadow-xl">
            <p className="mb-3 text-sm">
              {ru
                ? "Портфолио Nuts Farm. Все покупки виртуальные; прогресс сохраняется в этом браузере."
                : "Nuts Farm portfolio. All purchases are virtual; progress is saved in this browser."}
            </p>
            <p className="mb-3">
              ⚡ {summary.energy} · 🎟 {summary.spins} + {summary.paidSpins}{" "}
              Premium
            </p>
            <button
              onClick={refillDemo}
              className="mb-2 w-full rounded-xl bg-[#754DCA] px-3 py-2"
            >
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
                window.location.assign("/")
              }}
              className="w-full rounded-xl border border-white/20 px-3 py-2"
            >
              {ru ? "Начать заново" : "Start again"}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="mt-3 w-full text-white/70"
            >
              {ru ? "Закрыть" : "Close"}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
