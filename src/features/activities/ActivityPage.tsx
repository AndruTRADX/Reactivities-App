import { useMemo } from "react"
import { useGetActivities } from "./hooks/api/useActivities"
import ActivityCard from "./cards/ActivityCard"

export default function ActivityPage() {
  const { pagedActivities } = useGetActivities()

  const activities = useMemo(() => {
    return pagedActivities?.data ?? []
  }, [pagedActivities])

  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="flex flex-col col-span-3 gap-4">
        {activities.map(activity => (
          <ActivityCard activity={activity} key={activity.id} />
        ))}
      </div>
      <div className="col-span-1">Activity filters?</div>
    </div>
  )
}
