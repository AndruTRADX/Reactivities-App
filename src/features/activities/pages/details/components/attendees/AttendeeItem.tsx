import { Avatar, AvatarFallback, AvatarImage } from "@sharedUi/avatar"
import { Badge } from "@sharedUi/badge"
import { Button } from "@sharedUi/button"
import { defaultImage64 } from "@/shared/constants/defaultImage"
import type { AttendeesResponse } from "@activities/schemas/response/AttendeesResponse"

interface Props {
  attendee: AttendeesResponse
}

export default function AttendeeItem({ attendee }: Props) {
  return (
    <div className="flex gap-3 items-center my-2">
      <Avatar size="lg">
        <AvatarImage
          src={attendee.user.imageUrl ?? defaultImage64}
          alt={attendee.user.displayName}
        />
        <AvatarFallback>{attendee.user.displayName}</AvatarFallback>
      </Avatar>
      <div className="flex w-full justify-between items-center">
        <h3 className="text-foreground font-semibold text-base">{attendee.user.displayName}</h3>
        <div className="flex flex-col items-center gap-1">
          {attendee.isHost && <Badge>Host</Badge>}
          <Button size="xs" variant="link">
            Follow
          </Button>
        </div>
      </div>
    </div>
  )
}
