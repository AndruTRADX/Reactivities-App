import type { UserResponse } from "@sharedSchemas/response/UserResponse"
import { Link, useNavigate } from "react-router"
type Props = {
  user: UserResponse
}

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@sharedUi/hover-card"
import { Avatar, AvatarFallback, AvatarImage } from "@sharedUi/avatar"
import { Separator } from "@sharedUi/separator"
import { UserAdd01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export function ProfileCard({ user }: Props) {
  const navigate = useNavigate()

  return (
    <Link to={`/profile/${user.id}`}>
      <HoverCard openDelay={10} closeDelay={100}>
        <HoverCardTrigger>
          <Avatar
            className="cursor-pointer"
            size="default"
            onClick={() => navigate(`/profile/${user.id}`)}
          >
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>{user.displayName}</AvatarFallback>
          </Avatar>
        </HoverCardTrigger>
        <HoverCardContent className="flex w-50 flex-col gap-2 bg-popover/25 backdrop-blur-sm cursor-pointer">
          <Avatar className="w-full h-full">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" className="rounded-lg" />
            <AvatarFallback>{user.displayName}</AvatarFallback>
          </Avatar>
          <h2 className="font-semibold text-xl">{user.displayName}</h2>
          <Separator />
          <div className="flex text-muted-foreground gap-1 items-center">
            <HugeiconsIcon icon={UserAdd01Icon} className="h-5 w-5" />
            <p className="text-sm">followers</p>
          </div>
        </HoverCardContent>
      </HoverCard>
    </Link>
  )
}
