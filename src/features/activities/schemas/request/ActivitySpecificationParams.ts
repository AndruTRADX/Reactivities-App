import { z } from "zod"
import { pagedRequestSchema } from "@sharedSchemas/request/PagedRequest"

export const activitySortOptions = [
  "date",
  "dateDesc",
  "title",
  "titleDesc",
  "category",
  "categoryDesc",
] as const

export type ActivitySort = (typeof activitySortOptions)[number]

export const activitySortLabels: Record<ActivitySort, string> = {
  date: "Date (soonest)",
  dateDesc: "Date (latest)",
  title: "Title (A-Z)",
  titleDesc: "Title (Z-A)",
  category: "Category (A-Z)",
  categoryDesc: "Category (Z-A)",
}

export const activitySpecificationParamsSchema = pagedRequestSchema.extend({
  sort: z.enum(activitySortOptions).optional(),
})

export type ActivitySpecificationParams = z.infer<typeof activitySpecificationParamsSchema>
