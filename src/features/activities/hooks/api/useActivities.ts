import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { PagedResponse } from "@/shared/schemas/response/PagedResponse"
import agent from "@/shared/services/agent"
import type { ActivityResponse } from "@activities/schemas/response/ActivityResponse"
import type { ActivityRequest } from "@activities/schemas/request/ActivityRequest"

export const useGetActivities = () => {
  const { data, isPending } = useQuery<PagedResponse<ActivityResponse>>({
    queryKey: ["activities"],
    queryFn: async () => {
      const response = await agent.get<PagedResponse<ActivityResponse>>("/activities")
      return response
    },
  })

  return {
    pagedActivities: data,
    isPendingActivities: isPending,
  }
}

export const useCreateActivity = () => {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (activity: ActivityRequest) => {
      await agent.post("/activities", activity)
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
    mutationFn: async (activity: ActivityRequest) => {
      await agent.put("/activities", activity)
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
