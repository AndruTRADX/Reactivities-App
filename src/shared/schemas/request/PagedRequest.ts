import { z } from "zod"

export const pagedRequestSchema = z.object({
  pageIndex: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(50).default(10),
  search: z.string().max(1000).optional(),
  sort: z.string().max(126).optional(),
})

export type PagedRequest = z.infer<typeof pagedRequestSchema>
