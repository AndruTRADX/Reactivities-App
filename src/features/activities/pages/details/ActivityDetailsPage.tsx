import { Badge } from "@sharedUi/badge"
import { Button } from "@sharedUi/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@sharedUi/card"
import { Link, useParams } from "react-router"
import { useGetActivityById } from "@activities/hooks/api/useActivities"
import { format } from "date-fns"
import { SkeletonCard } from "./components/SkeletonCard"
import { NoContent } from "@/shared/components/common/NotFound"

export default function ActivityDetailsPage() {
  let { id } = useParams()
  const { activity, isPendingActivity } = useGetActivityById(id)

  if (isPendingActivity) {
    return <SkeletonCard />
  }

  if (!activity) {
    return (
      <NoContent
        title="Activity not found"
        description={`The activity with the id ${id} has not been found`}
      />
    )
  }

  return (
    <Card className="relative mx-auto w-full max-w-3xl pt-0 mt-4">
      <div className="absolute inset-0 z-30 aspect-video bg-black/15 backdrop-blur-[2px]" />
      <img
        src={`/categoryImages/${activity.category}.jpg`}
        alt="Event cover"
        className="relative z-20 aspect-video w-full object-cover brightness-60 dark:brightness-40"
      />

      <CardHeader>
        <CardAction>
          <Badge variant="secondary">{activity.category}</Badge>
        </CardAction>
        <CardTitle>{activity.title}</CardTitle>
        <CardDescription>{activity.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          Date:{" "}
          <span className="text-primary">{format(activity.date, "yyyy/MM/dd/ hh:mm:ss")}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Place: <span className="text-primary">{`${activity?.city} - ${activity?.venue}`}</span>
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link to={`/update-activity/${activity.id}`}>Edit Activity</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
