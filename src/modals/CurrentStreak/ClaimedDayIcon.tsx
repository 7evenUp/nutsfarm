const ClaimedDayIcon = ({ isSelected }: { isSelected: boolean }) => {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="18"
        cy="18"
        r="18"
        fill={isSelected ? "white" : "url(#paint0_linear_2906_5740)"}
      ></circle>
      <path
        d="M15.3519 25.3214C15.7785 25.753 16.3752 26 17.0922 26H17.0945C17.7438 25.9772 18.3555 25.6695 18.7693 25.1603L26.4739 15.8228C27.2782 14.8478 27.148 13.3744 26.1676 12.5271C25.1827 11.7178 23.7261 11.8561 22.9165 12.8341L16.8326 20.2089L13.9552 17.2907C13.0523 16.3773 11.5807 16.3773 10.6777 17.2907C9.77409 18.2033 9.77409 19.6881 10.6777 20.6008L15.3519 25.3214Z"
        fill="#050D12"
      ></path>
      <defs>
        <linearGradient
          id="paint0_linear_2906_5740"
          x1="7"
          y1="-2"
          x2="21"
          y2="39.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#FABB1D"></stop>
          <stop offset="1" stop-color="#EE421A"></stop>
        </linearGradient>
      </defs>
    </svg>
  )
}

export default ClaimedDayIcon
