import { z } from "zod"
import { UserProfileResponseSchema } from "@sharedSchemas/response/UserProfileResponse"

export const AttendeesResponseSchema = z.object({
  id: z.string(),
  activityId: z.string(),
  isHost: z.boolean(),
  dateJoined: z.iso.datetime(),
  user: UserProfileResponseSchema,
})

export type AttendeesResponse = z.infer<typeof AttendeesResponseSchema>
