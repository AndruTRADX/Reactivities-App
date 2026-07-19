import { Skeleton } from "@sharedUi/skeleton"
import { Card, CardContent, CardHeader } from "@sharedUi/card"

export function SkeletonForm() {
  return (
    <div className="flex w-full justify-center">
      <Card className="w-full sm:max-w-2xl">
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Skeleton className="h-4 w-1/4 mt-4" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-1/4 mt-4" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-1/4 mt-4" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-1/4 mt-4" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-1/4 mt-4" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}
