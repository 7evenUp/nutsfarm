/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        "phone-xsm": "350px",
        "phone-sm": "376px",
        "phone-sm-fix": "390px",
        "h-screen-620": { raw: "(min-height: 620px)" },
        "h-screen-700": { raw: "(min-height: 700px)" },
        "h-screen-740": { raw: "(min-height: 740px)" },
        phone: "400px",
        "phone-lg": "420px",
        "phone-lg-fix": "437px",
        "phone-xl": "450px",
      },
      fontFamily: {
        nunito: ["Nunito", "sans-serif"],
        "tt-hoves": ["TT Hoves", "sans-serif"],
        "tt-hoves-expanded": ["TT Hoves Pro Trial Expanded", "sans-serif"],
        "days-one": ["DaysOne", "sans-serif"],
        koulen: ["Koulen", "sans-serif"],
      },
      colors: {
        cyan: "#66FAFF",
        blue: "#55A3FF",
        green: "#A3FF47",
        background: "#050D12",
      },
      keyframes: {
        "collapsible-down": {
          from: { height: "0" },
          to: { height: "var(--radix-collapsible-content-height)" },
        },
        "collapsible-up": {
          from: { height: "var(--radix-collapsible-content-height)" },
          to: { height: "0" },
        },
        "overlay-show": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "content-show": {
          from: {
            opacity: "0",
            transform: "translate(-50%, -48%) scale(0.96)",
          },
          to: { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
        },
      },
      animation: {
        "collapsible-down": "collapsible-down 0.2s ease-out",
        "collapsible-up": "collapsible-up 0.2s ease-out",
        "overlay-show": "overlay-show 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        "content-show": "content-show 150ms cubic-bezier(0.16, 1, 0.3, 1)",
      },
      backgroundImage: {
        "roadmap-pattern": "url('/images/roadmap.png')",
        "roadmap-pattern-premium": "url('/images/roadmap-premium.png')",
        "cryptle-game-back": "url('/images/games/cryptle-game-back.svg')",
        "cryptle-game-back-green-skin":
          "url('/images/games/cryptle-game-back-green-skin.svg')",
        "cryptle-game-back-purple-skin":
          "url('/images/games/cryptle-game-back-purple-skin.svg')",
        "cryptle-level-map-back":
          "url('/images/games/cryptle-level-map-back.svg')",
        "cryptle-roadmap": "url('/images/games/cryptle-roadmap.svg')",
        "puzzle-game-back": "url('/images/games/puzzle-game-back.png')",
        "puzzle-game-back-large":
          "url('/images/games/puzzle-game-back-large.png')",
        "puzzles-background": "url('/images/games/puzzles-background.png')",
        "puzzles-modal": "url('/images/games/puzzle-modal-background.png')",
        "premium-module": "url('/images/premium_module_background.png')",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
