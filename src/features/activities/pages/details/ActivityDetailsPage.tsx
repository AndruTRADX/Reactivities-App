import { Card } from "@sharedUi/card"
import { useNavigate, useParams } from "react-router"
import { useCancelActivity, useGetActivityById } from "@activities/hooks/api/useActivities"
import { SkeletonPage } from "./components/SkeletonPage"
import { NoContent } from "@/shared/components/common/NotFound"
import { CancelActivityDialog } from "./components/activity/CancelActivityDialog"
import { toast } from "sonner"
import { useState, useCallback } from "react"
import type { CancelActivityRequest } from "@activities/schemas/request/CancelActivityRequest"
import { ErrorShow } from "@/shared/components/common/ErrorShow"
import { useConfirmDialog } from "@sharedHooks/useConfirmDialog"
import { useJoinActivity, useLeaveActivity } from "@activities/hooks/api/useAttendees"
import ActivityHeroSection from "./components/activity/ActivityHeroSection"
import ActivityInfoSection from "./components/activity/ActivityInfoSection"
import ActivityCommentsSection from "./components/comments/ActivityCommentsSection"
import ActivityAttendeesCard from "./components/attendees/ActivityAttendeesCard"

export default function ActivityDetailsPage() {
  const { id } = useParams()
  const { activity, isLoadingActivity: isPendingActivity, errorActivity } = useGetActivityById(id)
  const { cancelActivityAsync, isPendingCancelActivity } = useCancelActivity()
  const navigate = useNavigate()
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-3 overflow-hidden pt-0">
          <ActivityHeroSection
            activity={activity}
            isFinished={isFinished}
            onCancelClick={() => setCancelOpen(true)}
            isPendingCancelActivity={isPendingCancelActivity}
            onJoin={handleJoinActivity}
            isPendingJoinActivity={isPendingJoinActivity}
            onLeave={handleLeaveActivity}
            isPendingLeaveActivity={isPendingLeaveActivity}
          />
          <ActivityInfoSection activity={activity} />
          <ActivityCommentsSection activityId={activity.id} />
        </Card>

        <ActivityAttendeesCard attendees={attendees} />
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
