import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { PagedResponse } from "@sharedSchemas/response/PagedResponse"
import agent from "@/shared/services/agent"
import type { ActivityResponse } from "@activities/schemas/response/ActivityResponse"
import type { CancelActivityRequest } from "../../schemas/request/CancelActivityRequest";

export const useGetActivities = () => {
  const { data, isLoading, error } = useQuery<PagedResponse<ActivityResponse>>({
    queryKey: ["activities"],
    queryFn: async () => {
      const response = await agent.get<PagedResponse<ActivityResponse>>("/activities")
      return response
    },
  })

  return {
    pagedActivities: data,
    isLoadingActivities: isLoading,
    errorPagedActivities: error
  }
}

export const useGetActivityById = (id: string | undefined) => {
  const { data, isLoading, error } = useQuery<ActivityResponse>({
    queryKey: ["activity", id],
    queryFn: async () => {
      return await agent.get<ActivityResponse>(`/activities/${id}`)
    },
    enabled: !!id
  })

  return {
    activity: data,
    isLoadingActivity: isLoading,
    errorActivity: error
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
