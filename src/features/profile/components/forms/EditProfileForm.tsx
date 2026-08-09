import { useCallback, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@sharedUi/button"
import { Spinner } from "@sharedUi/spinner"
import TextInput from "@sharedForms/TextInput"
import type { UserProfileResponse } from "@sharedSchemas/response/UserProfileResponse"
import {
  EditProfileRequestSchema,
  type EditProfileRequest,
} from "@profile/schema/request/EditProfileRequest"
import { useEditProfile } from "@profile/hooks/api/useProfile"
import { FieldGroup } from "@/shared/components/ui/field"

interface Props {
  profile: UserProfileResponse
  onSuccess: () => void
  onCancel: () => void
}

export default function EditProfileForm({ profile, onSuccess, onCancel }: Props) {
  const { editProfileAsync, isPendingEditProfile } = useEditProfile()

  const form = useForm<EditProfileRequest>({
    resolver: zodResolver(EditProfileRequestSchema),
    mode: "onTouched",
    defaultValues: {
      displayName: profile.displayName,
      biography: profile.biography ?? "",
    },
  })

  const {
    formState: { isValid },
  } = form

  const onSubmit = useCallback(
    async (data: EditProfileRequest) => {
      await editProfileAsync(data, {
        onSuccess: () => {
          toast.success("Profile updated successfully")
          onSuccess()
        },
      })
    },
    [editProfileAsync, onSuccess]
  )

  const isDisabled = useMemo(
    () => isPendingEditProfile || !isValid,
    [isPendingEditProfile, isValid]
  )

  return (
    <form id="edit-profile-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <TextInput
          control={form.control}
          name="displayName"
          label="Display name"
          placeholder="Display name"
        />
        <TextInput
          control={form.control}
          name="biography"
          label="Biography"
          multiline
          rows={4}
          placeholder="Tell us about yourself"
        />
      </FieldGroup>

      <div className="flex gap-2 justify-end mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isDisabled}>
          {isPendingEditProfile ? (
            <>
              <Spinner /> Saving
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </form>
  )
}
