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
import { useDeleteActivity, useGetActivityById } from "@activities/hooks/api/useActivities"
import { format } from "date-fns"
import { SkeletonPage } from "./components/SkeletonPage"
import { NoContent } from "@/shared/components/common/NotFound"
import { useConfirmDialog } from "@/shared/hooks/useConfirmDialog"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar, Info, Location } from "@hugeicons/core-free-icons"
import { Separator } from "@sharedUi/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@sharedUi/avatar"
import { Textarea } from "@/shared/components/ui/textarea"

export default function ActivityDetailsPage() {
  const { id } = useParams()
  const { activity, isPendingActivity } = useGetActivityById(id)
  const { deleteActivityAsync, isPendingDeleteActivity } = useDeleteActivity()
  const { confirmDelete } = useConfirmDialog()
  const navigate = useNavigate()

  if (isPendingActivity) {
    return <SkeletonPage />
  }

  if (!activity) {
    return (
      <NoContent
        title="Activity not found"
        description={`The activity with the id ${id} has not been found`}
      />
    )
  }

  const handleDelete = async () => {
    confirmDelete({
      description: `Delete activity "${activity.title}"? This action cannot be undone.`,
      onConfirm: async () => {
        await deleteActivityAsync(activity.id, {
          onSuccess: () => {
            toast.success("Activity deleted successfully")
            navigate('/activities')
          },
          onError: error => toast.error(`Error deleting the activity: ${error.message}`),
        })
      },
    })
  }

  return (
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
                  <Badge
                    variant="destructive"
                    className="text-foreground border border-destructive"
                  >
                    Cancelled
                  </Badge>
                </CardAction>
                <CardTitle className="font-semibold text-lg">{activity.title}</CardTitle>
                <CardDescription className="text-foreground">
                  Hosted by{" "}
                  <Button variant="link" size="icon-xs">
                    Bob
                  </Button>
                </CardDescription>
                <CardDescription className="text-foreground">
                  {format(activity.date, "d MMM yyyy 'at' h:mma")}
                </CardDescription>
              </CardHeader>

              <CardFooter className="p-0 gap-2 justify-end">
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isPendingDeleteActivity}
                >
                  Cancel Activity
                </Button>
                <Button asChild>
                  <Link to={`/update-activity/${activity.id}`}>Manage event</Link>
                </Button>
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
            <CardDescription className="flex gap-3">
              <HugeiconsIcon icon={Location} className="text-primary w-6" />
              <p className="w-full">{`${activity?.city} - ${activity?.venue}`}</p>
            </CardDescription>
          </CardContent>
          <CardContent>
            <Textarea placeholder="Enter comment (Enter to submit, SHIT + Enter for new line)." />
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
            <CardTitle className="font-semibold">2 People Going</CardTitle>
            <Separator />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex gap-3 items-center">
              <Avatar size="lg">
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="@shadcn"
                  className="grayscale"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className="flex w-full justify-between items-center">
                <h3 className="text-foreground font-semibold text-base">Bob</h3>
                <div className="flex flex-col items-center gap-1">
                  <Badge>Host</Badge>
                  <Button size="xs" variant="link">
                    Follow
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
