import { useAppSelector } from "@/redux/hooks"

import { cn } from "@/lib/cn"

import "./styles.css"

const StreakRank = ({ nutDashRank }: { nutDashRank: string }) => {
  const lang = useAppSelector((state) => state.language.value)

  const rankName = nutDashRank.trim().toLowerCase()
  const hasRankColor = [
    "bronze",
    "silver",
    "gold",
    "rookie",
    "learner",
    "fast feet",
    "athlete",
    "runner",
    "marathoner",
    "master",
    "lightning",
    "champion",
    "legend",
  ].includes(rankName)

  return (
    <div
      className={cn(
        "relative flex w-fit items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r px-2 py-1.5",
        rankName === "bronze" && "from-[#F5CEAB] to-[#CD915E]",
        rankName === "silver" && "from-[#E8EDF5] to-[#AAB8CE]",
        rankName === "gold" && "from-[#FFEB99] to-[#E9B849]",
        !hasRankColor && "bg-white/10",
        rankName === "rookie" && "from-[#E9E9E9] to-[#B0B0B0]",
        rankName === "learner" && "from-[#ADF5FF] to-[#54D1FF]",
        rankName === "fast feet" && "from-[#AAC8FF] to-[#3895FF]",
        rankName === "athlete" && "from-[#98A0FF] to-[#5B6EFF]",
        rankName === "runner" &&
          "bg-gradient-to-br from-[#BEA8FF] to-[#A960FF]",
        rankName === "marathoner" &&
          "bg-gradient-to-br from-[#FF9DE5] to-[#F245FF]",
        rankName === "master" && "from-[#C4FF66] to-[#86E824]",
        rankName === "lightning" && "from-[#FFC066] to-[#FF793F]",
        rankName === "champion" &&
          "bg-gradient-to-br from-[#FF7878] to-[#FF3737]",
        rankName === "legend" && "from-[#FFFA82] to-[#FFCA1A]",
      )}
    >
      <div
        className={cn(
          "animated absolute -left-full h-14 w-3 -translate-x-full rotate-[-24deg] blur",
          rankName === "bronze" && "bg-[#FFE6CE]",
          rankName === "silver" && "bg-white",
          rankName === "gold" && "bg-[#FFF4C7]",
          rankName === "rookie" && "bg-[#F9F9F9]",
          rankName === "learner" && "bg-[#C1F7FF]",
          rankName === "fast feet" && "bg-[#A9C7FF]",
          rankName === "athlete" && "bg-[#9CA4FF]",
          rankName === "runner" && "bg-[#C6B1FF]",
          rankName === "marathoner" && "bg-[#FFC8F1] blur-[10px]",
          rankName === "master" && "bg-[#D4FF93]",
          rankName === "lightning" && "bg-[#FFCDA2]",
          rankName === "champion" && "bg-[#FFA4A4] blur-[10px]",
          rankName === "legend" && "bg-[#F5F2A5]",
        )}
      />
      <span
        className={cn(
          "relative font-tt-hoves-expanded text-xs font-semibold",
          hasRankColor ? "text-[#070707]" : "text-white",
        )}
      >
        {lang === "RU"
          ? rankName === "rookie"
            ? "Новичок"
            : rankName === "learner"
              ? "Ученик"
              : rankName === "fast feet"
                ? "Быстрые ноги"
                : rankName === "athlete"
                  ? "Спортсмен"
                  : rankName === "runner"
                    ? "Бегун"
                    : rankName === "marathoner"
                      ? "Марафонец"
                      : rankName === "master"
                        ? "Мастер"
                        : rankName === "lightning"
                          ? "Молния"
                          : rankName === "champion"
                            ? "Чемпион"
                            : rankName === "legend"
                              ? "Легенда"
                              : nutDashRank
          : nutDashRank}
      </span>
    </div>
  )
}

export default StreakRank
