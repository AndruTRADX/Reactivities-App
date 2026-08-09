import type { PagedRequest } from "@sharedSchemas/request/PagedRequest"
import type { PagedResponse } from "@sharedSchemas/response/PagedResponse"
import type { UserProfileResponse } from "@sharedSchemas/response/UserProfileResponse"
import type { UserResponse } from "@sharedSchemas/response/UserResponse"
import { useOptimisticUpdate } from "@sharedHooks/useOptimisticUpdate"
import agent from "@/shared/services/agent"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

/**
 * Matches any cache entry that could be showing this user's follow state as a
 * nested row — followers/following lists, a single activity's attendees, or the
 * paginated activities list. There's no way to know in advance which activity/list
 * a given target user appears in, so this is intentionally broad: cheap background
 * refetches for currently-mounted queries, correct end state for everything else.
 */
const showsFollowState = (queryKey: readonly unknown[]) =>
  (queryKey[0] === "profile" && (queryKey[2] === "followers" || queryKey[2] === "following")) ||
  queryKey[0] === "activity" ||
  queryKey[0] === "activities"

export const useFollowProfile = () => {
  const queryClient = useQueryClient()
  const currentUserId = queryClient.getQueryData<UserResponse>(["user"])?.id

  const { onMutate, onError } = useOptimisticUpdate<UserProfileResponse, { targetUserId: string }>({
    optimisticQueryKey: ({ targetUserId }) => ["profile", targetUserId],
    updater: profile => ({
      ...profile,
      following: true,
      followersCount: profile.followersCount + 1,
    }),
  })

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ targetUserId }: { targetUserId: string }) => {
      return await agent.post(`/profile/${targetUserId}/follow`)
    },
    onMutate,
    onError,
    onSuccess: async (_data, { targetUserId }) => {
      await queryClient.invalidateQueries({ queryKey: ["profile", targetUserId] })
      await queryClient.invalidateQueries({ queryKey: ["profile", currentUserId] })
      await queryClient.invalidateQueries({
        predicate: query => showsFollowState(query.queryKey),
      })
    },
  })

  return {
    followProfileAsync: mutateAsync,
    isPendingFollowProfile: isPending,
  }
}

export const useUnfollowProfile = () => {
  const queryClient = useQueryClient()
  const currentUserId = queryClient.getQueryData<UserResponse>(["user"])?.id

  const { onMutate, onError } = useOptimisticUpdate<UserProfileResponse, { targetUserId: string }>({
    optimisticQueryKey: ({ targetUserId }) => ["profile", targetUserId],
    updater: profile => ({
      ...profile,
      following: false,
      followersCount: Math.max(0, profile.followersCount - 1),
    }),
  })

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ targetUserId }: { targetUserId: string }) => {
      return await agent.delete(`/profile/${targetUserId}/follow`)
    },
    onMutate,
    onError,
    onSuccess: async (_data, { targetUserId }) => {
      await queryClient.invalidateQueries({ queryKey: ["profile", targetUserId] })
      await queryClient.invalidateQueries({ queryKey: ["profile", currentUserId] })
      await queryClient.invalidateQueries({
        predicate: query => showsFollowState(query.queryKey),
      })
    },
  })

  return {
    unfollowProfileAsync: mutateAsync,
    isPendingUnfollowProfile: isPending,
  }
}

export const useGetPagedFollowers = (profileId: string | undefined, params: PagedRequest) => {
  const {
    data: pagedFollowers,
    isLoading: isLoadingPagedFollowers,
    error: errorPagedFollowers,
  } = useQuery<PagedResponse<UserProfileResponse>>({
    queryKey: ["profile", profileId, "followers", params],
    queryFn: () =>
      agent.get<PagedResponse<UserProfileResponse>>(`/profile/${profileId}/followers`, {
        params,
      }),
    placeholderData: keepPreviousData,
    enabled: !!profileId,
  })

  return {
    pagedFollowers,
    isLoadingPagedFollowers,
    errorPagedFollowers,
  }
}

export const useGetPagedFollowing = (profileId: string | undefined, params: PagedRequest) => {
  const {
    data: pagedFollowing,
    isLoading: isLoadingPagedFollowing,
    error: errorPagedFollowing,
  } = useQuery<PagedResponse<UserProfileResponse>>({
    queryKey: ["profile", profileId, "following", params],
    queryFn: () =>
      agent.get<PagedResponse<UserProfileResponse>>(`/profile/${profileId}/following`, {
        params,
      }),
    placeholderData: keepPreviousData,
    enabled: !!profileId,
  })

  return {
    pagedFollowing,
    isLoadingPagedFollowing,
    errorPagedFollowing,
  }
}
