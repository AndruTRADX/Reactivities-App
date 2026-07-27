import { z } from "zod"

export const UserProfileResponseSchema = z.object({
  id: z.string(),
  biography: z.string(),
  displayName: z.string(),
  imageUrl: z.string().nullable(),
})

export type UserProfileResponse = z.infer<typeof UserProfileResponseSchema>
