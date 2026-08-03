import { Avatar, AvatarFallback, AvatarImage } from "@sharedUi/avatar"
import { Badge } from "@sharedUi/badge"
import { Button } from "@sharedUi/button"
import { Card, CardContent, CardHeader, CardTitle } from "@sharedUi/card"
import { Separator } from "@sharedUi/separator"
import { defaultImage64 } from "@/shared/constants/defaultImage"
import type { AttendeesResponse } from "@activities/schemas/response/AttendeesResponse"

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
          <div key={attendee.user.id} className="flex gap-3 items-center my-2">
            <Avatar size="lg">
              <AvatarImage
                src={attendee.user.imageUrl ?? defaultImage64}
                alt={attendee.user.displayName}
              />
              <AvatarFallback>{attendee.user.displayName}</AvatarFallback>
            </Avatar>
            <div className="flex w-full justify-between items-center">
              <h3 className="text-foreground font-semibold text-base">
                {attendee.user.displayName}
              </h3>
              <div className="flex flex-col items-center gap-1">
                {attendee.isHost && <Badge>Host</Badge>}
                <Button size="xs" variant="link">
                  Follow
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
