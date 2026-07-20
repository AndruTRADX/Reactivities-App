import { z } from "zod"

export const pagedRequestSchema = z.object({
  pageIndex: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(50).default(10),
  search: z.string().optional(),
  sort: z.string().optional(),
})

export type PagedRequest = z.infer<typeof pagedRequestSchema>
