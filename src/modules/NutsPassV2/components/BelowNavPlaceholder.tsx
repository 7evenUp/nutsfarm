import React from "react"

import { cn } from "@/lib/cn"

const BelowNavPlaceholder = React.memo(() => {
  return (
    <div className="relative flex">
      <div
        className={cn(
          "relative flex flex-1 items-center justify-center bg-gradient-to-r from-[#3B3170] to-[#6A5CB7]",
          Telegram.WebApp.platform === "weba"
            ? "h-[76px]"
            : "h-[calc(max(var(--tg-safe-area-inset-bottom,16px),16px)+60px)]",
        )}
      />
      <div
        className={cn(
          "relative flex flex-1 items-center justify-center bg-gradient-to-r from-[#9743A8] to-[#5F136F]",
          Telegram.WebApp.platform === "weba"
            ? "h-[76px]"
            : "h-[calc(max(var(--tg-safe-area-inset-bottom,16px),16px)+60px)]",
        )}
      />

      {/* Золотая полоска по середине */}
      <div className="absolute inset-y-0 left-1/2 w-2 -translate-x-1/2 border-x border-[#2D1A53] bg-[#453A7D]" />
    </div>
  )
})

export default BelowNavPlaceholder
