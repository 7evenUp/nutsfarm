const FireStreakIcon = ({ day }: { day: number }) => {
  return (
    <div className="relative h-[140px] w-[140px] phone-sm-fix:h-[164px] phone-sm-fix:w-[164px]">
      <svg
        className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2"
        xmlns="http://www.w3.org/2000/svg"
        width="164"
        height="164"
        viewBox="0 0 164 164"
        fill="none"
      >
        <path
          d="M82 164C63.6048 164 46.3108 156.837 33.3035 143.829C20.2963 130.822 13.1328 113.528 13.1328 95.1328C13.1328 79.6025 18.417 64.3239 28.012 52.1116L35.1453 43.033C43.6717 32.1818 48.3672 18.6054 48.3672 4.80469C48.3672 2.15122 50.5184 0 53.1719 0L53.66 0.00160156C65.9648 0.0807187 77.5163 4.94787 86.1874 13.7062C94.8477 22.4533 99.6172 34.0502 99.6172 46.3601V54.2702C105.21 52.2875 109.227 46.9437 109.227 40.6794V30.9451C109.227 29.0299 110.364 27.297 112.122 26.536C113.879 25.7749 115.921 26.1301 117.318 27.4405C127.399 36.8965 135.893 48.3531 141.88 60.5717C147.76 72.571 150.867 84.5218 150.867 95.1328C150.867 113.528 143.704 130.822 130.696 143.829C117.689 156.837 100.395 164 82 164Z"
          fill="url(#paint0_linear_3166_6215)"
        />
        <g filter="url(#filter0_f_3166_6215)">
          <path
            d="M81.406 152.116C51.1921 152.116 32.7147 126.798 48.6181 107.189L75.7799 73.697C78.3666 70.5073 84.4453 70.5073 87.0321 73.697L114.194 107.189C130.097 126.798 111.62 152.116 81.406 152.116Z"
            fill="url(#paint1_linear_3166_6215)"
          />
        </g>
        <path
          d="M81.406 152.116C51.1921 152.116 32.7147 126.798 48.6181 107.189L75.7799 73.697C78.3666 70.5073 84.4453 70.5073 87.0321 73.697L114.194 107.189C130.097 126.798 111.62 152.116 81.406 152.116Z"
          fill="url(#paint2_linear_3166_6215)"
        />
        <defs>
          <filter
            id="filter0_f_3166_6215"
            x="34.7827"
            y="63.3047"
            width="93.2463"
            height="96.8125"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feGaussianBlur
              stdDeviation="4"
              result="effect1_foregroundBlur_3166_6215"
            />
          </filter>
          <linearGradient
            id="paint0_linear_3166_6215"
            x1="81.4577"
            y1="163.849"
            x2="79.1481"
            y2="-5.54292"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FBC220" />
            <stop offset="0.64" stopColor="#FA4F1C" />
            <stop offset="1" stopColor="#EA2B19" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_3166_6215"
            x1="85"
            y1="158.5"
            x2="86.752"
            y2="9.51472"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FFFD9B" />
            <stop offset="0.199382" stopColor="#FCA92B" />
            <stop offset="1" stopColor="#EC2D19" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_3166_6215"
            x1="85"
            y1="158.5"
            x2="86.752"
            y2="9.51472"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FFFD9B" />
            <stop offset="0.199382" stopColor="#FCA92B" />
            <stop offset="1" stopColor="#EC2D19" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute left-1/2 top-[80%] z-50 -translate-x-1/2 -translate-y-[80%] font-tt-hoves-expanded text-[54px] font-semibold -tracking-[0.02em] text-background phone-sm-fix:top-[85%] phone-sm-fix:text-[72px]">
        {day}
      </span>
    </div>
  )
}

export default FireStreakIcon
