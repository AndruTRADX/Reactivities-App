import { useState } from "react"
import { useGetActivities } from "./hooks/api/useActivities"
import type { ActivityFilter, ActivitySort } from "./schemas/request/ActivitySpecificationParams"
import ActivityCard from "./components/ActivityCard"
import { ActivityFilters } from "./components/ActivityFilters"
import { SkeletonPage } from "./components/SkeletonPage"
import { Card, CardContent, CardHeader, CardTitle } from "@sharedUi/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { Filter } from "@hugeicons/core-free-icons"
import { NoContent } from "@/shared/components/common/NotFound"
import { ErrorShow } from "@/shared/components/common/ErrorShow"
import { PaginationControl } from "@/shared/components/common/PaginationControl"
import { usePagedParams } from "@/shared/hooks/usePagedParams"

export default function ActivityPage() {
  const { pageIndex, pageSize, sort, setPageIndex, setSort } = usePagedParams<ActivitySort>(
    "activities",
    6
  )

  const [filter, setFilter] = useState<ActivityFilter>("all")

  const { pagedActivities, isLoadingActivities, errorPagedActivities } = useGetActivities({
    pageIndex,
    pageSize,
    sort,
    imGoing: filter === "going",
    imHosting: filter === "hosting",
  })

  const activities = pagedActivities?.data ?? []

  const handleFilterChange = (nextFilter: ActivityFilter) => {
    setFilter(nextFilter)
    setPageIndex(1)
  }

  if (isLoadingActivities) {
    return <SkeletonPage />
  }

  if (errorPagedActivities) {
    return <ErrorShow error={errorPagedActivities} />
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-card px-4 py-3 ring-1 ring-foreground/10 lg:hidden">
        <ActivityFilters
          variant="toolbar"
          sort={sort}
          filter={filter}
          onSortChange={setSort}
          onFilterChange={handleFilterChange}
        />
      </div>

      {activities.length === 0 ? (
        <div className="lg:col-span-3">
          <NoContent
            title="No activities"
            description={
              filter === "all"
                ? "No activities have been created"
                : "No activities match the selected filter"
            }
          />
        </div>
      ) : (
        <div className="flex flex-col lg:col-span-3 gap-4">
          {activities.map(activity => (
            <ActivityCard activity={activity} key={activity.id} />
          ))}
          <PaginationControl
            pageIndex={pagedActivities?.pageIndex ?? pageIndex}
            pageCount={pagedActivities?.pageCount ?? 1}
            onPageChange={setPageIndex}
          />
        </div>
      )}

      <Card className="col-span-1 hidden h-fit lg:flex">
        <CardHeader>
          <CardTitle className="flex gap-2 font-semibold items-center">
            <HugeiconsIcon className="text-primary" icon={Filter} strokeWidth={2} size={20} />{" "}
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <ActivityFilters
            variant="sidebar"
            sort={sort}
            filter={filter}
            onSortChange={setSort}
            onFilterChange={handleFilterChange}
          />
        </CardContent>
      </Card>
    </div>
  )
}
