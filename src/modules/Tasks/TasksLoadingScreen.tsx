import { Skeleton } from "@/shared/ui/Skeleton"

const TasksLoadingScreen = () => {
  return (
    <div className="flex flex-1 flex-col items-center px-4 pt-20 phone-sm:pt-24">
      <Skeleton className="mb-6 h-[106px] w-full rounded-2xl" />
      <div className="mb-5 flex h-[44px] w-full items-center gap-6">
        <Skeleton className="h-7 w-[100px]" />
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-7 w-16" />
      </div>
      <div className="flex w-full flex-col gap-2">
        <Skeleton className="flex h-[62px] w-full items-center gap-3 rounded-2xl p-1.5 pr-3 phone-sm:h-[76px]">
          <Skeleton className="h-12 w-12 shrink-0 rounded-xl phone-sm:h-16 phone-sm:w-16" />
          <div className="flex flex-col items-start gap-1 py-1 phone-sm:py-0">
            <Skeleton className="h-6 w-[120px] phone-sm:h-8" />
            <Skeleton className="h-5 w-[90px]" />
          </div>
          <Skeleton className="ml-auto h-9 w-20" />
        </Skeleton>
        <Skeleton className="flex h-[62px] w-full items-center gap-3 rounded-2xl p-1.5 pr-3 phone-sm:h-[76px]">
          <Skeleton className="h-12 w-12 shrink-0 rounded-xl phone-sm:h-16 phone-sm:w-16" />
          <div className="flex flex-col items-start gap-1 py-1 phone-sm:py-0">
            <Skeleton className="h-6 w-[100px] phone-sm:h-8" />
            <Skeleton className="h-5 w-[90px]" />
          </div>
          <Skeleton className="ml-auto h-9 w-20" />
        </Skeleton>
        <Skeleton className="flex h-[62px] w-full items-center gap-3 rounded-2xl p-1.5 pr-3 phone-sm:h-[76px]">
          <Skeleton className="h-12 w-12 shrink-0 rounded-xl phone-sm:h-16 phone-sm:w-16" />
          <div className="flex flex-col items-start gap-1 py-1 phone-sm:py-0">
            <Skeleton className="h-6 w-[130px] phone-sm:h-8" />
            <Skeleton className="h-5 w-[90px]" />
          </div>
          <Skeleton className="ml-auto h-9 w-20" />
        </Skeleton>
      </div>
    </div>
  )
}

export default TasksLoadingScreen
