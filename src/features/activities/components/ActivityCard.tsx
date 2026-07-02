import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@sharedUi/card"
import { Button } from "@sharedUi/button"
import type { ActivityResponse } from "@activities/schemas/response/ActivityResponse"
import { useNavigate } from "react-router"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@sharedUi/avatar"
import { HugeiconsIcon } from "@hugeicons/react"
import { Clock, Location } from "@hugeicons/core-free-icons"
import { Badge } from "@/shared/components/ui/badge"

interface Props {
  activity: ActivityResponse
}

export default function ActivityCard({ activity }: Props) {
  const navigate = useNavigate()

  return (
    <Card className="mx-auto w-full overflow-hidden gap-3" key={activity.id}>
      <div className="flex px-7 gap-4 items-center">
        <Avatar className="w-16 h-16">
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" className="grayscale" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>

        <div className="w-full">
          <CardTitle className="font-semibold flex items-center justify-between gap-2">
            {activity.title}
            {activity.currentStatus === "Cancelled" && (
              <Badge variant="destructive" className="text-destructive border border-destructive">
                Cancelled
              </Badge>
            )}
            {activity.currentStatus === "Completed" && (
              <Badge
                variant="default"
                className="text-positive bg-positive/25 border border-positive"
              >
                Completed
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Hosted by{" "}
            <Button variant="link" className="px-0">
              Bob
            </Button>
          </CardDescription>
        </div>
      </div>
      <CardContent>
        <div className="flex gap-2 text-muted-foreground">
          <div className="flex min-w-43 items-center gap-2">
            <HugeiconsIcon icon={Clock} className="text-primary min-w-5" />
            <p>{format(activity.date, "yyyy/MM/dd/ hh:mm:ss")}</p>
          </div>
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Location} className="text-primary min-w-5" />
            <p>{`${activity?.city} - ${activity?.venue}`}</p>
          </div>
        </div>
      </CardContent>
      <CardContent className="text-muted-foreground">Attendees go here</CardContent>
      <CardContent className="text-muted-foreground">
        <p>{activity.description}</p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button onClick={() => navigate(`/activities/${activity.id}`)}>View Event</Button>
      </CardFooter>
    </Card>
  )
}
