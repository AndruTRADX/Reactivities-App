import { requiredString } from "@/shared/lib/utils"
import { z } from "zod"

export const CancelActivityRequestSchema = z.object({
  id: requiredString("Id"),
  reason: z.string().optional().nullable(),
})

export type CancelActivityRequest = z.infer<typeof CancelActivityRequestSchema>
