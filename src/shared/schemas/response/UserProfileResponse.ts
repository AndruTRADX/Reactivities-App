import { z } from "zod"

export const UserProfileResponseSchema = z.object({
  id: z.string(),
  biography: z.string(),
  displayName: z.string(),
  imageUrl: z.string().nullable(),
  following: z.boolean(),
  followedBy: z.boolean(),
  followersCount: z.number(),
  followingsCount: z.number(),
})

export type UserProfileResponse = z.infer<typeof UserProfileResponseSchema>
