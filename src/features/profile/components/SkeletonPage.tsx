import { Skeleton } from "@sharedUi/skeleton"
import { Card } from "@sharedUi/card"
import { useLiquidGlass } from "@sharedHooks/useLiquidGlass"

export function SkeletonPage() {
  const { ref: glassRef, style: glassStyle } = useLiquidGlass<HTMLDivElement>()

  return (
    <div className="flex flex-col w-full gap-6">
      <div className="w-full flex flex-col">
        <div className="bg-profile-header h-28 sm:h-36"></div>

        <div className="-mt-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div
              ref={glassRef}
              style={glassStyle}
              className="w-fit p-3.25 -translate-y-8 rounded-2xl bg-background/40"
            >
              <Skeleton className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl" />
            </div>

            <div className="flex flex-col gap-2 max-w-full sm:max-w-88 sm:mb-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>

          <div className="flex gap-6 items-center sm:mb-2">
            <div className="flex flex-col items-center gap-1">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-8 w-10" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-8 w-10" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-6">
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Card className="p-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-6 w-2/3" />
        </Card>
      </div>
    </div>
  )
}
