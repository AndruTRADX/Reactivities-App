import { requiredString } from "@/shared/lib/utils"
import { z } from "zod"

export const EditProfileRequestSchema = z.object({
  displayName: requiredString("Display name", 1, 50),
  biography: z.string().max(1000).optional().nullable(),
})

export type EditProfileRequest = z.infer<typeof EditProfileRequestSchema>
