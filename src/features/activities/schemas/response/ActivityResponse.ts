import { z } from "zod"

export const ActivityResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  date: z.coerce.date(),
  location: z.object({
    venue: z.string(),
    city: z.string(),
    latitude: z.coerce.number(),
    longitude: z.coerce.number(),
  }),
})

export type ActivityResponse = z.infer<typeof ActivityResponseSchema>
