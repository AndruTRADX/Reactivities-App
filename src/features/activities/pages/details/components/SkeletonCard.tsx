import { Skeleton } from "@sharedUi/skeleton"
import { Card, CardContent, CardHeader } from "@sharedUi/card"

export function SkeletonCard() {
  return (
    <div className="flex w-full justify-center">
      <Card className="w-full max-w-3xl">
      <CardHeader>
        <Skeleton className="aspect-video w-full" />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-5 w-1/2" />
      </CardContent>
    </Card>
    </div>
  )
}
