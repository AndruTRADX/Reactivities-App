import { HugeiconsIcon } from "@hugeicons/react"
import { BubbleChatIcon } from "@hugeicons/core-free-icons"
import { CardContent } from "@sharedUi/card"
import { Button } from "@sharedUi/button"
import { Spinner } from "@sharedUi/spinner"
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@sharedUi/empty"
import type { ActivityCommentResponse } from "@activities/schemas/response/ActivityCommentResponse"
import CommentItem from "./CommentItem"

interface Props {
  comments: ActivityCommentResponse[]
  currentUserId: string | undefined
  isLoadingComments: boolean
  hasMoreComments: boolean
  onLoadMore: () => void
  onDelete: (commentId: string) => void
}

export default function CommentList({
  comments,
  currentUserId,
  isLoadingComments,
  hasMoreComments,
  onLoadMore,
  onDelete,
}: Props) {
  if (isLoadingComments) {
    return (
      <CardContent className="flex justify-center py-6">
        <Spinner />
      </CardContent>
    )
  }

  if (comments.length === 0) {
    return (
      <Empty className="p-3">
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={BubbleChatIcon} />
        </EmptyMedia>
        <EmptyTitle>No comments yet</EmptyTitle>
        <EmptyDescription>Be the first to share your thoughts.</EmptyDescription>
      </Empty>
    )
  }

  return (
    <CardContent
      id="activity-comment-container"
      className="flex flex-col divide-y divide-border max-h-112 overflow-y-auto"
    >
      {comments.map(comment => (
        <CommentItem
          key={comment.id}
          comment={comment}
          isOwnComment={comment.userId === currentUserId}
          onDelete={onDelete}
        />
      ))}

      {hasMoreComments && (
        <div className="flex justify-center pt-3 first:pt-0">
          <Button variant="ghost" size="sm" onClick={onLoadMore}>
            Load earlier comments
          </Button>
        </div>
      )}
    </CardContent>
  )
}
