# Schemas (Zod)

## Request schemas

Live in `src/features/<feature>/schemas/request/`. Represent what gets sent to the backend in the request body.

```ts
// Always export both the schema AND the inferred type
export const EntityRequestSchema = z.object({
  name: requiredString("Name"),
  reason: z.string().optional().nullable(),
})
export type EntityRequest = z.infer<typeof EntityRequestSchema>
```

**Rules:**

- Required fields: use `requiredString("FieldName")` from `@/shared/lib/utils`. Produces consistent error messages.
- Optional fields: `z.string().optional()` or `.nullable()` depending on what the backend returns.
- Dates: `z.coerce.date()` so Zod automatically converts string → Date.
- Numbers: `z.coerce.number()` for the same reason.

## Response schemas

Live in `src/features/<feature>/schemas/response/`. Represent what arrives from the backend.

```ts
// Backend sends fields flat — the schema mirrors that exactly
export const EntityResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  currentStatus: z.enum(["Created", "Cancelled", "Reactivated", "Completed"]),
})
export type EntityResponse = z.infer<typeof EntityResponseSchema>
```

> Response schemas are **not used for runtime parsing**. They exist only as TypeScript types. The axios interceptor extracts data directly without validation.

## Shared schemas (`src/shared/schemas/response/`)

`ApiResponse<T>`, `PagedResponse<T>`, and `ProblemDetailsResponse<T>` use a factory function pattern:

```ts
export const createApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({ success: z.boolean(), message: z.string(), data: dataSchema.optional(), ... })
export type ApiResponse<T> = z.infer<ReturnType<typeof createApiResponseSchema<z.ZodType<T>>>>
```

Do not use them for runtime validation. Types only.
