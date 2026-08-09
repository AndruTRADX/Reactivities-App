import type { UserProfileResponse } from "@sharedSchemas/response/UserProfileResponse"
import { Link } from "react-router"
type Props = {
  user: UserProfileResponse
}

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@sharedUi/hover-card"
import { Avatar, AvatarFallback, AvatarImage } from "@sharedUi/avatar"
import { Separator } from "@sharedUi/separator"
import { UserAdd01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { defaultImage64 } from "@/shared/constants/defaultImage"

export function ProfileCard({ user }: Props) {
  return (
    <HoverCard openDelay={10} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Link to={`/profile/${user.id}`}>
          <Avatar className="cursor-pointer" size="default">
            <AvatarImage src={user.imageUrl ?? defaultImage64} alt="@shadcn" />
            <AvatarFallback>{user.displayName}</AvatarFallback>
          </Avatar>
        </Link>
      </HoverCardTrigger>
      <Link to={`/profile/${user.id}`}>
        <HoverCardContent className="flex w-50 flex-col gap-2 bg-popover/25 backdrop-blur-sm cursor-pointer">
          <Avatar className="w-full h-full">
            <AvatarImage
              src={user.imageUrl ?? defaultImage64}
              alt="@shadcn"
              className="rounded-lg"
            />
            <AvatarFallback>{user.displayName}</AvatarFallback>
          </Avatar>
          <h2 className="font-semibold text-xl">{user.displayName}</h2>
          <Separator />
          <div className="flex text-muted-foreground gap-1 items-center">
            <HugeiconsIcon icon={UserAdd01Icon} className="h-5 w-5" />
            <p className="text-sm">{user.followersCount} followers</p>
          </div>
        </HoverCardContent>
      </Link>
    </HoverCard>
  )
}
