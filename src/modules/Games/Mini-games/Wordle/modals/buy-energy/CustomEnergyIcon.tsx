interface CustomEnergyIconProps {
  className: string
  status: "fill" | "empty" | "active"
}

const CustomEnergyIcon = ({ className, status }: CustomEnergyIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="36"
    height="42"
    viewBox="0 0 36 42"
    fill="none"
    className={className}
  >
    {status === "active" && (
      <path
        opacity="0.1"
        d="M14.183 36.9148C14.3746 36.9726 14.5729 37 14.769 37C15.2752 37 15.7679 36.8149 16.1032 36.4771L30.6031 21.8706C31.0304 21.4401 31.1205 20.8432 30.8352 20.338C30.5494 19.8331 29.9396 19.5106 29.2693 19.5106H22.9619V6.44174C22.9619 5.83362 22.5039 5.2912 21.817 5.08511C21.1305 4.8794 20.3624 5.05471 19.8968 5.52318L5.39692 20.1296C4.9696 20.5598 4.87945 21.157 5.16478 21.6619C5.45056 22.1672 6.06088 22.4896 6.73115 22.4896H13.0386V35.5585C13.0381 36.1667 13.4961 36.7091 14.183 36.9148Z"
        fill="#605AB3"
        stroke="#5B57B2"
        strokeWidth="10"
      />
    )}
    <g filter="url(#filter0_d_1050_14270)">
      <path
        d="M14.183 36.9148C14.3746 36.9726 14.5729 37 14.769 37C15.2752 37 15.7679 36.8149 16.1032 36.4771L30.6031 21.8706C31.0304 21.4401 31.1205 20.8432 30.8352 20.338C30.5494 19.8331 29.9396 19.5106 29.2693 19.5106H22.9619V6.44174C22.9619 5.83362 22.5039 5.2912 21.817 5.08511C21.1305 4.8794 20.3624 5.05471 19.8968 5.52318L5.39692 20.1296C4.9696 20.5598 4.87945 21.157 5.16478 21.6619C5.45056 22.1672 6.06088 22.4896 6.73115 22.4896H13.0386V35.5585C13.0381 36.1667 13.4961 36.7091 14.183 36.9148Z"
        fill={
          status === "active"
            ? "url(#paint0_linear_1050_14270)"
            : status === "fill"
              ? "url(#paint0_linear_1050_14271)"
              : status === "empty"
                ? "#D7DBFF"
                : ""
        }
        shapeRendering="crispEdges"
      />
      {status === "active" && (
        <path
          d="M14.183 36.9148C14.3746 36.9726 14.5729 37 14.769 37C15.2752 37 15.7679 36.8149 16.1032 36.4771L30.6031 21.8706C31.0304 21.4401 31.1205 20.8432 30.8352 20.338C30.5494 19.8331 29.9396 19.5106 29.2693 19.5106H22.9619V6.44174C22.9619 5.83362 22.5039 5.2912 21.817 5.08511C21.1305 4.8794 20.3624 5.05471 19.8968 5.52318L5.39692 20.1296C4.9696 20.5598 4.87945 21.157 5.16478 21.6619C5.45056 22.1672 6.06088 22.4896 6.73115 22.4896H13.0386V35.5585C13.0381 36.1667 13.4961 36.7091 14.183 36.9148Z"
          stroke="#267C07"
          strokeOpacity="0.3"
          shapeRendering="crispEdges"
        />
      )}
      {status === "fill" && (
        <path
          d="M14.183 36.9148C14.3746 36.9726 14.5729 37 14.769 37C15.2752 37 15.7679 36.8149 16.1032 36.4771L30.6031 21.8706C31.0304 21.4401 31.1205 20.8432 30.8352 20.338C30.5494 19.8331 29.9396 19.5106 29.2693 19.5106H22.9619V6.44174C22.9619 5.83362 22.5039 5.2912 21.817 5.08511C21.1305 4.8794 20.3624 5.05471 19.8968 5.52318L5.39692 20.1296C4.9696 20.5598 4.87945 21.157 5.16478 21.6619C5.45056 22.1672 6.06088 22.4896 6.73115 22.4896H13.0386V35.5585C13.0381 36.1667 13.4961 36.7091 14.183 36.9148Z"
          stroke="#E1A71F"
          strokeOpacity="0.7"
          shapeRendering="crispEdges"
        />
      )}
    </g>
    <defs>
      <filter
        id="filter0_d_1050_14270"
        x="2.5"
        y="4.5"
        width="31"
        height="37"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="2" />
        <feGaussianBlur stdDeviation="1" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.356863 0 0 0 0 0.341176 0 0 0 0 0.698039 0 0 0 0.1 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_1050_14270"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_1050_14270"
          result="shape"
        />
      </filter>

      {/* Gradient for active energu */}
      <linearGradient
        id="paint0_linear_1050_14270"
        x1="18"
        y1="5"
        x2="18"
        y2="37"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#CAFF23" />
        <stop offset="1" stopColor="#91F705" />
      </linearGradient>

      {/* Gradient for filled energy */}
      <linearGradient
        id="paint0_linear_1050_14271"
        x1="18"
        y1="5"
        x2="18"
        y2="37"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FEEB1D" />
        <stop offset="1" stopColor="#EAA910" />
      </linearGradient>
    </defs>
  </svg>
)

export default CustomEnergyIcon
