import { requiredString } from "@/lib/utils"
import { z } from "zod"

export const ActivityRequestSchema = z.object({
  title: requiredString("Title"),
  description: requiredString("Description"),
  category: requiredString("Category"),
  date: z.coerce.date(),
  location: z.object({
    venue: requiredString("Venue"),
    city: z.string(),
    latitude: z.coerce.number(),
    longitude: z.coerce.number(),
  }),
})

export type ActivityRequest = z.infer<typeof ActivityRequestSchema>
