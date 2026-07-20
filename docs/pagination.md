# Pagination

This document is the complete recipe for adding a paginated list anywhere in the app. It covers the backend contract, every shared piece on the frontend, how they connect, and how to extend the pattern for multiple lists on one page or lists nested inside a parent resource (e.g. items belonging to an entity).

If you're adding pagination to a new feature, skip to [Recipe: adding pagination to a new list](#recipe-adding-pagination-to-a-new-list).

---

## The backend contract

Every paginated endpoint follows the same shape (see [backend-context.md](./backend-context.md) for the CQRS/MediatR context):

**Request** — `[FromQuery]` params bound from a class deriving `SpecificationParams`:

```csharp
public abstract class SpecificationParams
{
    public string? Sort { get; set; }
    public int PageIndex { get; set; } = 1;
    public int PageSize { get; set; } = 10; // clamped to a max of 50
    public string? Search { get; set; }
}
```

**Response** — `PagedResponse<T>`, wrapped in the usual `ApiResponse<T>` envelope:

```csharp
public class PagedResponse<T> where T : class
{
    public int Count { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; }
    public int PageCount { get; set; }
    public IReadOnlyList<T> Data { get; set; } = [];
}
```

Everything on the frontend exists to produce that request shape and consume that response shape with as little repeated code as possible.

---

## The shared pieces

### 1. `PagedRequest` — `src/shared/schemas/request/PagedRequest.ts`

Mirrors `SpecificationParams`:

```ts
export const pagedRequestSchema = z.object({
  pageIndex: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(50).default(10),
  search: z.string().optional(),
  sort: z.string().optional(),
})
export type PagedRequest = z.infer<typeof pagedRequestSchema>
```

