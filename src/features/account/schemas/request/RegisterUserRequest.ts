import { requiredString } from "@/shared/lib/utils"
import { z } from "zod"

export const RegisterUserRequestSchema = z.object({
  email: z.email(),
  password: requiredString("Password", 6),
  displayName: requiredString("displayName"),
  biography: z.string().optional(),
  imageUrl: z.string().optional(),
})

export type RegisterUserRequest = z.infer<typeof RegisterUserRequestSchema>
