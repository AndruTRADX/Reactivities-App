import { z } from "zod"

export const createPagedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    count: z.number().int().nonnegative(),
    pageIndex: z.number().int().nonnegative(),
    pageSize: z.number().int().positive(),
    pageCount: z.number().int().nonnegative(),
    data: z.array(dataSchema),
  })

export type PagedResponse<T> = z.infer<ReturnType<typeof createPagedResponseSchema<z.ZodType<T>>>>
