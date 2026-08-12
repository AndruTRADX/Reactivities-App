import { Tabs, TabsContent, TabsList, TabsTrigger } from "@sharedUi/tabs"
import type { UserProfileResponse } from "@sharedSchemas/response/UserProfileResponse"
import ProfilePhotosCard from "@profile/components/cards/photos/ProfilePhotosCard"
import ProfileAboutCard from "@profile/components/cards/about/ProfileAboutCard"
import ProfileFollowersCard from "@profile/components/cards/followers/ProfileFollowersCard"
import ProfileFollowingCard from "@profile/components/cards/following/ProfileFollowingCard"
import { useMediaQuery } from "@/shared/hooks/useMediaQuery"

interface Props {
  profile: UserProfileResponse
}

export default function ProfileContent({ profile }: Props) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  return (
    <Tabs defaultValue="about" orientation={isDesktop ? "vertical" : "horizontal"}>
      <TabsList
        variant="line"
        className={isDesktop ? undefined : "w-full justify-start overflow-x-auto"}
      >
        <TabsTrigger value="about">About</TabsTrigger>
        <TabsTrigger value="photos">Photos</TabsTrigger>
        <TabsTrigger value="followers">Followers</TabsTrigger>
        <TabsTrigger value="following">Following</TabsTrigger>
      </TabsList>
      <TabsContent value="about">
        <ProfileAboutCard profile={profile} />
      </TabsContent>
      <TabsContent value="photos">
        <ProfilePhotosCard />
      </TabsContent>
      <TabsContent value="followers">
        <ProfileFollowersCard />
      </TabsContent>
      <TabsContent value="following">
        <ProfileFollowingCard />
      </TabsContent>
    </Tabs>
  )
}
