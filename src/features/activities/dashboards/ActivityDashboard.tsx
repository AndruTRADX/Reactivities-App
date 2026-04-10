import ActivityForm from "@activities/forms/ActivityForm"
import { useGetActivities } from "@activities/hooks/api/useActivities"
import ActivityCard from "@activities/dashboards/ActivityCard"

export default function ActivityDashboard() {
  const { pagedActivities } = useGetActivities()

  const activities = pagedActivities?.data ?? []

  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="flex flex-col col-span-3 gap-4">
        {activities.map(activity => (
          <ActivityCard activity={activity} key={activity.id} />
        ))}
      </div>
      <div className="col-span-1">
        <ActivityForm activity={activities[0]} />
      </div>
    </div>
  )
}
