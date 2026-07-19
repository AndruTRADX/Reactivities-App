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
import { Link, useNavigate, useParams } from "react-router"
import { useCancelActivity, useGetActivityById } from "@activities/hooks/api/useActivities"
import { format } from "date-fns"
import { SkeletonPage } from "./components/SkeletonPage"
import { NoContent } from "@/shared/components/common/NotFound"
import { CancelActivityDialog } from "./components/CancelActivityDialog"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar, Info, Location } from "@hugeicons/core-free-icons"
import { Separator } from "@sharedUi/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@sharedUi/avatar"
import { Textarea } from "@sharedUi/textarea"
import { useState, useCallback } from "react"
import type { CancelActivityRequest } from "@activities/schemas/request/CancelActivityRequest"
import MapDisplay from "@/shared/components/common/MapDisplay"
import { ErrorShow } from "@/shared/components/common/ErrorShow"

import type { ActivityResponse } from "@activities/schemas/response/ActivityResponse"
import { useConfirmDialog } from "@sharedHooks/useConfirmDialog"
import { useJoinActivity, useLeaveActivity } from "@activities/hooks/api/useAttendees"

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

export default function ActivityDetailsPage() {
  const { id } = useParams()
  const { activity, isLoadingActivity: isPendingActivity, errorActivity } = useGetActivityById(id)
  const { cancelActivityAsync, isPendingCancelActivity } = useCancelActivity()
  const navigate = useNavigate()
  const [mapOpen, setMapOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const { confirm } = useConfirmDialog()
  const { joinActivityAsync, isPendingJoinActivity } = useJoinActivity()
  const { leaveActivityAsync, isPendingLeaveActivity } = useLeaveActivity()

  const handleCancel = useCallback(
    async ({ reason }: CancelActivityRequest) => {
      if (!activity) return
      await cancelActivityAsync(
        { id: activity.id, reason },
        {
          onSuccess: () => {
            toast.success("Activity cancelled successfully")
            navigate("/activities")
          },
        }
      )
    },
    [activity, cancelActivityAsync, navigate]
  )

  const handleJoinActivity = useCallback(() => {
    if (!activity) return

    confirm({
      description: "Are you sure you want to join the activity?",
      title: "Join activity",
      confirmText: "Join",
      onConfirm: async () => {
        await joinActivityAsync(
          { id: activity.id },
          { onSuccess: () => toast.success("You're now going to this activity") }
        )
      },
    })
  }, [activity, confirm, joinActivityAsync])

  const handleLeaveActivity = useCallback(() => {
    if (!activity) return

    confirm({
      description: "Are you sure you want to leave the activity?",
      title: "Leave activity",
      confirmText: "Leave",
      confirmVariant: "destructive",
      onConfirm: async () => {
        await leaveActivityAsync(
          { id: activity.id },
          { onSuccess: () => toast.success("You've left the activity") }
        )
      },
    })
  }, [activity, confirm, leaveActivityAsync])

  if (isPendingActivity) {
    return <SkeletonPage />
  }

  if (errorActivity) {
    return <ErrorShow error={errorActivity} />
  }

  if (!activity) {
    return (
      <NoContent
        title="Activity not found"
        description={`The activity with the id ${id} has not been found`}
      />
    )
  }

  const attendees = activity.attendees ?? []
  const isFinished =
    activity.currentStatus === "Cancelled" || activity.currentStatus === "Completed"

  return (
    <>
      <div className="grid grid-cols-4 gap-4">
        <Card className="col-span-3 overflow-hidden pt-0">
          <div className="relative aspect-video w-full dark">
            <img
              src={`/categoryImages/${activity.category}.jpg`}
              alt="Event cover"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/35 backdrop-blur-xs" />
            <div className="absolute inset-0 z-40 flex flex-col gap-1 justify-end p-6 text-foreground">
              <CardHeader className="p-0">
                <CardAction className="flex gap-2">
                  <Badge variant="outline" className="text-foreground">
                    {activity.category}
                  </Badge>
                </CardAction>
                <CardTitle className="font-semibold text-lg flex items-center gap-2">
                  {activity.title}
                  {getActivityStatusBadges(activity).map(([label, className]) => (
                    <Badge key={label} variant="default" className={className}>
                      {label}
                    </Badge>
                  ))}
                </CardTitle>
                <CardDescription className="text-foreground flex items-center gap-1.5">
                  Hosted by
                  <Button variant="link" size="icon-xs" asChild>
                    <Link to={`/profiles/${activity.hostId}`}>{activity.hostDisplayName}</Link>
                  </Button>
                </CardDescription>
                <CardDescription className="text-foreground">
                  {format(activity.date, "d MMM yyyy 'at' h:mma")}
                </CardDescription>
              </CardHeader>
              <CardFooter className="p-0 gap-2 justify-end">
                <CardFooter className="p-0 gap-2 justify-end">
                  {!isFinished && (
                    <>
                      {activity.isHost && (
                        <>
                          <Button
                            variant="destructive"
                            onClick={() => setCancelOpen(true)}
                            disabled={isPendingCancelActivity}
                          >
                            Cancel Activity
                          </Button>
                          <Button asChild>
                            <Link to={`/update-activity/${activity.id}`}>Manage event</Link>
                          </Button>
                        </>
                      )}
                      {!activity.isGoing && (
                        <Button
                          variant="default"
                          onClick={handleJoinActivity}
                          disabled={isPendingJoinActivity}
                        >
                          Join activity
                        </Button>
                      )}
                      {activity.isGoing && !activity.isHost && (
                        <Button
                          variant="destructive"
                          onClick={handleLeaveActivity}
                          disabled={isPendingLeaveActivity}
                        >
                          Leave activity
                        </Button>
                      )}
                    </>
                  )}
                </CardFooter>
              </CardFooter>
            </div>
          </div>
          <CardContent className="pb-6 flex flex-col gap-6">
            <CardDescription className="flex gap-3">
              <HugeiconsIcon icon={Info} className="text-primary mt-1 w-6" />
              <p className="w-full">{activity.description}</p>
            </CardDescription>
            <CardDescription className="flex gap-3">
              <HugeiconsIcon icon={Calendar} className="text-primary w-6" />
              <p className="w-full">{format(activity.date, "d MMM yyyy 'at' h:mma")}</p>
            </CardDescription>
            <CardDescription className="flex gap-3 items-center">
              <HugeiconsIcon icon={Location} className="text-primary w-6" />
              <p className="w-full">{`${activity.city} - ${activity.venue}`}</p>
              <Button onClick={() => setMapOpen(prev => !prev)}>
                {mapOpen ? "Hide map" : "Show map"}
              </Button>
            </CardDescription>
          </CardContent>
          {mapOpen && (
            <CardContent className="w-full h-100 block z-20">
              <MapDisplay
                position={[activity.latitude, activity.longitude]}
                venue={activity.venue}
              />
            </CardContent>
          )}
          <CardContent>
            <Textarea placeholder="Enter comment (Enter to submit, SHIFT + Enter for new line)." />
          </CardContent>
          <CardContent>
            <div className="flex gap-3 items-center">
              <Avatar size="lg">
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="@shadcn"
                  className="grayscale"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-primary font-semibold text-base">Bob</h3>
                  <p className="text-muted-foreground text-xs">2 hours ago</p>
                </div>
                <p className="text-foreground">Comment goes here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="font-semibold">
              {attendees.length} {attendees.length === 1 ? "Person" : "People"} Going
            </CardTitle>
            <Separator />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {attendees.map(attendee => (
              <div key={attendee.user.id} className="flex gap-3 items-center my-2">
                <Avatar size="lg">
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt={attendee.user.displayName}
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="flex w-full justify-between items-center">
                  <h3 className="text-foreground font-semibold text-base">
                    {attendee.user.displayName}
                  </h3>
                  <div className="flex flex-col items-center gap-1">
                    {attendee.isHost && <Badge>Host</Badge>}
                    <Button size="xs" variant="link">
                      Follow
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <CancelActivityDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onConfirm={handleCancel}
        isPending={isPendingCancelActivity}
      />
    </>
  )
}
