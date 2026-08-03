import { Badge } from "@sharedUi/badge"
import { Button } from "@sharedUi/button"
import { CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@sharedUi/card"
import { Link } from "react-router"
import { format } from "date-fns"
import type { ActivityResponse } from "@activities/schemas/response/ActivityResponse"

const getActivityStatusBadges = (activity: ActivityResponse) =>
  [
    activity.currentStatus === "Cancelled" && [
      "Cancelled",
      "text-destructive bg-destructive/25 border border-destructive",
    ],
    activity.currentStatus === "Completed" && [
      "Completed",
      "text-positive bg-positive/25 border border-positive",
    ],
  ].filter(Boolean) as [string, string][]

interface Props {
  activity: ActivityResponse
  isFinished: boolean
  onCancelClick: () => void
  isPendingCancelActivity: boolean
  onJoin: () => void
  isPendingJoinActivity: boolean
  onLeave: () => void
  isPendingLeaveActivity: boolean
}

export default function ActivityHeroSection({
  activity,
  isFinished,
  onCancelClick,
  isPendingCancelActivity,
  onJoin,
  isPendingJoinActivity,
  onLeave,
  isPendingLeaveActivity,
}: Props) {
  return (
    <div className="relative aspect-video w-full">
      <img
        src={`/categoryImages/${activity.category}.jpg`}
        alt="Event cover"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" />
      <div className="absolute inset-0 z-40 flex flex-col gap-1 justify-end p-4 sm:p-6">
        <CardHeader className="p-0">
          <CardAction className="flex gap-2">
            <Badge variant="outline" className="text-foreground">
              {activity.category}
            </Badge>
          </CardAction>
          <CardTitle className="font-semibold text-lg flex flex-wrap items-center gap-2 text-white">
            {activity.title}
            {getActivityStatusBadges(activity).map(([label, className]) => (
              <Badge key={label} variant="default" className={className}>
                {label}
              </Badge>
            ))}
          </CardTitle>
          <CardDescription className="text-white flex items-center gap-1.5">
            Hosted by
            <Button variant="link" size="icon-xs" asChild>
              <Link to={`/profiles/${activity.hostId}`}>{activity.hostDisplayName}</Link>
            </Button>
          </CardDescription>
          <CardDescription className="text-white">
            {format(activity.date, "d MMM yyyy 'at' h:mma")}
          </CardDescription>
        </CardHeader>
        <CardFooter className="p-0 gap-2 flex-wrap justify-end">
          {!isFinished && (
            <>
              {activity.isHost && (
                <>
                  <Button
                    variant="glass-destructive"
                    onClick={onCancelClick}
                    disabled={isPendingCancelActivity}
                  >
                    Cancel Activity
                  </Button>
                  <Button asChild variant="glass-default">
                    <Link to={`/update-activity/${activity.id}`}>Manage event</Link>
                  </Button>
                </>
              )}
              {!activity.isGoing && (
                <Button variant="glass-default" onClick={onJoin} disabled={isPendingJoinActivity}>
                  Join activity
                </Button>
              )}
              {activity.isGoing && !activity.isHost && (
                <Button variant="glass-default" onClick={onLeave} disabled={isPendingLeaveActivity}>
                  Leave activity
                </Button>
              )}
            </>
          )}
        </CardFooter>
      </div>
    </div>
  )
}
