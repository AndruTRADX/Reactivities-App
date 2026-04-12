import ActivityForm from "@activities/forms/ActivityForm"
import { useParams } from "react-router"
import { useGetActivityById } from "@activities/hooks/api/useActivities"
import { NoContent } from "@/shared/components/common/NotFound"
import { SkeletonForm } from "./components/SkeletonForm"

export default function UpdateActivityPage() {
  const { id } = useParams()
  const { activity, isPendingActivity } = useGetActivityById(id)

  if (isPendingActivity) {
    return <SkeletonForm />
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
    <div className="flex justify-center mt-4">
      <ActivityForm activity={activity} />
    </div>
  )
}
