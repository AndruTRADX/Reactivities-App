import { Button } from "@sharedUi/button"
import { ComputerRemoveIcon } from "@hugeicons/core-free-icons"
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

export default function ServerErrorPage() {
  const navigate = useNavigate()
  const { state } = useLocation()

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={ComputerRemoveIcon} stroke="2" />
        </EmptyMedia>
        <EmptyTitle>{state?.title ?? "There has been an error"}</EmptyTitle>
        <EmptyDescription>{state?.message ?? "Internal Server error"}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <Button onClick={() => navigate("/activities")} size="lg">
          Go to the activities
        </Button>
      </EmptyContent>
    </Empty>
  )
}
