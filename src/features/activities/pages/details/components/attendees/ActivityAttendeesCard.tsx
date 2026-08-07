import { Card, CardContent, CardHeader, CardTitle } from "@sharedUi/card"
import { Separator } from "@sharedUi/separator"
import type { AttendeesResponse } from "@activities/schemas/response/AttendeesResponse"
import AttendeeItem from "./AttendeeItem"

interface Props {
  attendees: AttendeesResponse[]
}

export default function ActivityAttendeesCard({ attendees }: Props) {
  return (
    <Card className="col-span-1 h-fit">
      <CardHeader>
        <CardTitle className="font-semibold">
          {attendees.length} {attendees.length === 1 ? "Person" : "People"} Going
        </CardTitle>
        <Separator />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {attendees.map(attendee => (
          <AttendeeItem key={attendee.user.id} attendee={attendee} />
        ))}
      </CardContent>
    </Card>
  )
}
