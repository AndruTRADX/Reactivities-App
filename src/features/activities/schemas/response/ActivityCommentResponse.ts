import { z } from "zod"
import { UserProfileResponseSchema } from "@sharedSchemas/response/UserProfileResponse"

export const ActivityCommentResponseSchema = z.object({
  id: z.string(),
  body: z.string(),
  createdAt: z.iso.datetime(),
  userId: z.string(),
  activityId: z.string(),
  user: UserProfileResponseSchema,
})

export type ActivityCommentResponse = z.infer<typeof ActivityCommentResponseSchema>
