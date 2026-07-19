import { requiredString } from "@/shared/lib/utils"
import { z } from "zod"

export const LoginRequestSchema = z.object({
  email: z.email(),
  password: requiredString("Password", 6),
})

export type LoginRequest = z.infer<typeof LoginRequestSchema>
