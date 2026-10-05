const NotTgEnvironmentErrorScreen = () => {
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
        <path d="M21 8L18.74 5.74A9.75 9.75 0 0 0 12 3C11 3 10.03 3.16 9.13 3.47" />
        <path d="M8 16H3v5" />
        <path d="M3 12C3 9.51 4 7.26 5.64 5.64" />
        <path d="m3 16 2.26 2.26A9.75 9.75 0 0 0 12 21c2.49 0 4.74-1 6.36-2.64" />
        <path d="M21 12c0 1-.16 1.97-.47 2.87" />
        <path d="M21 3v5h-5" />
        <path d="M22 22 2 2" />
      </svg>
      <p className="text-lg">Some error just happened</p>
      <p className="text-lg">Please go to TMA and choose Web App again.</p>
    </div>
  )
}

export default NotTgEnvironmentErrorScreen
