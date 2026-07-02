import { z } from "zod"

export const CancelActivityRequestSchema = z.object({
  reason: z.string().optional().nullable(),
})

export type CancelActivityRequest = z.infer<typeof CancelActivityRequestSchema>
