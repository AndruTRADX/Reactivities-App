import { z } from "zod"

export const ActivityEventTypeSchema = z.enum(["Created", "Cancelled", "Reactivated", "Completed"])

export type ActivityEventType = z.infer<typeof ActivityEventTypeSchema>
