import { z } from "zod"

export const CancelActivityRequestSchema = z.object({
  reason: z.string().max(500).optional().nullable(),
})

export type CancelActivityRequest = z.infer<typeof CancelActivityRequestSchema>
