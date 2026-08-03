import { useState } from "react"
import { CardContent, CardDescription } from "@sharedUi/card"
import { Button } from "@sharedUi/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar, Info, Location } from "@hugeicons/core-free-icons"
import { format } from "date-fns"
import MapDisplay from "@/shared/components/common/MapDisplay"
import type { ActivityResponse } from "@activities/schemas/response/ActivityResponse"

interface Props {
  activity: ActivityResponse
}

export default function ActivityInfoSection({ activity }: Props) {
  const [mapOpen, setMapOpen] = useState(false)

  return (
    <>
      <CardContent className="pb-6 flex flex-col gap-6">
        <CardDescription className="flex gap-3 items-center">
          <HugeiconsIcon icon={Info} className="text-primary w-6" />
          <p className="w-full">{activity.description}</p>
        </CardDescription>
        <CardDescription className="flex gap-3 items-center">
          <HugeiconsIcon icon={Calendar} className="text-primary w-6" />
          <p className="w-full">{format(activity.date, "d MMM yyyy 'at' h:mma")}</p>
        </CardDescription>
        <CardDescription className="flex gap-3 items-start">
          <HugeiconsIcon icon={Location} className="text-primary w-6" />
          <p className="w-full">{`${activity.city} - ${activity.venue}`}</p>
          <Button onClick={() => setMapOpen(prev => !prev)}>
            {mapOpen ? "Hide map" : "Show map"}
          </Button>
        </CardDescription>
      </CardContent>
      {mapOpen && (
        <CardContent className="w-full h-100 block z-20">
          <MapDisplay position={[activity.latitude, activity.longitude]} venue={activity.venue} />
        </CardContent>
      )}
    </>
  )
}
