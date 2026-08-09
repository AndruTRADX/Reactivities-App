import { Card, CardContent, CardHeader, CardTitle } from "@sharedUi/card"
import { Skeleton } from "@sharedUi/skeleton"

export function SkeletonFollowingCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Following</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="flex items-center gap-3" key={`following-skeleton-${index}`}>
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
