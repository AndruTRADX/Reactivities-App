import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Separator } from "@sharedUi/separator"
import type { UserResponse } from "@sharedSchemas/response/UserResponse"
import { useCommentsHub } from "@activities/hooks/signalr/useCommentsHub"
import { useConfirmDialog } from "@sharedHooks/useConfirmDialog"
import CommentList from "./CommentList"
import CommentForm from "./CommentForm"

interface Props {
  activityId: string
}

export default function ActivityCommentsSection({ activityId }: Props) {
  const queryClient = useQueryClient()
  const currentUserId = queryClient.getQueryData<UserResponse>(["user"])?.id
  const { confirmDelete } = useConfirmDialog()

  const {
    comments,
    isLoadingComments,
    hasMoreComments,
    loadMoreComments,
    sendCommentAsync,
    isPendingSendComment,
    deleteCommentAsync,
  } = useCommentsHub(activityId)

  const handleDelete = useCallback(
    (commentId: string) => {
      confirmDelete({
        title: "Delete comment",
        description: "Are you sure you want to delete this comment?",
        onConfirm: () => deleteCommentAsync(commentId),
      })
    },
    [confirmDelete, deleteCommentAsync]
  )

  return (
    <>
      <Separator />

      <CommentList
        comments={comments}
        currentUserId={currentUserId}
        isLoadingComments={isLoadingComments}
        hasMoreComments={hasMoreComments}
        onLoadMore={() => void loadMoreComments()}
        onDelete={handleDelete}
      />

      <Separator />

      <CommentForm onSubmit={sendCommentAsync} isPending={isPendingSendComment} />
    </>
  )
}
