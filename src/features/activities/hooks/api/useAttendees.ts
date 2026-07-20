import type { ActivityResponse } from "@/features/activities/schemas/response/ActivityResponse"
import { useGetCurrentUser } from "@sharedHooks/api/useAccount"
import { useOptimisticUpdate } from "@sharedHooks/useOptimisticUpdate"
import agent from "@/shared/services/agent"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useJoinActivity = () => {
  const { user } = useGetCurrentUser()
  const currentUser = user ?? { id: "", email: "", displayName: "", imageUrl: null }

  const { onMutate, onError } = useOptimisticUpdate<ActivityResponse, { id: string }>({
    optimisticQueryKey: ({ id }) => ["activity", id],
    relatedQueryKeysToCancel: () => [["activities"]],
    updater: (activity, { id }) => {
      const isAttending = activity.attendees.some(x => x.user.id === user?.id)
      if (isAttending) {
        return activity
      }

      return {
        ...activity,
        attendees: [
          ...activity.attendees,
          {
            id: user?.id ?? "",
            activityId: id,
            isHost: false,
            dateJoined: new Date().toUTCString(),
            user: currentUser,
          },
        ],
      }
    },
  })

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return await agent.post(`/activities/${id}/attendees`)
    },
    onMutate,
    onError,
  })

  return {
    joinActivityAsync: mutateAsync,
    isPendingJoinActivity: isPending,
  }
}

export const useLeaveActivity = () => {
  const queryClient = useQueryClient()
  const { user } = useGetCurrentUser()

  const { onMutate, onError } = useOptimisticUpdate<ActivityResponse, { id: string }>({
    optimisticQueryKey: ({ id }) => ["activity", id],
    relatedQueryKeysToCancel: () => [["activities"]],
    updater: activity => {
      const isHost = activity.hostId === user?.id
      if (isHost) {
        return activity
      }

      return { ...activity, attendees: activity.attendees.filter(x => x.user.id !== user?.id) }
    },
  })

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return await agent.delete(`/activities/${id}/attendees`)
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["activities"] })
      await queryClient.invalidateQueries({ queryKey: ["activity", variables.id] })
    },
    onMutate,
    onError,
  })

  return {
    leaveActivityAsync: mutateAsync,
    isPendingLeaveActivity: isPending,
  }
}
