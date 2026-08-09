import { useParams } from "react-router"
import { NoContent } from "@/shared/components/common/NotFound"
import { ErrorShow } from "@/shared/components/common/ErrorShow"
import { PaginationControl } from "@/shared/components/common/PaginationControl"
import { usePagedParams } from "@/shared/hooks/usePagedParams"
import { Card, CardContent, CardHeader, CardTitle } from "@sharedUi/card"
import { Separator } from "@sharedUi/separator"
import { useGetPagedFollowers } from "@profile/hooks/api/useFollows"
import { FollowUserRow } from "@profile/components/FollowUserRow"
import { SkeletonFollowersCard } from "./SkeletonFollowersCard"

export default function ProfileFollowersCard() {
  const { id } = useParams()
  const { pageIndex, pageSize, setPageIndex } = usePagedParams("followers")

  const { pagedFollowers, isLoadingPagedFollowers, errorPagedFollowers } = useGetPagedFollowers(
    id,
    { pageIndex, pageSize }
  )

  const followers = pagedFollowers?.data ?? []

  if (isLoadingPagedFollowers) {
    return <SkeletonFollowersCard />
  }

  if (errorPagedFollowers) {
    return <ErrorShow error={errorPagedFollowers} />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Followers</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Separator />

        {followers.length === 0 ? (
          <NoContent title="No followers" description="This user has no followers yet" />
        ) : (
          <div className="flex flex-col gap-4">
            {followers.map(follower => (
              <FollowUserRow key={follower.id} user={follower} />
            ))}
          </div>
        )}

        <PaginationControl
          pageIndex={pagedFollowers?.pageIndex ?? pageIndex}
          pageCount={pagedFollowers?.pageCount ?? 1}
          onPageChange={setPageIndex}
        />
      </CardContent>
    </Card>
  )
}
