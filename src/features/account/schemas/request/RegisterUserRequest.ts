import { requiredString } from "@/shared/lib/utils"
import { z } from "zod"

export const RegisterUserRequestSchema = z
  .object({
    email: z.email(),
    password: requiredString("Password", 6),
    confirmPassword: requiredString("confirmPassword", 6),
    displayName: requiredString("displayName"),
    biography: z.string().optional(),
    imageUrl: z.string().optional(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type RegisterUserRequest = z.infer<typeof RegisterUserRequestSchema>
