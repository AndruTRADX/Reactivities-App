import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { PagedResponse } from "@sharedSchemas/response/PagedResponse"
import agent from "@/shared/services/agent"
import type { ActivityResponse } from "@activities/schemas/response/ActivityResponse"

export const useGetActivities = () => {
  const { data, isPending, error } = useQuery<PagedResponse<ActivityResponse>>({
    queryKey: ["activities"],
    queryFn: async () => {
      const response = await agent.get<PagedResponse<ActivityResponse>>("/activities")
      return response
    },
  })

  return {
    pagedActivities: data,
    isPendingActivities: isPending,
    errorPagedActivities: error
  }
}

export const useGetActivityById = (id: string | undefined) => {
  const { data, isPending, error } = useQuery<ActivityResponse>({
    queryKey: ["activity", id],
    queryFn: async () => {
      return await agent.get<ActivityResponse>(`/activities/${id}`)
    },
    enabled: !!id
  })

  return {
    activity: data,
    isPendingActivity: isPending,
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
    mutationFn: async (activity: unknown) => {
      return await agent.put("/activities", activity)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["activities"],
      })
    },
  })

  return {
    updateActivityAsync: mutateAsync,
    isPendingUpdateActivity: isPending,
  }
}

export const useDeleteActivity = () => {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (id: string) => {
      return await agent.delete(`/activities/${id}`)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["activities"],
      })
    },
  })

  return {
    deleteActivityAsync: mutateAsync,
    isPendingDeleteActivity: isPending,
  }
}
