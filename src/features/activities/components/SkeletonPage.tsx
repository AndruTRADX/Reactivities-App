import { Card, CardContent } from "@sharedUi/card"
import { Skeleton } from "@sharedUi/skeleton"

export function SkeletonPage() {
  return (
    <div className="grid grid-cols-4 gap-6 pt-2">
      <div className="flex flex-col col-span-3 gap-4">
        {Array.from({ length: 3 }).map(() => (
          <Card className="w-full">
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
      <Card className="col-span-1 h-fit">
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
