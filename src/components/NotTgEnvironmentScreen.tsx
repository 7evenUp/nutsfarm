const NotTgEnvironmentScreen = () => {
  return (
    <div className="container mx-auto flex h-screen flex-col items-center justify-center gap-6 px-4 text-center font-nunito text-white">
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
        className="h-12 w-12"
      >
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      <p className="text-lg">
        To view the mini-app, use the official client for telegram
      </p>
      <a
        className="flex h-14 w-full items-center justify-center gap-4 rounded-[14px] bg-[#17202D] font-tt-hoves text-base font-semibold text-white transition-colors active:bg-[#202936]"
        href={`https://t.me/${import.meta.env.VITE_BOT_NAME}`}
        target="_blank"
      >
        Go to mini-app
      </a>
    </div>
  )
}

export default NotTgEnvironmentScreen
