import { useCallback, useMemo } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@sharedUi/button"
import { defaultImage64 } from "@/shared/constants/defaultImage"
import { Avatar, AvatarFallback, AvatarImage } from "@sharedUi/avatar"
import type { UserProfileResponse } from "@sharedSchemas/response/UserProfileResponse"
import type { UserResponse } from "@sharedSchemas/response/UserResponse"
import { useFollowProfile, useUnfollowProfile } from "@profile/hooks/api/useProfile"

interface Props {
  profile: UserProfileResponse
}

export default function ProfileHeader({ profile }: Props) {
  const queryClient = useQueryClient()

  const isCurrentUser = useMemo(() => {
    return profile.id === queryClient.getQueryData<UserResponse>(["user"])?.id
  }, [profile.id, queryClient])

  const { followProfileAsync, isPendingFollowProfile } = useFollowProfile()
  const { unfollowProfileAsync, isPendingUnfollowProfile } = useUnfollowProfile()

  const handleToggleFollow = useCallback(async () => {
    if (profile.following) {
      await unfollowProfileAsync({ targetUserId: profile.id })
    } else {
      await followProfileAsync({ targetUserId: profile.id })
    }
  }, [profile.following, profile.id, followProfileAsync, unfollowProfileAsync])

  return (
    <div className="w-full flex flex-col">
      <div id="gradient-profile" className="bg-profile-header h-28 sm:h-36"></div>

      <div className="-mt-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="glass w-fit p-3.25 -translate-y-8 rounded-2xl bg-background/40 backdrop-blur-lg backdrop-saturate-150 inset-ring-1 inset-ring-glass-highlight/60 dark:inset-ring-glass-highlight/40">
            <Avatar className="w-32 h-32 sm:w-40 sm:h-40">
              <AvatarImage
                src={
                  profile?.imageUrl?.replace(
                    "/upload/",
                    "/upload/w_280,h_280,c_fill,f_auto,dpr_2/"
                  ) ?? defaultImage64
                }
                alt={profile.displayName}
                className="rounded-xl"
              />
              <AvatarFallback>{profile.displayName}</AvatarFallback>
            </Avatar>
          </div>

          <div className="flex flex-col gap-2 max-w-full sm:max-w-88 sm:mb-2">
            <div className="flex flex-col gap-1">
              <h2 className="font-semibold text-foreground text-lg">{profile.displayName}</h2>
            </div>
            {!isCurrentUser && (
              <Button
                size="sm"
                variant={profile.following ? "destructive" : "default"}
                disabled={isPendingFollowProfile || isPendingUnfollowProfile}
                onClick={handleToggleFollow}
              >
                {profile.following ? "Unfollow" : "Follow"}
              </Button>
            )}
          </div>
        </div>

        <div className="flex gap-6 items-center sm:mb-2">
          <div className="flex flex-col items-center">
            <p className="text-muted-foreground text-xs">Followers</p>
            <h1 className="text-3xl text-foreground">{profile.followersCount}</h1>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-muted-foreground text-xs">Following</p>
            <h1 className="text-3xl text-foreground">{profile.followingsCount}</h1>
          </div>
        </div>
      </div>
    </div>
  )
}
