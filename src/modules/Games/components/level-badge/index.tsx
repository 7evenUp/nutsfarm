import { useTranslation } from "react-i18next"

import { SkinType } from "@/types/cryptle"

interface LevelBadgeProps {
  level?: number
  primaryColor?: string
  secondaryColor?: string
  textColor?: string
  theme?: SkinType
}

export default function LevelBadge({ level, theme }: LevelBadgeProps) {
  const { t } = useTranslation()

  return (
    <svg
      width="103"
      height="105"
      viewBox="0 0 103 105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="-mt-1 h-[84px] w-[75px] phone-xsm:h-[105px] phone-xsm:w-[103px]"
    >
      <g filter="url(#filter0_d_3293_14880)">
        <path
          d="M13 0H90V58.5173C90 61.5627 88.6122 64.4422 86.23 66.3395L57.73 89.0382C54.0842 91.9418 48.9158 91.9419 45.27 89.0382L16.77 66.3395C14.3878 64.4422 13 61.5627 13 58.5173V0Z"
          fill="url(#paint0_linear_3293_14880)"
          fillOpacity="0.9"
          shapeRendering="crispEdges"
        />
        <path
          d="M13 -0.5H12.5V0V58.5173C12.5 61.715 13.9572 64.7384 16.4585 66.7306L44.9585 89.4293C48.7866 92.4781 54.2134 92.4781 58.0415 89.4293L86.5415 66.7306C89.0428 64.7384 90.5 61.715 90.5 58.5173V0V-0.5H90H13Z"
          // stroke={primaryColor === "#23543A" ? "#23543A" : "#402B8B"}
          stroke={
            theme === "DEFAULT"
              ? "#402B8B66"
              : theme === "GREEN"
                ? "#37544899"
                : theme === "PURPLE"
                  ? "#301F4966"
                  : ""
          }
          strokeOpacity="0.4"
          shapeRendering="crispEdges"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_3293_14880"
          x="0"
          y="-13"
          width="103"
          height="117.217"
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
          <feOffset />
          <feGaussianBlur stdDeviation="6" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_3293_14880"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_3293_14880"
            result="shape"
          />
        </filter>
        {}
        <linearGradient
          id="paint0_linear_3293_14880"
          x1="51.5"
          y1="0"
          x2="51.5"
          y2="107.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop
            stopColor={
              theme === "DEFAULT"
                ? "#3B2684"
                : theme === "GREEN"
                  ? "#23543A"
                  : theme === "PURPLE"
                    ? "#3A1D5D"
                    : ""
            }
          />
          <stop
            offset="1"
            stopColor={
              theme === "DEFAULT"
                ? "#8E6CF9"
                : theme === "GREEN"
                  ? "#90AD66"
                  : theme === "PURPLE"
                    ? "#814DBA"
                    : ""
            }
          />
        </linearGradient>
      </defs>
      <text
        x="51.5"
        y="32"
        textAnchor="middle"
        fill={
          theme === "DEFAULT"
            ? "#C4C9FE"
            : theme === "GREEN"
              ? "#B4C7A0"
              : theme === "PURPLE"
                ? "#CAA3F7"
                : ""
        }
        fontSize="10"
        fontWeight="600"
      >
        {t("Уровень")}
      </text>
      <text
        x="51.5"
        y="64"
        textAnchor="middle"
        fill={
          theme === "DEFAULT"
            ? "#C4C9FE"
            : theme === "GREEN"
              ? "#B4C7A0"
              : theme === "PURPLE"
                ? "#CAA3F7"
                : ""
        }
        fontSize="32"
        fontWeight="bold"
      >
        {level ? level : ""}
      </text>
    </svg>
  )
}
