# Reactivities – Frontend Conventions

Source of truth for `ReactivitiesApp` conventions. Apply these before writing any form, API hook, or schema.

## Docs

| Topic | Doc |
| --- | --- |
| Pages (naming, feature folder structure, routing) | [docs/pages.md](../../docs/pages.md) |
| Path aliases | [docs/path-aliases.md](../../docs/path-aliases.md) |
| Zod schemas (request & response) | [docs/schemas.md](../../docs/schemas.md) |
| Forms (React Hook Form, components, skeleton) | [docs/forms.md](../../docs/forms.md) |
| API hooks (useQuery, useMutation, agent.ts) | [docs/api-hooks.md](../../docs/api-hooks.md) |
| Pagination (any paginated list, single or nested) | [docs/pagination.md](../../docs/pagination.md) |
| Theming (colors, dark mode, backdrop-blur) | [docs/theming.md](../../docs/theming.md) |
| UI components (shadcn, where new components live) | [docs/ui-components.md](../../docs/ui-components.md) |
| Loading states (skeletons) | [docs/loading-states.md](../../docs/loading-states.md) |
| Confirm dialog (global confirmation, useConfirmDialog) | [docs/confirm-dialog.md](../../docs/confirm-dialog.md) |
| Backend context (CQRS, ApiResponse, validation) | [docs/backend-context.md](../../docs/backend-context.md) |

## Integrations

Third-party service integrations live under `docs/integrations/`, separate from the business-logic docs above:

| Service | Doc |
| --- | --- |
| LocationIQ (address search & geocoding) | [docs/integrations/location-iq.md](../../docs/integrations/location-iq.md) |

**Writing or editing a doc?** Follow the rules in [CLAUDE.md](../../CLAUDE.md) first — one topic per doc, cross-reference instead of repeating, and never illustrate a pattern with a real app entity (`Activity`, `Attendee`, ...); use `Entity`/`Item` boilerplate instead.

## Quick rules

- **Pages:** filename always `<Name>Page.tsx`. A feature's primary page lives at the feature root; every additional page goes in `pages/<action>/`. Register every new page in `src/app/router/Route.tsx`.
- **Schemas:** always export both the Zod schema and `z.infer<>` type. Use `requiredString()` for required fields.
- **Forms:** always `mode: "onTouched"`. Always `useMemo` for `isSubmitting` and `isDisabled`. Always use the `form id` pattern when button and form are separated in the DOM. Always show `<Spinner />` while submitting.
- **Hooks:** name as `use<Verb><Entity>`. Expose `mutateAsync` (never `mutate`). Hook `onSuccess` = cache logic. Call-site `onSuccess` = UI logic.
- **agent.ts:** never handle 400/404/500 errors manually — the interceptor does it.
- **queryKey:** `["entities"]` for lists, `["entity", id]` for detail, `["user"]` for current user. Must be consistent or invalidation breaks.
