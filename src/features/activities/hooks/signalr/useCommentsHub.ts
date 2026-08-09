import { useRef, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useHubConnection, invokeHubMethod } from "@sharedHooks/useHubConnection"
import type { ActivityCommentResponse } from "@activities/schemas/response/ActivityCommentResponse"
import type { PagedResponse } from "@sharedSchemas/response/PagedResponse"
import type { UserResponse } from "@sharedSchemas/response/UserResponse"

const PAGE_SIZE = 5
const TEMP_ID_PREFIX = "temp-"

type CommentsCache = {
  comments: ActivityCommentResponse[]
  pageIndex: number
  pageCount: number
}

const emptyCache: CommentsCache = { comments: [], pageIndex: 1, pageCount: 1 }

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
    following: false,
    followedBy: false,
    followersCount: 0,
    followingsCount: 0,
  },
})

export const useCommentsHub = (activityId: string | undefined) => {
  const queryClient = useQueryClient()
  const [cache, setCacheState] = useState<CommentsCache>(emptyCache)
  const [isLoadingComments, setIsLoadingComments] = useState(true)

  const cacheRef = useRef(cache)
  const setCache = (updater: (prev: CommentsCache) => CommentsCache) => {
    const next = updater(cacheRef.current)
    cacheRef.current = next
    setCacheState(next)
  }

  const connectionRef = useHubConnection(
    "/hubs/comments",
    { activityId: activityId ?? "" },
    {
      enabled: !!activityId,
      handlers: {
        ReceiveComment: (comment: ActivityCommentResponse) =>
          setCache(prev => ({ ...prev, comments: mergeComments(prev.comments, [comment]) })),
        CommentDeleted: (commentId: string) =>
          setCache(prev => ({
            ...prev,
            comments: prev.comments.filter(comment => comment.id !== commentId),
          })),
      },
      onConnected: async connection => {
        try {
          const page = await connection.invoke<PagedResponse<ActivityCommentResponse>>(
            "LoadComments",
            activityId,
            1,
            PAGE_SIZE
          )
          setCache(prev => ({
            comments: mergeComments(prev.comments, page.data),
            pageIndex: page.pageIndex,
            pageCount: page.pageCount,
          }))
        } finally {
          setIsLoadingComments(false)
        }
      },
      onError: showConnectionError,
      onDisconnected: () => {
        cacheRef.current = emptyCache
        setCacheState(emptyCache)
        setIsLoadingComments(true)
      },
    }
  )

  const loadMoreMutation = useMutation({
    mutationFn: () =>
      invokeHubMethod<PagedResponse<ActivityCommentResponse>>(
        connectionRef,
        "LoadComments",
        activityId,
        cache.pageIndex + 1,
        PAGE_SIZE
      ),
    onSuccess: page =>
      setCache(prev => ({
        comments: mergeComments(prev.comments, page.data),
        pageIndex: page.pageIndex,
        pageCount: page.pageCount,
      })),
    onError: showConnectionError,
  })

  const sendCommentMutation = useMutation({
    mutationFn: (body: string) => invokeHubMethod(connectionRef, "SendComment", activityId, body),
    onMutate: (body: string) => {
      const currentUser = queryClient.getQueryData<UserResponse>(["user"])
      if (!currentUser || !activityId) return undefined

      const previousCache = cache
      const optimisticComment = buildOptimisticComment(body, activityId, currentUser)
      setCache(prev => ({ ...prev, comments: mergeComments(prev.comments, [optimisticComment]) }))
      return { previousCache, optimisticId: optimisticComment.id }
    },
    onSuccess: (_data, _body, context) => {
      if (!context?.optimisticId) return
      setCache(prev => ({
        ...prev,
        comments: prev.comments.filter(comment => comment.id !== context.optimisticId),
      }))
    },
    onError: (err, _body, context) => {
      if (context?.previousCache) setCache(() => context.previousCache)
      showConnectionError(err)
    },
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) =>
      invokeHubMethod(connectionRef, "DeleteComment", activityId, commentId),
    onMutate: (commentId: string) => {
      const previousCache = cache
      setCache(prev => ({
        ...prev,
        comments: prev.comments.filter(comment => comment.id !== commentId),
      }))
      return { previousCache }
    },
    onError: (err, _commentId, context) => {
      if (context?.previousCache) setCache(() => context.previousCache)
      showConnectionError(err)
    },
  })

  return {
    comments: cache.comments,
    isLoadingComments,
    hasMoreComments: cache.pageIndex < cache.pageCount,
    loadMoreComments: loadMoreMutation.mutateAsync,
    sendCommentAsync: sendCommentMutation.mutateAsync,
    isPendingSendComment: sendCommentMutation.isPending,
    deleteCommentAsync: deleteCommentMutation.mutateAsync,
  }
}
