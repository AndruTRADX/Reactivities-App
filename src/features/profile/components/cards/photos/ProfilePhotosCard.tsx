import { NoContent } from "@/shared/components/common/NotFound"
import { ErrorShow } from "@/shared/components/common/ErrorShow"
import { PaginationControl } from "@/shared/components/common/PaginationControl"
import { usePagedParams } from "@/shared/hooks/usePagedParams"
import { Card, CardContent, CardHeader, CardTitle } from "@sharedUi/card"
import { useGetProfilePhotosById } from "@profile/hooks/api/useProfile"
import { useParams } from "react-router"
import { SkeletonPhotosCard } from "./SkeletonPhotosCard"
import { Button } from "@/shared/components/ui/button"
import { useState } from "react"
import { ButtonGroup } from "@/shared/components/ui/button-group"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete, Edit02Icon, Plus } from "@hugeicons/core-free-icons"
import { Separator } from "@/shared/components/ui/separator"
import SubmitPhotoForm from "@profile/components/forms/SubmitPhotoForm"

export default function ProfilePhotosCard() {
  const { id } = useParams()
  const { pageIndex, pageSize, setPageIndex } = usePagedParams("photos")
  const [editMode, setEditMode] = useState(false)

  const { pagedPhotos, isLoadingPagedPhotos, errorPagedPhotos, isCurrentUser } =
    useGetProfilePhotosById(id, {
      pageIndex,
      pageSize,
    })

  const photos = pagedPhotos?.data ?? []

  if (isLoadingPagedPhotos) {
    return <SkeletonPhotosCard />
  }

  if (errorPagedPhotos) {
    return <ErrorShow error={errorPagedPhotos} />
  }

  if (photos.length === 0) {
    return (
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Photos</CardTitle>
          {isCurrentUser && (
            <div className="flex gap-2">
              {editMode && (
                <ButtonGroup>
                  <Button variant="outline">
                    <HugeiconsIcon icon={Plus} />
                  </Button>
                  <Button variant="outline">
                    <HugeiconsIcon icon={Edit02Icon} />
                  </Button>
                  <Button variant="outline">
                    <HugeiconsIcon icon={Delete} />
                  </Button>
                </ButtonGroup>
              )}
              <Button
                variant={editMode ? "destructive" : "default"}
                onClick={() => setEditMode(prev => !prev)}
              >
                {editMode ? "Cancel" : "Add photo"}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <NoContent
            title="No photos found"
            description="This user has not yet uploaded any photos"
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Photos</CardTitle>
        {isCurrentUser && (
          <div className="flex gap-2">
            <Button
              variant={editMode ? "destructive" : "default"}
              onClick={() => setEditMode(prev => !prev)}
            >
              {editMode ? "Cancel" : "Add photo"}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <Separator />

        {editMode ? (
          <>
            <div>
              <SubmitPhotoForm />
            </div>
          </>
        ) : (
          <div className="grid md:grid-cols-4 gap-4">
            {photos.map(photo => (
              <div
                key={photo.publicId}
                className="aspect-square overflow-hidden rounded-lg border border-border cursor-pointer"
              >
                <img
                  src={photo.url.replace("/upload/", "/upload/w_280,h_280,c_fill,f_auto,dpr_2/")}
                  alt="user photo"
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-300 ease-out hover:scale-115 hover:rotate-3"
                />
              </div>
            ))}
          </div>
        )}

        <PaginationControl
          pageIndex={pagedPhotos?.pageIndex ?? pageIndex}
          pageCount={pagedPhotos?.pageCount ?? 1}
          onPageChange={setPageIndex}
        />
      </CardContent>
    </Card>
  )
}
