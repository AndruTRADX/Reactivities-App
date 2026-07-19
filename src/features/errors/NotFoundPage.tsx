import { Button } from "@sharedUi/button"
import { Cancel } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@sharedUi/empty"
import { useLocation, useNavigate } from "react-router"

export default function NotFoundPage() {
  const navigate = useNavigate()
  const { state } = useLocation()

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={Cancel} stroke="2" />
        </EmptyMedia>
        <EmptyTitle>{state?.title ?? "Content not found"}</EmptyTitle>
        <EmptyDescription>
          {state?.message ?? "The content you are looking for has not been found"}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <Button onClick={() => navigate("/activities")} size="lg">
          Go to the activities
        </Button>
      </EmptyContent>
    </Empty>
  )
}
