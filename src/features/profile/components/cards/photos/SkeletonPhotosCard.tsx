import { Card, CardContent, CardHeader, CardTitle } from "@sharedUi/card"
import { Skeleton } from "@sharedUi/skeleton"

export function SkeletonPhotosCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Photos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton className="aspect-square w-full" key={`photo-skeleton-${index}`} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
