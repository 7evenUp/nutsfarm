import chest from "@/assets/passV2/icons/rewards/box_premium_closed.svg"
import tokens from "@/assets/passV2/icons/rewards/tokens-reward.png"
import nft from "@/assets/passV2/icons/rewards/assemble-nft-premium.png"

export default function PassSlide({
  index,
  lang,
  purchased = false,
}: {
  index: number
  lang: string
  purchased?: boolean
}) {
  const ru = lang === "RU"
  const titles = ru
    ? [
        purchased ? "Premium открыт!" : "Твой Nuts Pass",
        "Больше уровней — больше наград",
        "Открывай боксы",
      ]
    : [
        purchased ? "Premium unlocked!" : "Your Nuts Pass",
        "More levels, more rewards",
        "Open your boxes",
      ]
  const descriptions = ru
    ? [
        "Играй, выполняй задания и зарабатывай XP. Premium открывает дополнительный трек наград.",
        "Повышай уровень в играх или покупай уровни за демо-Stars. Прогресс сохраняется в браузере.",
        "Орехи, энергия, бустеры и коллекционные призы ждут тебя. Нажми на доступную награду, чтобы получить её.",
      ]
    : [
        "Play games, complete tasks and earn XP. Premium unlocks an extra reward track.",
        "Level up through games or buy levels with demo Stars. Your browser saves your progress.",
        "Nuts, energy, boosters and collectibles await. Tap an available reward to claim it.",
      ]
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,_#754DCA_0%,_#20142D_65%)] px-8 text-center">
      <span className="mb-10 rounded-full border border-[#F68DF1]/50 px-4 py-2 font-tt-hoves-expanded text-sm text-[#F68DF1]">
        NUTS PASS {purchased ? "PREMIUM" : ""}
      </span>
      <img
        src={[nft, tokens, chest][index]}
        alt=""
        className="mb-10 h-40 w-40 object-contain drop-shadow-[0_0_30px_rgba(252,223,21,0.3)]"
      />
      <h2 className="mb-5 max-w-md font-tt-hoves-expanded text-3xl font-semibold text-white">
        {titles[index]}
      </h2>
      <p className="max-w-sm text-lg text-white/80">{descriptions[index]}</p>
      <p className="mt-12 text-sm text-white/50">
        {ru ? "Нажми справа, чтобы продолжить" : "Tap on the right to continue"}
      </p>
    </div>
  )
}
