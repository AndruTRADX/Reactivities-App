import { useCallback, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel, Edit01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@sharedUi/button"
import { Card, CardContent, CardHeader, CardTitle } from "@sharedUi/card"
import type { UserProfileResponse } from "@sharedSchemas/response/UserProfileResponse"
import type { UserResponse } from "@sharedSchemas/response/UserResponse"
import EditProfileForm from "@profile/components/forms/EditProfileForm"

interface Props {
  profile: UserProfileResponse
}

export default function ProfileAboutCard({ profile }: Props) {
  const queryClient = useQueryClient()
  const [editMode, setEditMode] = useState(false)

  const isCurrentUser = useMemo(() => {
    return profile.id === queryClient.getQueryData<UserResponse>(["user"])?.id
  }, [profile.id, queryClient])

  const handleEditProfile = useCallback(() => {
    setEditMode(prev => !prev)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="w-full flex justify-between">
          About Me{" "}
          {isCurrentUser && (
            <Button
              variant={editMode ? "destructive" : "glass-outline"}
              size="icon-sm"
              onClick={handleEditProfile}
            >
              <HugeiconsIcon icon={editMode ? Cancel : Edit01Icon} />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {editMode ? (
          <EditProfileForm
            profile={profile}
            onSuccess={() => setEditMode(false)}
            onCancel={() => setEditMode(false)}
          />
        ) : (
          <div className="bg-background backdrop-blur-lg rounded-r-xl border-l-4 border-foreground p-4 italic">
            {profile.biography ? (
              <p className="text-sm leading-relaxed text-foreground">{profile.biography}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {isCurrentUser
                  ? "Tell others a bit about yourself by editing your profile."
                  : "This user hasn't added a bio yet."}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
