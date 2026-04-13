import { Skeleton } from "@sharedUi/skeleton"
import { Card, CardContent, CardHeader } from "@sharedUi/card"

export function SkeletonPage() {
  return (
    <div className="flex w-full justify-center">
      <div className=" w-full grid grid-cols-4 max-w-7xl gap-3 mt-4">
        <Card className="w-full col-span-3">
          <CardHeader>
            <Skeleton className="aspect-video w-full" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Skeleton className="size-12 shrink-0 rounded-full" />
              <Skeleton className="h-8 w-2/3" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="size-12 shrink-0 rounded-full" />
              <Skeleton className="h-8 w-2/6" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="size-12 shrink-0 rounded-full" />
              <Skeleton className="h-8 w-1/2" />
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-1 h-fit">
          <CardContent className="flex flex-col gap-2 w-full h-full">
            <Skeleton className="w-full h-8" />
            <div className="flex gap-2 mt-2">
              <Skeleton className="size-12 shrink-0 rounded-full" />
              <div className="w-full">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full mt-2" />
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Skeleton className="size-12 shrink-0 rounded-full" />
              <div className="w-full">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full mt-2" />
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Skeleton className="size-12 shrink-0 rounded-full" />
              <div className="w-full">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