Use `PagedRequest` directly if the endpoint takes no extra filters and no typed sort. If a feature needs its own filters, or needs `sort` narrowed from a loose `string` to a fixed set of legal values, extend it in that feature's own request schema — the same way a feature's `EntitySpecificationParams` would extend `SpecificationParams` on the backend. This is the worked example for [sorting](#sorting) below:

```ts
// src/features/<feature>/schemas/request/EntitySpecificationParams.ts
export const entitySortOptions = [
  "date", "dateDesc", "title", "titleDesc", "category", "categoryDesc",
] as const
export type EntitySort = (typeof entitySortOptions)[number]

export const entitySpecificationParamsSchema = pagedRequestSchema.extend({
  sort: z.enum(entitySortOptions).optional(),
})
export type EntitySpecificationParams = z.infer<typeof entitySpecificationParamsSchema>
```

A feature with its own non-sort filters (a category, a status, a "going"/"hosting" toggle) follows the same `.extend({...})` shape — add the field, give it as narrow a type as the backend accepts.

### 2. `usePagedParams` — `src/shared/hooks/usePagedParams.ts`

Owns the current page — and, optionally, sort — as URL state (`useSearchParams`), not component state or a Zustand store — this makes list pages shareable/bookmarkable and keeps browser back/forward working.

```ts
type PagedParams<TSort extends string> = {
  pageIndex: number
  pageSize: number
  sort: TSort | undefined
  setPageIndex: (nextPageIndex: number) => void
  setSort: (nextSort: TSort) => void
}

export const usePagedParams = <TSort extends string = string>(
  key: string,
  defaultPageSize = 10
): PagedParams<TSort> => {
  const [searchParams, setSearchParams] = useSearchParams()

  const pageIndex = Number(searchParams.get(`${key}PageIndex`) ?? 1)
  const pageSize = Number(searchParams.get(`${key}PageSize`) ?? defaultPageSize)
  const sort = (searchParams.get(`${key}Sort`) ?? undefined) as TSort | undefined

  const setPageIndex = (nextPageIndex: number) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set(`${key}PageIndex`, String(nextPageIndex))
      return next
    })
  }

  const setSort = (nextSort: TSort) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set(`${key}Sort`, nextSort)
      next.set(`${key}PageIndex`, "1")
      return next
    })
  }

  return { pageIndex, pageSize, sort, setPageIndex, setSort }
}
```

The real file also carries a JSDoc comment above `usePagedParams` and each `PagedParams` field — that's what shows up as an editor hover tooltip at every call site (`key`, `defaultPageSize`, and each returned field). The prose below is the fuller "why," which doesn't belong in a tooltip.

**`key` is required, not optional.** It namespaces the URL params (`?entitiesPageIndex=2` vs `?itemsPageIndex=1`). Without it, any two paginated lists that end up on the same page — now or in some future change — would silently read and write the same `pageIndex`/`pageSize`/`sort` query params and stomp on each other. Making it required means every call site has to name its list, so the collision can't happen by accident. Pick a short, unique-per-page string that names the list, e.g. `"entities"` or `"items"`.

**`sort` is generic over `TSort`, not hardcoded to `string`.** A list that doesn't need sorting just ignores the returned `sort`/`setSort` and lets `TSort` default to `string`. A list that does — `usePagedParams<EntitySort>("entities")` — gets a `sort` typed as `EntitySort | undefined` and a `setSort` that only accepts a legal `EntitySort` value, so the URL can never end up holding a sort key the backend's `switch` doesn't recognize. See [Sorting](#sorting) below.

**`setSort` resets `pageIndex` to `1` as part of the same update.** Changing the ordering makes whatever page you were on meaningless — page 3 sorted by date and page 3 sorted by title are different records. This is handled once, here, instead of every caller having to remember it.

### 3. The query hook shape

Every paginated query hook follows this exact shape:

```ts
export const useGetEntities = (params: PagedRequest) => {
  const { data, isLoading, error } = useQuery<PagedResponse<EntityResponse>>({
    queryKey: ["entities", params],
    queryFn: () => agent.get<PagedResponse<EntityResponse>>("/entities", { params }),
    placeholderData: keepPreviousData,
  })

  return { pagedEntities: data, isLoadingEntities: isLoading, errorPagedEntities: error }
}
```

Two details that are easy to get wrong:

- **`queryKey: ["entities", params]`, not `["entities"]`.** Each page/size/filter combination is a distinct cache entry. Without this, switching pages would show stale data from whichever page was cached first, and two components rendering different pages of the same list would clobber each other's cache entry. Mutations still only need to invalidate the prefix — `invalidateQueries({ queryKey: ["entities"] })` matches every page at once.
- **`placeholderData: keepPreviousData`** (from `@tanstack/react-query`). Without it, `isLoading` flips back to `true` on every page change and the list flashes to its skeleton. With it, the previous page's data stays on screen while the next page fetches in the background — this is React Query's standard pagination pattern, not something specific to this app.

See [api-hooks.md](./api-hooks.md) for the rest of the query/mutation hook conventions (naming, `select`, error handling) that apply here unchanged.

### 4. Rendering — `PaginationControl`

`src/shared/components/common/PaginationControl.tsx` wraps shadcn's presentational pagination primitives (`src/shared/components/ui/pagination.tsx`, installed via `pnpm dlx shadcn@latest add pagination`) plus the page-range/ellipsis math in `src/shared/lib/pagination.ts` (`getPaginationRange`). It is a pure, dumb component:

```tsx
interface Props {
  pageIndex: number
  pageCount: number
  onPageChange: (pageIndex: number) => void
}
```

- Renders `null` when `pageCount <= 1` — no dangling empty pagination bar on short lists.
- Uses `onClick` (not real `href` navigation) since this is an SPA, calling `e.preventDefault()` then `onPageChange`.
- Previous/Next disable themselves at the first/last page.

It never talks to React Query or the URL directly — it only knows `pageIndex`/`pageCount`/`onPageChange`. That's what makes it reusable for any list, paginated any way you like.

---

## Recipe: adding pagination to a new list

Say you're adding a paginated `entities` list somewhere.

1. **Request type.** If `/entities` needs no extra filters beyond paging, import `PagedRequest` from `@sharedSchemas/request/PagedRequest` directly. Otherwise create `src/features/<feature>/schemas/request/EntitySpecificationParams.ts` extending `pagedRequestSchema` (see [above](#1-pagedrequest--srcsharedschemasrequestpagedrequestts)).

2. **Query hook.** In `src/features/<feature>/hooks/api/useEntities.ts`, add a hook following the [shape above](#3-the-query-hook-shape) — `queryKey: ["entities", params]`, `placeholderData: keepPreviousData`.

3. **Page state in the component:**

   ```tsx
   const { pageIndex, pageSize, setPageIndex } = usePagedParams("entities")
   const { pagedEntities, isLoadingEntities, errorPagedEntities } = useGetEntities({ pageIndex, pageSize })
   const entities = pagedEntities?.data ?? []
   ```

   Pick a `key` string ("entities") that's unique among whatever else might render on the same page.

4. **Render the list, then the control**, underneath it:

   ```tsx
   <PaginationControl
     pageIndex={pagedEntities?.pageIndex ?? pageIndex}
     pageCount={pagedEntities?.pageCount ?? 1}
     onPageChange={setPageIndex}
   />
   ```

   Read `pageIndex`/`pageCount` off the **response** (`pagedEntities?.pageIndex`), not off `usePagedParams`'s own `pageIndex`, falling back to the local value only while the first request is in flight. The response is the source of truth for what page actually got served.

That's the whole recipe — steps 1–2 are backend-mirroring boilerplate, steps 3–4 are two hooks and one component.

---

## Sorting

Sorting is entity-specific in a way paging isn't: `pageIndex`/`pageSize` mean the same thing for every list, but the legal `sort` values for one entity (`date`, `dateDesc`, `title`, ...) are not the legal values for some other entity's sort. That's the direct frontend equivalent of the backend's `EntitySpecification` `switch` statement over `specParams.Sort` — the switch's case list **is** the set of legal values, and the frontend needs its own copy of that same list, typed, so a bad value can't even be constructed.

**1. Define the sort union next to the request schema** (`EntitySpecificationParams.ts`, [above](#1-pagedrequest--srcsharedschemasrequestpagedrequestts)):

```ts
export const entitySortOptions = [
  "date", "dateDesc", "title", "titleDesc", "category", "categoryDesc",
] as const
export type EntitySort = (typeof entitySortOptions)[number]

export const entitySortLabels: Record<EntitySort, string> = {
  date: "Date (soonest)",
  dateDesc: "Date (latest)",
  title: "Title (A–Z)",
  titleDesc: "Title (Z–A)",
  category: "Category (A–Z)",
  categoryDesc: "Category (Z–A)",
}
```

`entitySortOptions` is reused for both runtime validation (`z.enum(entitySortOptions)` on the schema) and the UI dropdown's option list — one canonical list, so validation and UI can never drift apart. Keep `entitySortLabels` (the human-readable side of the same list) in the same file for the same reason.

**2. Pass `TSort` to `usePagedParams`:**

```ts
const { pageIndex, pageSize, sort, setPageIndex, setSort } =
  usePagedParams<EntitySort>("entities")
```

**3. Pass `sort` straight through to the query hook** — it's just another field on the params object, already covered by the existing `queryKey`/`keepPreviousData` handling:

```ts
const { pagedEntities } = useGetEntities({ pageIndex, pageSize, sort })
```

**4. Render `ComboboxSelect`** (`src/shared/components/common/ComboboxSelect.tsx`) driven off the same `entitySortOptions`/`entitySortLabels`. This is a plain `value`/`onValueChange` controlled component, not a form field — see [ui-components.md](./ui-components.md#where-a-new-component-belongs-forms-vs-common-vs-ui) for why it lives in `common/` rather than alongside `SelectInput` in `forms/`:

```tsx
<ComboboxSelect
  value={sort}
  onValueChange={value => value && setSort(value as EntitySort)}
  placeholder="Default"
  items={entitySortOptions.map(option => ({ label: entitySortLabels[option], value: option }))}
/>
```

The `value &&` guard matters: `onValueChange` can fire with `undefined` if the combobox's text input is cleared, and `setSort` isn't meant to be called with anything but a real `EntitySort`.

No "reset to default" item is needed in the list — the backend already treats "no `sort` sent" as its own default ordering. Leaving `sort` unset until the user picks something is correct, not a gap to fill.

---

## Multiple paginated lists on the same page

Give each list its own `usePagedParams` key:

```tsx
const entitiesPaging = usePagedParams("entities")
const itemsPaging = usePagedParams("items")
```

The URL ends up as `?entitiesPageIndex=2&itemsPageIndex=1` — fully independent, both survive a refresh, both are back-button friendly.

---

## Nested / scoped lists (e.g. items belonging to an entity)

A list that belongs to a specific parent resource — items belonging to one entity — needs one thing the top-level entities list doesn't: the parent id has to scope both the **request** and the **query key**.

**Backend:** the parent id is a route segment, not a query param — `GET /api/entities/{entityId}/items` — with the rest of the paging params still bound via `[FromQuery]` from a `SpecificationParams` subclass.

**Frontend query hook** — the id becomes a required argument, and it goes into the `queryKey` *before* `params`:

```ts
export const useGetItems = (entityId: string, params: PagedRequest) => {
  const { data, isLoading, error } = useQuery<PagedResponse<ItemResponse>>({
    queryKey: ["entity", entityId, "items", params],
    queryFn: () =>
      agent.get<PagedResponse<ItemResponse>>(`/entities/${entityId}/items`, { params }),
    placeholderData: keepPreviousData,
    enabled: !!entityId,
  })

  return { pagedItems: data, isLoadingItems: isLoading, errorItems: error }
}
```

Nesting the key under `["entity", entityId, "items", ...]` (rather than a flat `["items", ...]`) means a `useCreateItem` mutation can invalidate exactly one entity's items without touching any other entity's cached pages:

```ts
onSuccess: async () => {
  await queryClient.invalidateQueries({ queryKey: ["entity", entityId, "items"] })
}
```

**Component**, inside `EntityDetailsPage` or a child `ItemList`:

```tsx
const { pageIndex, pageSize, setPageIndex } = usePagedParams("items")
const { pagedItems, isLoadingItems } = useGetItems(entity.id, { pageIndex, pageSize })
```

`usePagedParams("items")` is the same namespacing mechanism from the [multiple lists](#multiple-paginated-lists-on-the-same-page) section above — it's what keeps `?itemsPageIndex=2` from colliding with anything else that might render alongside it on the entity details page.

---

## Gotchas

- **Forgetting `params` in the `queryKey`** is the single most common mistake — it silently makes every page share one cache entry. If you ever see "the list shows the same data no matter what page I'm on," this is almost always why.
- **Forgetting `placeholderData: keepPreviousData`** doesn't break anything, but every page change will flash the list back to its loading skeleton — jarring UX that's easy to miss in a quick manual test.
- **Forgetting the `usePagedParams` key** (or reusing the same key for two lists) doesn't error either — it just makes both lists jump to whatever page the other one is on. This only surfaces once a second list lands on the same page, which is exactly why the key is a required argument and not something to skip "for now."
- **Changing `pageSize` without resetting `pageIndex`.** Nothing in this app currently exposes a page-size selector, but if you add one: changing page size can put `pageIndex` out of range (e.g. page 5 of 10-per-page no longer exists at 25-per-page). Reset to page 1 whenever `pageSize` changes — `setSort` already does this for sort changes (see [Sorting](#sorting)); a page-size setter would need the same treatment.
- **`enabled: !!id` for id-scoped lists.** Like any other query that depends on a possibly-`undefined` id (see [api-hooks.md](./api-hooks.md)), don't skip calling the hook — gate it with `enabled`.
