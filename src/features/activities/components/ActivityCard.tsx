import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@sharedUi/card"
import { Button } from "@sharedUi/button"
import type { ActivityResponse } from "@activities/schemas/response/ActivityResponse"
import { useNavigate } from "react-router"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "@sharedUi/avatar"
import { HugeiconsIcon } from "@hugeicons/react"
import { Clock, Location } from "@hugeicons/core-free-icons"
import { Badge } from "@sharedUi/badge"
import { ProfileCard } from "@/shared/components/common/ProfileCard"

interface Props {
  activity: ActivityResponse
}

const getBadges = (activity: ActivityResponse) =>
  [
    activity.currentStatus === "Cancelled" && [
      "Cancelled",
      "text-destructive bg-destructive/25 border border-destructive",
      "default",
    ],
    activity.currentStatus === "Completed" && [
      "Completed",
      "text-positive bg-positive/25 border border-positive",
      "default",
    ],
    activity.isHost && ["You are hosting", "text-foreground", "outline"],
    activity.isGoing && !activity.isHost && ["You are going", "text-foreground", "outline"],
  ].filter(Boolean) as [string, string, "default" | "outline"][]

export default function ActivityCard({ activity }: Props) {
  const navigate = useNavigate()

  return (
    <Card className="mx-auto w-full overflow-hidden gap-3" key={activity.id}>
      <div className="flex px-7 gap-4 items-center">
        <Avatar className="w-16 h-16">
          <AvatarImage src="https://github.com/shadcn.png" alt={activity.hostDisplayName} />
          <AvatarFallback>{activity.hostDisplayName}</AvatarFallback>
        </Avatar>

        <div className="w-full">
          <CardTitle className="font-semibold flex items-center justify-between gap-2">
            {activity.title}
            <div className="flex gap-1.5 items-center">
              {getBadges(activity).map(([label, className, variant]) => (
                <Badge key={label} variant={variant} className={className}>
                  {label}
                </Badge>
              ))}
            </div>
          </CardTitle>
          <CardDescription>
            Hosted by{" "}
            <Button
              variant="link"
              className="px-0"
              onClick={() => navigate(`/profiles/${activity.hostId}`)}
            >
              {activity.hostDisplayName}
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
      <CardContent>
        <AvatarGroup>
          {activity.attendees.map(attendee => (
            <ProfileCard user={attendee.user} />
          ))}
        </AvatarGroup>
      </CardContent>
      <CardContent className="text-muted-foreground">
        <p>{activity.description}</p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button onClick={() => navigate(`/activities/${activity.id}`)}>View Event</Button>
      </CardFooter>
    </Card>
  )
}
