import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ActivityResponse } from "../schemas/response/ActivityResponse"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useDeleteActivity } from "../hooks/api/useActivities"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { useConfirmDialog } from "@/shared/hooks/useConfirmDialog"

interface Props {
  activity: ActivityResponse
}

export default function ActivityCard({ activity }: Props) {
  const { deleteActivityAsync, isPendingDeleteActivity } = useDeleteActivity()
  const { confirmDelete } = useConfirmDialog()

  const handleDelete = async () => {
    console.log(activity.id)

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
    <Card className="relative mx-auto w-full overflow-hidden pt-0" key={activity.id}>
      <div className="relative aspect-video w-full max-h-42">
        <div className="absolute inset-0 z-10 bg-black/35" />
        <img
          src={`/categoryImages/${activity.category}.jpg`}
          alt="Event cover"
          className="h-full w-full object-cover brightness-60 grayscale dark:brightness-40"
        />
      </div>

      <CardHeader>
        <CardAction>
          <Badge variant="secondary">{activity.category}</Badge>
        </CardAction>
        <CardTitle>{activity.title}</CardTitle>
        <CardDescription>{activity.description}</CardDescription>
      </CardHeader>
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
        <Button className="">View Event</Button>
      </CardFooter>
    </Card>
  )
}
