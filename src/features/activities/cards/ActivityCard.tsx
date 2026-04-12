import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@sharedUi/card"
import { Badge } from "@sharedUi/badge"
import { Button } from "@sharedUi/button"
import { Spinner } from "@sharedUi/spinner"
import type { ActivityResponse } from "@activities/schemas/response/ActivityResponse"
import { useDeleteActivity } from "@activities/hooks/api/useActivities"
import { toast } from "sonner"
import { useConfirmDialog } from "@sharedHooks/useConfirmDialog"
import { useNavigate } from "react-router"
import { format } from "date-fns"

interface Props {
  activity: ActivityResponse
}

export default function ActivityCard({ activity }: Props) {
  const { deleteActivityAsync, isPendingDeleteActivity } = useDeleteActivity()
  const { confirmDelete } = useConfirmDialog()
  const navigate = useNavigate()

  const handleDelete = async () => {
    confirmDelete({
      description: `Delete activity "${activity.title}"? This action cannot be undone.`,
      onConfirm: async () => {
        await deleteActivityAsync(activity.id, {
          onSuccess: () => toast.success("Activity deleted successfully"),
          onError: error => toast.error(`Error deleting the activity: ${error.message}`),
        })
      },
    })
  }

  return (
    <Card className="mx-auto w-full overflow-hidden gap-3" key={activity.id}>
      <CardHeader>
        <CardAction>
          <Badge variant="secondary">{activity.category}</Badge>
        </CardAction>
        <CardTitle>{activity.title}</CardTitle>
        <CardDescription className="text-primary">
          {format(activity.date, "yyyy/MM/dd/ hh:mm:ss")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">{activity.description}</p>
        <p className="text-sm">{`Place: ${activity?.city} - ${activity?.venue}`}</p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="destructive" onClick={handleDelete} disabled={isPendingDeleteActivity}>
          {isPendingDeleteActivity ? (
            <>
              <Spinner className="mr-2 h-4 w-4" /> Eliminando...
            </>
          ) : (
            "Delete"
          )}
        </Button>
        <Button onClick={() => navigate(`/activities/${activity.id}`)}>View Event</Button>
      </CardFooter>
    </Card>
  )
}
