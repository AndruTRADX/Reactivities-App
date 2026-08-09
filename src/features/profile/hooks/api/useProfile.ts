import type { PhotoResponse } from "@/features/profile/schema/response/PhotoResponse"
import type { PagedRequest } from "@sharedSchemas/request/PagedRequest"
import type { PagedResponse } from "@sharedSchemas/response/PagedResponse"
import type { UserProfileResponse } from "@sharedSchemas/response/UserProfileResponse"
import agent from "@/shared/services/agent"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"
import type { UserResponse } from "@sharedSchemas/response/UserResponse"
import type { AddPhotoRequest } from "@profile/schema/request/AddPhotoRequest"
import type { EditProfileRequest } from "@profile/schema/request/EditProfileRequest"
import { useOptimisticUpdate } from "@sharedHooks/useOptimisticUpdate"

export const useGetProfileById = (id: string | undefined) => {
  const {
    data: profile,
    isLoading: isLoadingProfile,
    error: errorProfile,
  } = useQuery<UserProfileResponse>({
    queryKey: ["profile", id],
    queryFn: () => agent.get<UserProfileResponse>(`/profile/${id}`),
    enabled: !!id,
  })

  return {
    profile,
    isLoadingProfile,
    errorProfile,
  }
}

export const useGetProfilePhotosById = (id: string | undefined, params: PagedRequest) => {
  const queryClient = useQueryClient()

  const {
    data: pagedPhotos,
    isLoading: isLoadingPagedPhotos,
    error: errorPagedPhotos,
  } = useQuery<PagedResponse<PhotoResponse>>({
    queryKey: ["profile", id, "photos", params],
    queryFn: () => agent.get<PagedResponse<PhotoResponse>>(`/profile/${id}/photos`, { params }),
    placeholderData: keepPreviousData,
    enabled: !!id,
  })

  const isCurrentUser = useMemo(() => {
    return id === queryClient.getQueryData<UserResponse>(["user"])?.id
  }, [id, queryClient])

  return {
    pagedPhotos,
    isLoadingPagedPhotos,
    errorPagedPhotos,
    isCurrentUser,
  }
}

export const useAddPhotoProfile = () => {
  const queryClient = useQueryClient()
  const user = queryClient.getQueryData<UserResponse>(["user"])

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (request: AddPhotoRequest) => {
      return await agent.post<PhotoResponse>("/profile/add-photo", request, {
        asFormData: true,
      })
    },
    onSuccess: async (photo: PhotoResponse) => {
      await queryClient.invalidateQueries({
        queryKey: ["profile"],
      })

      queryClient.setQueryData(["user"], (data: UserResponse) => {
        if (!data) return data

        return {
          ...data,
          imageUrl: data.imageUrl ?? photo.url,
        }
      })

      queryClient.setQueryData(["profile", user?.id], (data: UserProfileResponse) => {
        if (!data) return data

        return {
          ...data,
          imageUrl: data.imageUrl ?? photo.url,
        }
      })
    },
  })

  return {
    addPhotoAsync: mutateAsync,
    isPendingAddPhoto: isPending,
  }
}

export const useSetMainPhotoProfile = () => {
  const queryClient = useQueryClient()
  const user = queryClient.getQueryData<UserResponse>(["user"])

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (response: PhotoResponse) => {
      return await agent.put(`/profile/${response.id}/set-main-photo`)
    },
    onSuccess: async (_, photo) => {
      queryClient.setQueryData(["user"], (data: UserResponse) => {
        if (!data) return data

        return {
          ...data,
          imageUrl: photo.url,
        }
      })

      queryClient.setQueryData(["profile", user?.id], (data: UserProfileResponse) => {
        if (!data) return data

        return {
          ...data,
          imageUrl: photo.url,
        }
      })
    },
  })

  return {
    setMainPhotoAsync: mutateAsync,
    isPendingSetMainPhoto: isPending,
  }
}

export const useEditProfile = () => {
  const queryClient = useQueryClient()

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (request: EditProfileRequest) => {
      return await agent.put<UserProfileResponse>("/profile/edit-profile", request)
    },
    onSuccess: async (profile: UserProfileResponse) => {
      queryClient.setQueryData(["profile", profile.id], profile)

      queryClient.setQueryData(["user"], (data: UserResponse) => {
        if (!data) return data

        return {
          ...data,
          displayName: profile.displayName,
          biography: profile.biography,
        }
      })
    },
  })

  return {
    editProfileAsync: mutateAsync,
    isPendingEditProfile: isPending,
  }
}

export const useDeletePhotoProfile = () => {
  const queryClient = useQueryClient()
  const user = queryClient.getQueryData<UserResponse>(["user"])

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (response: PhotoResponse) => {
      return await agent.delete(`/profile/${response.id}/photos`)
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["user"],
      })

      queryClient.invalidateQueries({
        queryKey: ["profile", user?.id],
      })
    },
  })

  return {
    deletePhotoAsync: mutateAsync,
    isPendingDeletePhoto: isPending,
  }
}

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
