import { z } from "zod"

export const createProblemDetailsResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    status: z.number().int().nonnegative(),
    title: z.string(),
    detail: z.string(),
    type: z.string(),
    data: z.array(dataSchema),
  })

export type ProblemDetailsResponse<T> = z.infer<ReturnType<typeof createProblemDetailsResponseSchema<z.ZodType<T>>>>
