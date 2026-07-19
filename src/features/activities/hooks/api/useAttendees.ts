import agent from "@/shared/services/agent"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useJoinActivity = () => {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return await agent.post(`/activities/${id}/attendees`)
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["activities"] })
      await queryClient.invalidateQueries({ queryKey: ["activity", variables.id] })
    },
  })

  return {
    joinActivityAsync: mutateAsync,
    isPendingJoinActivity: isPending,
  }
}

export const useLeaveActivity = () => {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return await agent.delete(`/activities/${id}/attendees`)
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["activities"] })
      await queryClient.invalidateQueries({ queryKey: ["activity", variables.id] })
    },
  })

  return {
    leaveActivityAsync: mutateAsync,
    isPendingLeaveActivity: isPending,
  }
}
