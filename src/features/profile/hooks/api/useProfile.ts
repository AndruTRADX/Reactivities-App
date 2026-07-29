import type { PhotoResponse } from "@/features/profile/schema/PhotoResponse"
import type { PagedRequest } from "@sharedSchemas/request/PagedRequest"
import type { PagedResponse } from "@sharedSchemas/response/PagedResponse"
import type { UserProfileResponse } from "@sharedSchemas/response/UserProfileResponse"
import agent from "@/shared/services/agent"
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"
import type { UserResponse } from "@sharedSchemas/response/UserResponse"

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
