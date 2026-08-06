import { requiredString } from "@/shared/lib/utils"
import { z } from "zod"

export const ActivityRequestSchema = z.object({
  id: z.string().optional(),
  title: requiredString("Title", 1, 100),
  description: requiredString("Description", 1, 5000),
  category: requiredString("Category", 1, 50),
  date: z.coerce.date({
    error: "Date is required",
  }),
  location: z.object({
    venue: requiredString("Venue", 1, 250),
    city: z.string().max(100).optional(),
    latitude: z.coerce.number(),
    longitude: z.coerce.number(),
  }),
})

export type ActivityRequest = z.infer<typeof ActivityRequestSchema>
