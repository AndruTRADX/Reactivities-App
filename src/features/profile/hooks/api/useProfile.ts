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

export const useGetProfileById = (id: string | undefined) => {
  const {
    data: profile,
    isLoading: isLoadingProfile,
    error: errorProfile,
  } = useQuery<UserProfileResponse>({
    queryKey: ["profile", id],
    queryFn: () => agent.get<UserProfileResponse>(`/profiles/${id}`),
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
    queryFn: () => agent.get<PagedResponse<PhotoResponse>>(`/profiles/${id}/photos`, { params }),
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
      return await agent.post<PhotoResponse>("/profiles/add-photo", request, {
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
      return await agent.put(`/profiles/${response.id}/set-main-photo`)
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
      return await agent.put<UserProfileResponse>("/profiles/edit-profile", request)
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
      return await agent.delete(`/profiles/${response.id}/photos`)
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
