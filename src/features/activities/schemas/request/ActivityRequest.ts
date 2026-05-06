import { requiredString } from "@/shared/lib/utils"
import { z } from "zod"

export const ActivityRequestSchema = z.object({
  id: z.string().optional(),
  title: requiredString("Title"),
  description: requiredString("Description"),
  category: requiredString("Category"),
  date: z.coerce.date({
    error: "Date is required",
  }),
  location: z.object({
    venue: requiredString("Venue"),
    city: z.string().optional(),
    latitude: z.coerce.number(),
    longitude: z.coerce.number(),
  }),
  // latitude: z.coerce.number(),
  // longitude: z.coerce.number(),
})

export type ActivityRequest = z.infer<typeof ActivityRequestSchema>
