import { z } from "zod"
import { UserResponseSchema } from "@sharedSchemas/response/UserResponse"

export const AttendeesResponseSchema = z.object({
  id: z.string(),
  activityId: z.string(),
  isHost: z.boolean(),
  dateJoined: z.iso.datetime(),
  user: UserResponseSchema,
})

export type AttendeesResponse = z.infer<typeof AttendeesResponseSchema>
