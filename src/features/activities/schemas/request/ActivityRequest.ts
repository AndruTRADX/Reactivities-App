import { requiredString } from "@/shared/lib/utils"
import { z } from "zod"

export const ActivityRequestSchema = z.object({
  id: z.string().optional().nullable(),
  title: requiredString("Title"),
  description: requiredString("Description"),
  category: requiredString("Category"),
  date: z.coerce.date(),
  venue: requiredString("Venue"),
  city: requiredString("City"),
  // latitude: z.coerce.number(),
  // longitude: z.coerce.number(),
})

export type ActivityRequest = z.infer<typeof ActivityRequestSchema>
