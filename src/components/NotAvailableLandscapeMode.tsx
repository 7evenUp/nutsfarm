import { useTranslation } from "react-i18next"

const NotAvailableLandscapeMode = () => {
  const { t } = useTranslation()

  return (
    <div className="absolute left-1/2 top-1/2 flex w-[120%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center overflow-hidden bg-background text-xl text-white">
      <div className="flex flex-col items-center gap-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-10 w-10"
        >
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
          <path d="M16 16h5v5" />
        </svg>
        <span className="max-w-[450px] text-center font-tt-hoves-expanded text-base font-medium text-white">
          {t(
            "Использование приложения с высотой вашего экрана невозможно. Попробуйте перевернуть его, или воспользоваться другим устройством",
          )}
        </span>
      </div>
    </div>
  )
}

export default NotAvailableLandscapeMode
