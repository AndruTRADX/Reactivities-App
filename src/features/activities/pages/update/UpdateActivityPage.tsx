import ActivityForm from "@activities/forms/ActivityForm"
import { useParams } from "react-router"
import { useGetActivityById } from "@activities/hooks/api/useActivities"
import { SkeletonForm } from "./components/SkeletonForm"
import FormWrapper from "@/shared/components/common/FormWrapper"

export default function UpdateActivityPage() {
  const { id } = useParams()
  const { activity, isLoadingActivity: isPendingActivity } = useGetActivityById(id ?? "")

  if (isPendingActivity) {
    return <SkeletonForm />
  }

  return (
    <FormWrapper>
      <ActivityForm activity={activity} />
    </FormWrapper>
  )
}
