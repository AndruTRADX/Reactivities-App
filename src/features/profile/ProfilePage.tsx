import { useGetProfileById } from "@/features/profile/hooks/api/useProfile"
import { ErrorShow } from "@/shared/components/common/ErrorShow"
import { NoContent } from "@/shared/components/common/NotFound"
import ProfileContent from "@profile/components/ProfileContent"
import ProfileHeader from "@profile/components/ProfileHeader"
import { SkeletonPage } from "@profile/components/SkeletonPage"
import { useParams } from "react-router"

export default function ProfilePage() {
  const { id } = useParams()
  const { profile, isLoadingProfile, errorProfile } = useGetProfileById(id)

  if (isLoadingProfile) {
    return <SkeletonPage />
  }

  if (errorProfile) {
    return <ErrorShow error={errorProfile} />
  }

  if (!profile) {
    return (
      <NoContent
        title="No profile"
        description={`The profile you are looking for does not exists`}
      />
    )
  }

  return (
    <div className="flex flex-col w-full gap-6">
      <ProfileHeader profile={profile} />
      <ProfileContent profile={profile} />
    </div>
  )
}
