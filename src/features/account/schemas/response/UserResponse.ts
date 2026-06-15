import { z } from "zod"

export const UserResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  displayName: z.string(),
  imageUrl: z.string().optional().nullable(),
})

export type UserResponse = z.infer<typeof UserResponseSchema>
