import { useCallback, useMemo } from "react"
import { Link } from "react-router"
import { useQueryClient } from "@tanstack/react-query"
import { Avatar, AvatarFallback, AvatarImage } from "@sharedUi/avatar"
import { Button } from "@sharedUi/button"
import { defaultImage64 } from "@/shared/constants/defaultImage"
import type { UserProfileResponse } from "@sharedSchemas/response/UserProfileResponse"
import type { UserResponse } from "@sharedSchemas/response/UserResponse"
import { useFollowProfile, useUnfollowProfile } from "@profile/hooks/api/useProfile"

interface Props {
  user: UserProfileResponse
}

export function FollowUserRow({ user }: Props) {
  const queryClient = useQueryClient()

  const isCurrentUser = useMemo(() => {
    return user.id === queryClient.getQueryData<UserResponse>(["user"])?.id
  }, [user.id, queryClient])

  const { followProfileAsync, isPendingFollowProfile } = useFollowProfile()
  const { unfollowProfileAsync, isPendingUnfollowProfile } = useUnfollowProfile()

  const handleToggleFollow = useCallback(async () => {
    if (user.following) {
      await unfollowProfileAsync({ targetUserId: user.id })
    } else {
      await followProfileAsync({ targetUserId: user.id })
    }
  }, [user.following, user.id, followProfileAsync, unfollowProfileAsync])

  return (
    <div className="flex items-center justify-between gap-3">
      <Link to={`/profile/${user.id}`} className="flex items-center gap-3 min-w-0">
        <Avatar size="lg">
          <AvatarImage
            src={
              user?.imageUrl?.replace("/upload/", "/upload/w_30,h_30,c_fill,f_auto,dpr_2/") ??
              defaultImage64
            }
            alt={user.displayName}
          />
          <AvatarFallback>{user.displayName}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="font-medium text-foreground truncate">{user.displayName}</span>
          {user.biography && (
            <span className="text-xs text-muted-foreground truncate">{user.biography}</span>
          )}
        </div>
      </Link>

      {!isCurrentUser && (
        <Button
          size="sm"
          variant={user.following ? "destructive" : "default"}
          disabled={isPendingFollowProfile || isPendingUnfollowProfile}
          onClick={handleToggleFollow}
        >
          {user.following ? "Unfollow" : "Follow"}
        </Button>
      )}
    </div>
  )
}
