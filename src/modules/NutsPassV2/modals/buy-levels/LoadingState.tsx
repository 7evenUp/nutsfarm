import { Skeleton } from "@/shared/ui/Skeleton"

import { cn } from "@/lib/cn"

const LoadingState = () => {
  return (
    <>
      <div className="relative mb-10 flex flex-col items-center gap-1.5 px-3.5">
        {[1, 2, 5, 10, 100].map((_, index) => (
          <div
            key={index}
            className={cn(
              "flex w-full flex-col gap-2 overflow-hidden rounded-[10px] py-2.5 pl-3.5 pr-2.5 phone-xsm:gap-0",
              index === 4 &&
                "bg-gradient-to-r from-[#322A59] via-[#3E3274] to-[#241F42]",
            )}
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-8 w-16 rounded-lg" />
            </div>
            {index > 0 && (
              <div className="flex gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-8" />
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

export default LoadingState
