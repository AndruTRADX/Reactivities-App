import { useGetActivities } from "./hooks/api/useActivities"
import {
  activitySortLabels,
  activitySortOptions,
  type ActivitySort,
} from "./schemas/request/ActivitySpecificationParams"
import ActivityCard from "./components/ActivityCard"
import { SkeletonPage } from "./components/SkeletonPage"
import { Card, CardContent, CardHeader, CardTitle } from "@sharedUi/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { Filter } from "@hugeicons/core-free-icons"
import { RadioGroup, RadioGroupItem } from "@sharedUi/radio-group"
import { Label } from "@sharedUi/label"
import { ComboboxSelect } from "@/shared/components/common/ComboboxSelect"
import { NoContent } from "@/shared/components/common/NotFound"
import { ErrorShow } from "@/shared/components/common/ErrorShow"
import { PaginationControl } from "@/shared/components/common/PaginationControl"
import { usePagedParams } from "@/shared/hooks/usePagedParams"

export default function ActivityPage() {
  const { pageIndex, pageSize, sort, setPageIndex, setSort } =
    usePagedParams<ActivitySort>("activities")

  const { pagedActivities, isLoadingActivities, errorPagedActivities } = useGetActivities({
    pageIndex,
    pageSize,
    sort,
  })

  const activities = pagedActivities?.data ?? []

  if (isLoadingActivities) {
    return <SkeletonPage />
  }

  if (errorPagedActivities) {
    return <ErrorShow error={errorPagedActivities} />
  }

  if (!activities || activities.length === 0) {
    return <NoContent title="No activities" description={`Not activities have been created`} />
  }

  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="flex flex-col col-span-3 gap-4">
        {activities.map(activity => (
          <ActivityCard activity={activity} key={activity.id} />
        ))}
        <PaginationControl
          pageIndex={pagedActivities?.pageIndex ?? pageIndex}
          pageCount={pagedActivities?.pageCount ?? 1}
          onPageChange={setPageIndex}
        />
      </div>
      <Card className="col-span-1 h-fit">
        <CardHeader>
          <CardTitle className="flex gap-2 font-semibold items-center">
            <HugeiconsIcon className="text-primary" icon={Filter} strokeWidth={2} size={20} />{" "}
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label>Sort by</Label>
            <ComboboxSelect
              value={sort}
              onValueChange={value => value && setSort(value as ActivitySort)}
              placeholder="Default"
              items={activitySortOptions.map(option => ({
                label: activitySortLabels[option],
                value: option,
              }))}
            />
          </div>

          <RadioGroup defaultValue="all" className="w-fit">
            <div className="flex items-center gap-3">
              <RadioGroupItem value="all" id="r1" />
              <Label htmlFor="r1">All</Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="going" id="r2" />
              <Label htmlFor="r2">I'm going</Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="hosting" id="r3" />
              <Label htmlFor="r3">I'm hosting</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  )
}
