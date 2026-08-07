import { z } from "zod"

export const AddCommentRequestSchema = z.object({
  body: z.string().min(1, "Comment is required").max(512, "Comment must not exceed 512 characters"),
})

export type AddCommentRequest = z.infer<typeof AddCommentRequestSchema>
