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
import { useCreateActivity, useUpdateActivity } from "@activities/hooks/api/useActivities"
import { toast } from "sonner"
import { useEffect, useMemo } from "react"
import { Spinner } from "@/components/ui/spinner"
import { AddSquareIcon, Edit01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import DateInput from "@/components/forms/DateInput"
interface Props {
  activity: ActivityResponse
}

export default function ActivityForm({ activity }: Props) {
  const { updateActivityAsync, isPendingUpdateActivity } = useUpdateActivity()
  const { createActivityAsync, isPendingCreateActivity } = useCreateActivity()

  const form = useForm({
    resolver: zodResolver(ActivityRequestSchema),
    defaultValues: activity,
  })

  useEffect(() => {
    if (activity) {
      form.reset(activity)
    }
  }, [activity, form])

  const {
    formState: { isValid },
  } = form

  async function onSubmit(data: ActivityRequest) {
    console.log(data)

    if (activity) {
      await updateActivityAsync(data, {
        onSuccess: () => {
          toast.success("Activity updated successfully")
          form.reset()
        },
        onError: error => {
          toast.error(`Error updating the activity ${error.message}`)
        },
      })
    } else {
      await createActivityAsync(data, {
        onSuccess: () => {
          toast.success("Activity created successfully")
          form.reset()
        },
        onError: error => {
          toast.error(`Error creating the activity ${error.message}`)
        },
      })
    }
  }

  const isSubmitting = useMemo(() => {
    return isPendingUpdateActivity || isPendingCreateActivity
  }, [isPendingUpdateActivity, isPendingCreateActivity])

  const isDisabled = useMemo(() => {
    return isPendingUpdateActivity || isPendingCreateActivity || !isValid
  }, [isPendingUpdateActivity, isPendingCreateActivity, !isValid])

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle className="flex gap-2">
          {activity ? (
            <>
              <HugeiconsIcon icon={Edit01Icon} className="text-primary" /> Update
            </>
          ) : (
            <>
              <HugeiconsIcon icon={AddSquareIcon} className="text-primary" /> Create
            </>
          )}{" "}
          Activity
        </CardTitle>
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
          <TextInput
            label="Category"
            control={form.control}
            name="category"
            placeholder="Enter activity category"
          />
          <DateInput
            label="Date"
            control={form.control}
            name="date"
            placeholder="Enter activity date"
          />
          <TextInput
            label="Venue"
            control={form.control}
            name="venue"
            placeholder="Enter activity venue"
          />
          <TextInput
            label="City"
            control={form.control}
            name="city"
            placeholder="Enter activity city"
          />
        </form>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          Reset
        </Button>
        <Button type="submit" form="form-rhf-demo" disabled={isDisabled}>
          {isSubmitting ? (
            <>
              <Spinner /> Submitting
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
