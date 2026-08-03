import { Card, CardContent } from "@sharedUi/card"
import { Skeleton } from "@sharedUi/skeleton"

export function SkeletonPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pt-2">
      <div className="flex items-center gap-4 rounded-2xl bg-card px-4 py-3 ring-1 ring-foreground/10 lg:hidden">
        <Skeleton className="h-9 min-w-36 flex-1" />
        <Skeleton className="h-5 w-40" />
      </div>

      <div className="flex flex-col lg:col-span-3 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card className="w-full" key={`activity-item-paged-${index}`}>
            <div className="flex px-7 gap-4 items-center">
              <Skeleton className="size-14 shrink-0 rounded-full" />
              <div className="w-full flex flex-col gap-3">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <CardContent>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-1/4 mt-4" />
                <Skeleton className="h-6 w-1/4 mt-4" />
              </div>
              <Skeleton className="h-6 w-1/4 mt-4" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="col-span-1 hidden h-fit lg:block">
        <CardContent className="flex flex-col gap-2 w-full h-fit">
          <Skeleton className="w-full h-8" />
          <Skeleton className="w-5/6 h-5 mt-2" />
          <Skeleton className="w-1/2 h-5" />
          <Skeleton className="w-2/3 h-5" />
        </CardContent>
      </Card>
    </div>
  )
}
