import * as signalR from "@microsoft/signalr"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useHubConnection } from "@sharedHooks/useHubConnection"
import { useOptimisticUpdate } from "@sharedHooks/useOptimisticUpdate"
import type { ActivityCommentResponse } from "@activities/schemas/response/ActivityCommentResponse"
import type { PagedResponse } from "@sharedSchemas/response/PagedResponse"
import type { UserResponse } from "@sharedSchemas/response/UserResponse"

const PAGE_SIZE = 5

type CommentsCache = {
  comments: ActivityCommentResponse[]
  pageIndex: number
  pageCount: number
}

const emptyCache: CommentsCache = { comments: [], pageIndex: 1, pageCount: 1 }

const commentsQueryKey = (activityId: string) => ["activity", activityId, "comments"]

const mergeComments = (
  existing: ActivityCommentResponse[],
  incoming: ActivityCommentResponse[]
) => {
  const byId = new Map([...existing, ...incoming].map(comment => [comment.id, comment]))
  return [...byId.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

const showConnectionError = (err: unknown) => {
  const message = err instanceof Error ? err.message : "Something went wrong"
  toast.error(message)
}

const TEMP_ID_PREFIX = "temp-"

const buildOptimisticComment = (
  body: string,
  activityId: string,
  currentUser: UserResponse
): ActivityCommentResponse => ({
  id: `${TEMP_ID_PREFIX}${crypto.randomUUID()}`,
  body,
  createdAt: new Date().toISOString(),
  userId: currentUser.id,
  activityId,
  user: {
    id: currentUser.id,
    displayName: currentUser.displayName,
    imageUrl: currentUser.imageUrl,
    biography: currentUser.biography ?? "",
  },
})

export const useCommentsHub = (activityId: string | undefined) => {
  const queryClient = useQueryClient()
  const queryKey = commentsQueryKey(activityId ?? "")

  const { data = emptyCache, isPending: isLoadingComments } = useQuery<CommentsCache>({
    queryKey,
    queryFn: () => {
      throw new Error("Comments are loaded over SignalR, not fetched")
    },
    enabled: false,
  })

  const setComments = (updater: (prev: CommentsCache) => CommentsCache) =>
    queryClient.setQueryData<CommentsCache>(queryKey, prev => updater(prev ?? emptyCache))

  const connectionRef = useHubConnection(
    "/hubs/comments",
    { activityId: activityId ?? "" },
    {
      enabled: !!activityId,
      handlers: {
        ReceiveComment: (comment: ActivityCommentResponse) =>
          setComments(prev => ({ ...prev, comments: mergeComments(prev.comments, [comment]) })),
        CommentDeleted: (commentId: string) =>
          setComments(prev => ({
            ...prev,
            comments: prev.comments.filter(comment => comment.id !== commentId),
          })),
      },
      onConnected: async connection => {
        const page = await connection.invoke<PagedResponse<ActivityCommentResponse>>(
          "LoadComments",
          activityId,
          1,
          PAGE_SIZE
        )
        setComments(prev => ({
          comments: mergeComments(prev.comments, page.data),
          pageIndex: page.pageIndex,
          pageCount: page.pageCount,
        }))
      },
      onError: showConnectionError,
      onDisconnected: () => queryClient.removeQueries({ queryKey }),
    }
  )

  const loadMoreMutation = useMutation({
    mutationFn: async () => {
      const connection = connectionRef.current
      if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
        throw new Error("Not connected")
      }
      return connection.invoke<PagedResponse<ActivityCommentResponse>>(
        "LoadComments",
        activityId,
        data.pageIndex + 1,
        PAGE_SIZE
      )
    },
    onSuccess: page =>
      setComments(prev => ({
        comments: mergeComments(prev.comments, page.data),
        pageIndex: page.pageIndex,
        pageCount: page.pageCount,
      })),
    onError: showConnectionError,
  })

  const { onMutate: onSendMutate, onError: onSendError } = useOptimisticUpdate<
    CommentsCache,
    string
  >({
    optimisticQueryKey: () => queryKey,
    updater: (cache, body) => {
      const currentUser = queryClient.getQueryData<UserResponse>(["user"])
      if (!currentUser || !activityId) return cache

      const optimisticComment = buildOptimisticComment(body, activityId, currentUser)
      return { ...cache, comments: mergeComments(cache.comments, [optimisticComment]) }
    },
  })

  const sendCommentMutation = useMutation({
    mutationFn: async (body: string) => {
      const connection = connectionRef.current
      if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
        throw new Error("Not connected")
      }
      await connection.invoke("SendComment", activityId, body)
    },
    onMutate: onSendMutate,
    onSuccess: (_data, body) => {
      setComments(prev => ({
        ...prev,
        comments: prev.comments.filter(
          comment => !(comment.id.startsWith(TEMP_ID_PREFIX) && comment.body === body)
        ),
      }))
    },
    onError: (err, variables, context) => {
      onSendError(err, variables, context)
      showConnectionError(err)
    },
  })

  const { onMutate: onDeleteMutate, onError: onDeleteError } = useOptimisticUpdate<
    CommentsCache,
    string
  >({
    optimisticQueryKey: () => queryKey,
    updater: (cache, commentId) => ({
      ...cache,
      comments: cache.comments.filter(comment => comment.id !== commentId),
    }),
  })

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const connection = connectionRef.current
      if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
        throw new Error("Not connected")
      }
      await connection.invoke("DeleteComment", activityId, commentId)
    },
    onMutate: onDeleteMutate,
    onError: (err, variables, context) => {
      onDeleteError(err, variables, context)
      showConnectionError(err)
    },
  })

  return {
    comments: data.comments,
    isLoadingComments,
    hasMoreComments: data.pageIndex < data.pageCount,
    loadMoreComments: loadMoreMutation.mutateAsync,
    sendCommentAsync: sendCommentMutation.mutateAsync,
    isPendingSendComment: sendCommentMutation.isPending,
    deleteCommentAsync: deleteCommentMutation.mutateAsync,
  }
}
