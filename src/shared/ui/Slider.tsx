import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/cn"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    rangeClassName?: string
    trackStyle?: React.CSSProperties
  }
>(({ className, rangeClassName, trackStyle, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className,
    )}
    {...props}
  >
    <div className="absolute inset-0 bg-[#17202D]" />
    <SliderPrimitive.Track
      className="full-range-gradient relative h-1.5 w-full grow overflow-hidden rounded-full"
      style={trackStyle}
    >
      <SliderPrimitive.Range
        className={cn("absolute h-full", rangeClassName)}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-[#050D12] bg-white shadow transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
