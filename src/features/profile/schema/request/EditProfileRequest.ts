import { requiredString } from "@/shared/lib/utils"
import { z } from "zod"

export const EditProfileRequestSchema = z.object({
  displayName: requiredString("Display name"),
  biography: z.string().optional().nullable(),
})

export type EditProfileRequest = z.infer<typeof EditProfileRequestSchema>
