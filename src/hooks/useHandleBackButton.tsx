import { useEffect, useRef } from "react"

export const useHandleBackButton = (isOpen: boolean, onClose: () => void) => {
  const hasPushedState = useRef(false)

  useEffect(() => {
    const handlePopState = () => {
      if (isOpen) {
        try {
          onClose()
        } catch (error) {
          console.error("Ошибка при закрытии модалки:", error)
        }
        hasPushedState.current = false
      }
    }

    if (isOpen && !hasPushedState.current) {
      try {
        window.history.pushState(null, "")
        hasPushedState.current = true
      } catch (error) {
        console.error("Ошибка при добавлении записи в историю:", error)
      }

      window.addEventListener("popstate", handlePopState)
    }

    return () => {
      window.removeEventListener("popstate", handlePopState)
    }
  }, [isOpen])
}
