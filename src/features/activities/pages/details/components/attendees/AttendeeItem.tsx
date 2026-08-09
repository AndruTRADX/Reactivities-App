import { useCallback, useMemo } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Avatar, AvatarFallback, AvatarImage } from "@sharedUi/avatar"
import { Badge } from "@sharedUi/badge"
import { Button } from "@sharedUi/button"
import { defaultImage64 } from "@/shared/constants/defaultImage"
import type { AttendeesResponse } from "@activities/schemas/response/AttendeesResponse"
import type { UserResponse } from "@sharedSchemas/response/UserResponse"
import { useFollowProfile, useUnfollowProfile } from "@profile/hooks/api/useProfile"

interface Props {
  attendee: AttendeesResponse
}

export default function AttendeeItem({ attendee }: Props) {
  const queryClient = useQueryClient()

  const isCurrentUser = useMemo(() => {
    return attendee.user.id === queryClient.getQueryData<UserResponse>(["user"])?.id
  }, [attendee.user.id, queryClient])

  const { followProfileAsync, isPendingFollowProfile } = useFollowProfile()
  const { unfollowProfileAsync, isPendingUnfollowProfile } = useUnfollowProfile()

  const handleToggleFollow = useCallback(async () => {
    if (attendee.user.following) {
      await unfollowProfileAsync({ targetUserId: attendee.user.id })
    } else {
      await followProfileAsync({ targetUserId: attendee.user.id })
    }
  }, [attendee.user.following, attendee.user.id, followProfileAsync, unfollowProfileAsync])

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
          {!isCurrentUser && (
            <Button
              size="xs"
              variant="link"
              disabled={isPendingFollowProfile || isPendingUnfollowProfile}
              onClick={handleToggleFollow}
            >
              {attendee.user.following ? "Unfollow" : "Follow"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
