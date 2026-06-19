import { z } from "zod"
import { ActivityEventTypeSchema } from "../enums/ActivityEventType"
import { AttendeesResponseSchema } from "./AttendeesResponse"

export const ActivityResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  date: z.coerce.date(),
  venue: z.string(),
  city: z.string(),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  currentStatus: ActivityEventTypeSchema,
  attendees: z.array(AttendeesResponseSchema)
})

export type ActivityResponse = z.infer<typeof ActivityResponseSchema>
