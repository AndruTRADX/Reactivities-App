import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@sharedUi/empty"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel } from "@hugeicons/core-free-icons"

interface Props {
  title?: string
  description?: string
}

export function NoContent({ title, description }: Props) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={Cancel} stroke="2" />
        </EmptyMedia>
        <EmptyTitle>{title ?? "Content not found"}</EmptyTitle>
        <EmptyDescription>
          {description ?? "The content you are looking for has not been found"}
        </EmptyDescription>
      </EmptyHeader>
      {/* <EmptyContent className="flex-row justify-center gap-2">
        <Button>Create Project</Button>
        <Button variant="outline">Import Project</Button>
      </EmptyContent> */}
    </Empty>
  )
}
