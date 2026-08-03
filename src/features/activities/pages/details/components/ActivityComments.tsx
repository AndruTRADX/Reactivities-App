import { CardContent } from "@sharedUi/card"
import { Textarea } from "@sharedUi/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@sharedUi/avatar"

export default function ActivityComments() {
  return (
    <>
      <CardContent>
        <Textarea placeholder="Enter comment (Enter to submit, SHIFT + Enter for new line)." />
      </CardContent>
      <CardContent>
        <div className="flex gap-3 items-center">
          <Avatar size="lg">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" className="grayscale" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h3 className="text-primary font-semibold text-base">Bob</h3>
              <p className="text-muted-foreground text-xs">2 hours ago</p>
            </div>
            <p className="text-foreground">Comment goes here</p>
          </div>
        </div>
      </CardContent>
    </>
  )
}
