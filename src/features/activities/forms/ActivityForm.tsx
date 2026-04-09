import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import TextInput from "@/components/forms/TextInput"
import { ActivityRequestSchema, type ActivityRequest } from "../schemas/request/ActivityRequest"
import type { ActivityResponse } from "@activities/schemas/response/ActivityResponse"
import { useUpdateActivity } from "@activities/hooks/api/useActivities"
import { toast } from "sonner"

interface Props {
  activity: ActivityResponse
}

export default function ActivityForm({ activity }: Props) {
  const { updateActivityAsync } = useUpdateActivity()
  const form = useForm({
    resolver: zodResolver(ActivityRequestSchema),
    defaultValues: activity,
  })

  async function onSubmit(data: ActivityRequest) {
    await updateActivityAsync(data, {
      onSuccess: () => {
        toast.success("Activity updated successfully")
        form.reset()
      },
      onError: error => {
        toast.error(`Error updating the activity ${error.message}`)
      },
    })
  }

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Create Activity</CardTitle>
        <CardDescription>Help us improve by reporting bugs you encounter.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
          <TextInput
            label="Title"
            control={form.control}
            name="title"
            placeholder="Enter activity title"
          />
          <TextInput
            label="Description"
            control={form.control}
            name="description"
            multiline
            rows={3}
            placeholder="Enter a detailed description"
          />
        </form>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          Reset
        </Button>
        <Button type="submit" form="form-rhf-demo">
          Submit
        </Button>
      </CardFooter>
    </Card>
  )
}
