# Reactivities – Frontend Conventions

Source of truth for `ReactivitiesApp` conventions. Apply these before writing any form, API hook, or schema.

## Docs

| Topic | File |
|---|---|
| Path aliases | [docs/path-aliases.md](../../docs/path-aliases.md) |
| Zod schemas | [docs/schemas.md](../../docs/schemas.md) |
| Forms (RHF, components, skeleton) | [docs/forms.md](../../docs/forms.md) |
| API hooks | [docs/api-hooks.md](../../docs/api-hooks.md) |
| Backend context | [docs/backend-context.md](../../docs/backend-context.md) |

## Quick rules

- **Schemas:** always export both the Zod schema and `z.infer<>` type. Use `requiredString()` for required fields.
- **Forms:** always `mode: "onTouched"`. Always `useMemo` for `isSubmitting` and `isDisabled`. Always use the `form id` pattern when button and form are separated in the DOM. Always show `<Spinner />` while submitting.
- **Hooks:** name as `use<Verb><Entity>`. Expose `mutateAsync` (never `mutate`). Hook `onSuccess` = cache logic. Call-site `onSuccess` = UI logic.
- **agent.ts:** never handle 400/404/500 errors manually — the interceptor does it.
- **queryKey:** `["entities"]` for lists, `["entity", id]` for detail, `["user"]` for current user. Must be consistent or invalidation breaks.
