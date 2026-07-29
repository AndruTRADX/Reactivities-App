import { Card, CardContent, CardHeader, CardTitle } from "@sharedUi/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@sharedUi/tabs"
import type { UserProfileResponse } from "@sharedSchemas/response/UserProfileResponse"
import ProfilePhotosCard from "@profile/components/cards/photos/ProfilePhotosCard"

interface Props {
  profile: UserProfileResponse
}

export default function ProfileContent({ profile }: Props) {
  return (
    <Tabs defaultValue="about" orientation="vertical">
      <TabsList variant="line">
        <TabsTrigger value="about">About</TabsTrigger>
        <TabsTrigger value="photos">Photos</TabsTrigger>
        <TabsTrigger value="events">Events</TabsTrigger>
        <TabsTrigger value="followers">Followers</TabsTrigger>
        <TabsTrigger value="following">Following</TabsTrigger>
      </TabsList>
      <TabsContent value="about">
        <Card>
          <CardHeader>
            <CardTitle>About Me</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {profile.biography ?? "Not much to say about me :P"}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="photos">
        <ProfilePhotosCard />
      </TabsContent>
      <TabsContent value="events">
        <Card>
          <CardHeader>
            <CardTitle>Events</CardTitle>
          </CardHeader>
        </Card>
      </TabsContent>
      <TabsContent value="followers">
        <Card>
          <CardHeader>
            <CardTitle>Followers</CardTitle>
          </CardHeader>
        </Card>
      </TabsContent>
      <TabsContent value="following">
        <Card>
          <CardHeader>
            <CardTitle>Following</CardTitle>
          </CardHeader>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
