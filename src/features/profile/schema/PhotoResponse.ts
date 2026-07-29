import { z } from "zod"

export const PhotoResponseSchema = z.object({
  id: z.string(),
  url: z.string(),
  publicId: z.string(),
  userId: z.string(),
})

export type PhotoResponse = z.infer<typeof PhotoResponseSchema>
