import { z } from "zod"

export const createProblemDetailsResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    title: z.string(),
    message: z.string(),
    data: dataSchema.nullable(),
    errors: z.record(z.string(), z.array(z.string())).nullable(),
  })

export type ProblemDetailsResponse<T> = z.infer<
  ReturnType<typeof createProblemDetailsResponseSchema<z.ZodType<T>>>
>
