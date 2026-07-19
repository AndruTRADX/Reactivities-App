import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { PagedResponse } from "@sharedSchemas/response/PagedResponse"
import agent from "@/shared/services/agent"
import type { ActivityResponse } from "@activities/schemas/response/ActivityResponse"
import type { CancelActivityRequest } from "@activities/schemas/request/CancelActivityRequest"
import { useGetCurrentUser } from "@sharedHooks/api/useAccount"

const withUserContext = <T extends ActivityResponse>(activity: T, userId?: string) => {
  const host = activity.attendees.find(a => a.isHost)
  const hostId = host?.user.id ?? ""
  const hostDisplayName = host?.user.displayName ?? ""

  return {
    ...activity,
    hostId,
    hostDisplayName,
    isHost: hostId === userId,
    isGoing: activity.attendees.some(a => a.user.id === userId),
  }
}

export const useGetActivities = () => {
  const { user } = useGetCurrentUser()

  const { data, isLoading, error } = useQuery<PagedResponse<ActivityResponse>>({
    queryKey: ["activities"],
    queryFn: () => agent.get<PagedResponse<ActivityResponse>>("/activities"),
    select: data => ({
      ...data,
      data: data.data.map(activity => withUserContext(activity, user?.id)),
    }),
  })

  return {
    pagedActivities: data,
    isLoadingActivities: isLoading,
    errorPagedActivities: error,
  }
}

export const useGetActivityById = (id: string | undefined) => {
  const { user } = useGetCurrentUser()

  const { data, isLoading, error } = useQuery<ActivityResponse>({
    queryKey: ["activity", id],
    queryFn: () => agent.get<ActivityResponse>(`/activities/${id}`),
    enabled: !!id,
    select: data => withUserContext(data, user?.id),
  })

  return {
    activity: data,
    isLoadingActivity: isLoading,
    errorActivity: error,
  }
}

export const useCreateActivity = () => {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (activity: unknown) => {
      return await agent.post("/activities", activity)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["activities"],
      })
    },
  })

  return {
    createActivityAsync: mutateAsync,
    isPendingCreateActivity: isPending,
  }
}

export const useUpdateActivity = () => {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (activity: { id?: string }) => {
      return await agent.put("/activities", activity)
    },
    onSuccess: async (_data, activity) => {
      await queryClient.invalidateQueries({ queryKey: ["activities"] })
      if (activity.id) {
        await queryClient.invalidateQueries({ queryKey: ["activity", activity.id] })
      }
    },
  })

  return {
    updateActivityAsync: mutateAsync,
    isPendingUpdateActivity: isPending,
  }
}

export const useCancelActivity = () => {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ id, ...request }: { id: string } & CancelActivityRequest) => {
      return await agent.patch(`/activities/${id}/cancel`, request)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["activities"],
      })
    },
  })

  return {
    cancelActivityAsync: mutateAsync,
    isPendingCancelActivity: isPending,
  }
}
