import { useParams } from "react-router"
import { NoContent } from "@/shared/components/common/NotFound"
import { ErrorShow } from "@/shared/components/common/ErrorShow"
import { PaginationControl } from "@/shared/components/common/PaginationControl"
import { usePagedParams } from "@/shared/hooks/usePagedParams"
import { Card, CardContent, CardHeader, CardTitle } from "@sharedUi/card"
import { Separator } from "@sharedUi/separator"
import { useGetPagedFollowing } from "@profile/hooks/api/useFollows"
import { FollowUserRow } from "@profile/components/FollowUserRow"
import { SkeletonFollowingCard } from "./SkeletonFollowingCard"

export default function ProfileFollowingCard() {
  const { id } = useParams()
  const { pageIndex, pageSize, setPageIndex } = usePagedParams("following")

  const { pagedFollowing, isLoadingPagedFollowing, errorPagedFollowing } = useGetPagedFollowing(
    id,
    { pageIndex, pageSize }
  )

  const following = pagedFollowing?.data ?? []

  if (isLoadingPagedFollowing) {
    return <SkeletonFollowingCard />
  }

  if (errorPagedFollowing) {
    return <ErrorShow error={errorPagedFollowing} />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Following</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Separator />

        {following.length === 0 ? (
          <NoContent
            title="Not following anyone"
            description="This user isn't following anyone yet"
          />
        ) : (
          <div className="flex flex-col gap-4">
            {following.map(followee => (
              <FollowUserRow key={followee.id} user={followee} />
            ))}
          </div>
        )}

        <PaginationControl
          pageIndex={pagedFollowing?.pageIndex ?? pageIndex}
          pageCount={pagedFollowing?.pageCount ?? 1}
          onPageChange={setPageIndex}
        />
      </CardContent>
    </Card>
  )
}
