import { formatDistanceToNow } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon, MoreVerticalIcon } from "@hugeicons/core-free-icons"
import { Button } from "@sharedUi/button"
import { Avatar, AvatarFallback, AvatarImage } from "@sharedUi/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@sharedUi/dropdown-menu"
import { defaultImage64 } from "@/shared/constants/defaultImage"
import type { ActivityCommentResponse } from "@activities/schemas/response/ActivityCommentResponse"

interface Props {
  comment: ActivityCommentResponse
  isOwnComment: boolean
  onDelete: (commentId: string) => void
}

export default function CommentItem({ comment, isOwnComment, onDelete }: Props) {
  return (
    <div className="flex gap-3 py-4 items-center first:pt-0 last:pb-0">
      <Avatar size="default">
        <AvatarImage src={comment.user.imageUrl ?? defaultImage64} alt={comment.user.displayName} />
        <AvatarFallback>{comment.user.displayName}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-base font-medium text-foreground">{comment.user.displayName}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
          {isOwnComment && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="ml-auto text-muted-foreground"
                  aria-label="Comment actions"
                >
                  <HugeiconsIcon icon={MoreVerticalIcon} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem variant="destructive" onClick={() => onDelete(comment.id)}>
                  <HugeiconsIcon icon={Delete02Icon} className="min-w-5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <p className="mb-0.5 text-sm text-foreground/90 wrap-break-word">{comment.body}</p>
      </div>
    </div>
  )
}
