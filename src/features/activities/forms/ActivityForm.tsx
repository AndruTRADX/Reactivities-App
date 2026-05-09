import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { useEffect, useMemo } from "react"

import { AddSquareIcon, Edit01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@sharedUi/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@sharedUi/card"
import { Spinner } from "@sharedUi/spinner"
import TextInput from "@sharedForms/TextInput"
import DateInput from "@sharedForms/DateInput"

import {
  ActivityRequestSchema,
  type ActivityRequest,
} from "@activities/schemas/request/ActivityRequest"
import type { ActivityResponse } from "@activities/schemas/response/ActivityResponse"
import { useCreateActivity, useUpdateActivity } from "@activities/hooks/api/useActivities"
import { useNavigate } from "react-router"
import LocationInput from "@/shared/components/forms/LocationInput"
import { SelectInput } from "@/shared/components/forms/SelectInput"

interface Props {
  activity?: ActivityResponse
}

export default function ActivityForm({ activity }: Props) {
  const { updateActivityAsync, isPendingUpdateActivity } = useUpdateActivity()
  const { createActivityAsync, isPendingCreateActivity } = useCreateActivity()
  const navigate = useNavigate()

  const categories = [
    { label: "Culture", value: "culture" },
    { label: "Drinks", value: "drinks" },
    { label: "Film", value: "film" },
    { label: "Food", value: "food" },
    { label: "Music", value: "music" },
    { label: "Travel", value: "travel" },
  ]

  const defaultValues = useMemo(() => {
    if (activity) {
      return {
        id: activity.id,
        title: activity.title,
        description: activity.description,
        category: activity.category,
        date: activity.date,
        location: {
          venue: activity.venue,
          city: activity.city,
          latitude: activity.latitude,
          longitude: activity.longitude,
        },
      }
    }
    return {
      location: {
        venue: "",
        city: "",
        latitude: 0,
        longitude: 0,
      },
    }
  }, [activity])

  const form = useForm({
    resolver: zodResolver(ActivityRequestSchema),
    defaultValues: defaultValues,
    mode: "onTouched",
  })

  useEffect(() => {
    form.reset(defaultValues)
  }, [activity, form, defaultValues])

  const {
    formState: { isValid },
  } = form

  async function onSubmit(data: ActivityRequest) {
    console.log(data)
    const {location, ...rest} = data;
    const flattenedData = {...rest, ...location}
    console.log(flattenedData)

    if (activity) {
      await updateActivityAsync(flattenedData, {
        onSuccess: () => {
          toast.success("Activity updated successfully")
          form.reset()
          navigate(`/activities/${activity.id}`)
        },
        onError: error => {
          toast.error(`Error updating the activity ${error.message}`)
        },
      })
    } else {
      await createActivityAsync(flattenedData, {
        onSuccess: (id) => {
          toast.success("Activity created successfully")
          form.reset()
          console.log(id);
          navigate(`/activities/${id}`)
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
  }, [isPendingUpdateActivity, isPendingCreateActivity, isValid])

  return (
    <Card className="w-full sm:max-w-xl">
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
        <CardDescription>
          {activity
            ? "Edit the details of your activity below."
            : "Fill in the information to schedule a new activity."}
        </CardDescription>
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
          <SelectInput
            label="Category"
            control={form.control}
            name="category"
            placeholder="Pick a category"
            items={categories}
          />
          <DateInput
            label="Date"
            control={form.control}
            name="date"
            placeholder="Enter activity date"
            withTime
            fromDate={new Date()}
          />
          <LocationInput
            label="Location"
            control={form.control}
            name="location"
            placeholder="Search for a venue or place"
          />
        </form>
      </CardContent>
      <CardFooter className="flex gap-2 justify-end">
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
