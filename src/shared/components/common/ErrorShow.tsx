import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@sharedUi/empty"
import { HugeiconsIcon } from "@hugeicons/react"
import { Lock } from "@hugeicons/core-free-icons"
import { isAxiosError } from "axios"
import { Badge } from "@sharedUi/badge";

interface Props {
  error: Error | null
}

export function ErrorShow({ error }: Props) {
  const isAxios = isAxiosError(error)

  const title   = isAxios ? error.response?.data?.title   : null
  const description = isAxios ? error.response?.data?.message : null
  const status  = isAxios ? error.response?.status        : null
  const method  = isAxios ? error.config?.method?.toUpperCase() : null
  const url     = isAxios ? error.config?.url             : null

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={Lock} stroke="2" className="text-destructive" />
        </EmptyMedia>

        {status && (
          <Badge variant="destructive">{status} {title}</Badge>
        )}

        <EmptyTitle>{title ?? "An error has occurred"}</EmptyTitle>
        <EmptyDescription>
          {description ?? "Something went wrong when trying to access this content"}
        </EmptyDescription>

        {method && url && (
          <p className="text-xs text-muted-foreground">
            {method} {url}
          </p>
        )}
      </EmptyHeader>
    </Empty>
  )
}