import { requiredString } from "@/shared/lib/utils"
import { z } from "zod"

export const RegisterUserRequestSchema = z
  .object({
    email: z.email().max(256),
    password: requiredString("Password", 6, 512),
    confirmPassword: requiredString("confirmPassword", 6, 512),
    displayName: requiredString("displayName", 1, 50),
    biography: z.string().max(1000).optional(),
    imageUrl: z.string().max(500).optional(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type RegisterUserRequest = z.infer<typeof RegisterUserRequestSchema>
