# API Hooks — How and Why

This document explains the architecture behind every API call in the app: why we chose the tools we use, how they work internally, and the rules that exist to prevent subtle bugs.

---

## Why these technologies?

### TanStack Query (React Query)

Raw `useEffect + useState` for data fetching is a footgun. You end up reimplementing loading states, error states, caching, deduplication, background refetching, and race condition handling — poorly — in every component. React Query solves all of that by treating **server state** as a first-class concept separate from UI state.

The key insight is that server data is not "state you own" — it's a snapshot of remote data that can go stale. React Query manages that lifecycle:

- **Cache:** the result of a query is stored by its `queryKey`. Any component that needs the same data gets the cached value instantly instead of making a new request.
- **Stale-while-revalidate:** cached data is shown immediately, and a background refetch runs to update it. No loading spinner on re-visits.
- **Deduplication:** if five components mount at the same time and all call `useGetEntityById("123")`, only one HTTP request goes out.
- **Automatic refetch:** when the window regains focus or the network reconnects, stale queries re-fetch in the background.

We use Zustand for client-only UI state (dialogs, themes). We use React Query for anything that comes from the server. Mixing them up — putting server data in Zustand — leads to cache invalidation bugs that are painful to debug.

### Axios over `fetch`

Axios was chosen for one primary reason: **interceptors**. The interceptor pattern lets us unwrap the `ApiResponse<T>` envelope and handle all error status codes in a single place, so no hook or component ever needs to deal with HTTP-level concerns.

`fetch` can do the same thing, but it requires wrapping every call manually or building a custom abstraction. Axios gives us that abstraction out of the box.

---

## Hook syntax conventions

Every API hook lives under a feature's `hooks/api/` folder (or `src/shared/hooks/api/` for cross-cutting data like the current user). Two shapes cover every case: a **query hook** for reads and a **mutation hook** for writes.

### Query hook template

```ts
export const useGetEntity = (id: string | undefined) => {
  const { data, isLoading, error } = useQuery<EntityResponse>({
    queryKey: ["entity", id],
    queryFn: () => agent.get<EntityResponse>(`/entities/${id}`),
    enabled: !!id,
  })

  return {
    entity: data,
    isLoadingEntity: isLoading,
    errorEntity: error,
  }
}
```

- `queryFn` calls `agent` directly and returns its result — no manual unwrapping (see [module augmentation](#module-augmentation--removing-the-axiosresponse-wrapper) above).
- The hook never returns the raw `{ data, isLoading, error }` tuple. It renames every field to say what it is: `data` → `entity`, `isLoading` → `isLoadingEntity`, `error` → `errorEntity`. This makes it safe to call two hooks side by side in a component without destructuring collisions.
- If the query depends on an id that might be `undefined`, set `enabled: !!id` rather than skipping the hook call — hooks can't be called conditionally.
- Use `select` to reshape or enrich the response (e.g. attaching derived or related data) instead of doing that work in the component.

### Mutation hook template

```ts
export const useDoEntity = () => {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (request: DoEntityRequest) => {
      return await agent.post("/entities", request)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["entities"] })
    },
  })

  return {
    doEntityAsync: mutateAsync,
    isPendingDoEntity: isPending,
  }
}
```

- Same renaming rule as query hooks: `mutateAsync` → `<verb><Noun>Async`, `isPending` → `isPending<Verb><Noun>`.
- `mutationFn` is always `async` and always just calls `agent` and returns — no try/catch (the [error interceptor](#error-interceptor--centralized-http-error-handling) owns that).
- The hook-level `onSuccess` is for cache consistency (`invalidateQueries`/`removeQueries`) and hook-scoped side effects that must always run (e.g. `navigate` on logout). It does **not** take the calling component's context.
- Callers can pass a second argument to the returned `*Async` function for one-off, call-site behavior (a toast, closing a dialog) without touching the hook:

  ```ts
  await cancelEntityAsync(
    { id: entity.id },
    { onSuccess: () => toast.success("Entity cancelled") }
  )
  ```

  Both the hook's `onSuccess` and the call-site `onSuccess` run — React Query calls them in that order. Put cache invalidation in the hook; put UI feedback that's specific to one usage at the call site.

### Optimistic updates — `useOptimisticUpdate`

Some mutations should update the UI immediately instead of waiting for the server round-trip (e.g. joining/leaving something, toggling a flag). Do this with the shared hook at `src/shared/hooks/useOptimisticUpdate.ts` (`@sharedHooks/useOptimisticUpdate`) rather than hand-rolling `onMutate`/`onError` per mutation hook — the cancel/snapshot/rollback plumbing is identical every time, and hand-rolling it is where subtle race conditions and copy-paste drift creep in.

```ts
export const useDoEntity = () => {
  const queryClient = useQueryClient()

  const { onMutate, onError } = useOptimisticUpdate<EntityResponse, { id: string }>({
    optimisticQueryKey: ({ id }) => ["entity", id],
    relatedQueryKeysToCancel: () => [["entities"]],
    updater: (entity, { id }) => ({ ...entity /* the optimistic change */ }),
  })

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return await agent.post(`/entities/${id}/do`, { id })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["entities"] })
    },
    onMutate,
    onError,
  })

  return {
    doEntityAsync: mutateAsync,
    isPendingDoEntity: isPending,
  }
}
```

- **`optimisticQueryKey` vs `relatedQueryKeysToCancel` — the key distinction of this hook:**

  | | `optimisticQueryKey` | `relatedQueryKeysToCancel` |
  |---|---|---|
  | Cardinality | Exactly one | Zero or more |
  | Cancelled before mutating | Yes | Yes |
  | Read via `getQueryData` and snapshotted | Yes | No |
  | Hand-edited via `updater` | Yes | No |
  | Restored in `onError` | Yes | No — never touched again |

  `optimisticQueryKey` identifies the single cache entry you're hand-editing — the same `queryKey` shape [used everywhere else](#querykey--the-cache-identity). It's the one entry that gets read, mutated, and — if the server rejects the mutation — rolled back to its snapshot.

  `relatedQueryKeysToCancel` is for *other* cached views of the same data that you are **not** editing (e.g. a list that shows the entity but whose shape you're not hand-updating). They're only cancelled, to close the race window where an in-flight background refetch could land mid-mutation and overwrite your optimistic write with stale data. Nothing about them is snapshotted or restored — once the mutation settles, bringing them back in sync is `onSuccess`/`invalidateQueries`' job, not this hook's.

- `updater` is the only mutation-specific part: given the current cached data and the mutation's variables, return the new data. Keep it a pure, synchronous transform — no side effects.
- The hook returns `{ onMutate, onError }` ready to spread straight into `useMutation`. If the mutation also needs `onSuccess` (e.g. to invalidate a list after the server confirms), add it alongside — all three can coexist, same as the plain mutation template above.
- Only wire up `useOptimisticUpdate` when the mutation actually benefits from instant feedback. A mutation with only server-side side effects and no relevant cached view (e.g. sending an email) should stay with the plain [mutation hook template](#mutation-hook-template) and `onSuccess`/`invalidateQueries`.

### Naming conventions

| Raw React Query field | Renamed to | Example |
|---|---|---|
| `data` (query) | `<noun>` | `entity`, `pagedEntities`, `user` |
| `isLoading` (query) | `isLoading<Noun>` | `isLoadingEntity` |
| `error` (query) | `error<Noun>` | `errorEntity` |
| `mutateAsync` | `<verb><Noun>Async` | `createEntityAsync`, `cancelEntityAsync` |
| `isPending` (mutation) | `isPending<Verb><Noun>` | `isPendingCancelEntity` |

Hook function names follow the same verb: `useGetX`, `useCreateX`, `useUpdateX`, `useCancelX`, `useJoinX`, `useLeaveX`. This keeps the hook name, its returned field names, and its purpose all readable at the call site without needing to open the hook file.

## `agent.ts` — the HTTP client in detail

Located at `src/shared/services/agent.ts`. Every API call in the app goes through this single axios instance.

### Instance creation

```ts
const agent = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})
```

`axios.create()` produces an isolated instance with its own config and interceptors, separate from the global `axios` object. This means the interceptors we attach only apply to our API calls — not to any third-party library that also uses axios elsewhere in the app (e.g. an address-autocomplete widget calling its own provider).

### Module augmentation — removing the `AxiosResponse` wrapper

By default, axios methods return `Promise<AxiosResponse<T>>`, meaning you'd always need `.data` to get to the actual response:

```ts
// Without augmentation — every hook would need this
const response = await agent.get<ApiResponse<EntityResponse>>("/entities/123")
const entity = response.data.data  // unwrap AxiosResponse, then unwrap ApiResponse
```

We override that with a TypeScript module augmentation at the top of `agent.ts`:

```ts
declare module "axios" {
  export interface AxiosInstance {
    get<T = unknown>(url: string, config?: unknown): Promise<T>
    post<T = unknown>(url: string, data?: unknown, config?: unknown): Promise<T>
    put<T = unknown>(url: string, data?: unknown, config?: unknown): Promise<T>
    patch<T = unknown>(url: string, data?: unknown, config?: unknown): Promise<T>
    delete<T = unknown>(url: string, config?: unknown): Promise<T>
  }
}
```

This tells TypeScript that our axios instance methods return `Promise<T>` directly. Combined with the response interceptor below, calling `agent.get<EntityResponse>(...)` gives you an `EntityResponse` with zero unwrapping.

### Response interceptor — unwrapping `ApiResponse<T>`

```ts
agent.interceptors.response.use(
  <T>(response: AxiosResponse<ApiResponse<T>>): T => {
    return response.data.data as T
  },
  // error handler...
)
```

Every successful response from the backend arrives as:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ...the actual payload... },
  "errors": null
}
```

The interceptor strips the `ApiResponse` envelope and returns only `response.data.data`. By the time the value reaches a hook's `queryFn` or `mutationFn`, it is already the payload type — the envelope is invisible to application code.

### Error interceptor — centralized HTTP error handling

```ts
(error: AxiosError<ProblemDetailsResponse<T>>) => {
  if (!error.response) {
    toast.error(`Something went wrong: ${error.message}`)
    return Promise.reject(error)
  }

  const { status, data } = error.response
  const title = data?.title || STATUS_LABELS[status] || "Error"
  const message = data?.message || error.message
  const errors = data?.errors

  switch (status) {
    case 400:
      if (errors && Object.keys(errors).length > 0) {
        // Format FluentValidation per-field errors into a readable toast
        const errorLines: string[] = []
        for (const [field, messages] of Object.entries(errors)) {
          errorLines.push(`${field}:`)
          messages.forEach(msg => errorLines.push(`  • ${msg}`))
        }
        toast.error(`${title}: ${message}`, {
          description: errorLines.join("\n"),
          style: { whiteSpace: "pre-line" },
        })
      } else {
        toast.error(`${title}: ${message}`)
      }
      return Promise.reject(error)

    case 404:
      router.navigate("/not-found", { state: error.response.data })
      return Promise.reject(error)

    case 500:
      router.navigate("/server-error", { state: error.response.data })
      return Promise.reject(error)

    default:
      toast.error(`${title}: ${message}`)
      return Promise.reject(error)
  }
}
```

#### HTTP status behavior

| Status | What happens | Why |
|---|---|---|
| Network error (no response) | Toast: "Something went wrong: \<message\>" | Can't do anything smarter without a status code |
| `400` without field errors | Toast with title and message | A general bad request — one message is enough |
| `400` with field errors | Toast listing every field and its errors | FluentValidation failures — users need to know which fields failed |
| `401` | Default toast | Session expired or not logged in |
| `403` | Default toast | Logged in but not allowed |
| `404` | Navigate to `/not-found`, passing error data as route state | A full page makes more sense than a toast for missing resources |
| `422` | Default toast | Semantic validation failure |
| `500` | Navigate to `/server-error`, passing error data as route state | A crash deserves a dedicated page, not a toast that disappears |

The interceptor always calls `Promise.reject(error)` after handling — this ensures the rejection propagates to React Query, which updates `isError` and `error` accordingly even though the toast already appeared.

**This means: never write error handling in hooks or components.** No `try/catch` around `agent` calls, no `.catch()` chains, no checking `error.response.status` anywhere outside `agent.ts`. The interceptor is the single point of truth for HTTP errors.

---

## `withCredentials` and session management

### What `withCredentials: true` does

By default, browsers do not send cookies on cross-origin requests. Setting `withCredentials: true` on the axios instance overrides this, telling the browser to attach cookies to every request — even when the frontend (`localhost:5173`) and backend (`localhost:5001`) are on different origins.

### How authentication works in this app

This app uses **cookie-based authentication** via ASP.NET Core Identity. The flow:

1. The user submits credentials to `/login?useCookies=true` (ASP.NET Identity's built-in endpoint).
2. The backend validates credentials and, on success, sets an `HttpOnly` cookie on the response.
3. The browser stores the cookie. Because it is `HttpOnly`, JavaScript cannot read or modify it — it is completely invisible to app code.
4. On every subsequent request, the browser automatically includes this cookie in the `Cookie` header, because `withCredentials: true` is set on the axios instance.
5. ASP.NET Core reads the cookie, validates the session, and sets the authenticated user on the request context.
6. The `[Authorize]` attribute on controllers checks this and either allows or rejects the request with `401`.

### Why `HttpOnly` cookies instead of tokens in `localStorage`?

Storing tokens in `localStorage` exposes them to XSS attacks — any injected script can read `localStorage`. `HttpOnly` cookies cannot be accessed by JavaScript at all, which eliminates that attack surface entirely. The tradeoff is that CORS must be configured correctly on the backend.

### CORS requirement

For `withCredentials` to work, the backend must explicitly allow the frontend origin **with credentials**. A wildcard `Access-Control-Allow-Origin: *` is not permitted when credentials are involved — the backend must specify the exact origin (e.g. `http://localhost:5173`) and include `Access-Control-Allow-Credentials: true`. If the backend CORS policy is misconfigured, every credentialed request will be blocked by the browser before it even reaches the server.

### Logout

On logout, the backend clears the cookie server-side. The frontend then calls `queryClient.removeQueries({ queryKey: ["user"] })` to wipe the cached user from memory — otherwise the UI would still show the old user data until the cache naturally expires.

---

## `queryKey` — the cache identity

A `queryKey` is the identifier for a cached query. React Query uses it to:

1. **Find cached data** — when a component mounts and calls `useQuery`, React Query looks up the key in the cache. If it finds a non-stale entry, it returns the cached data immediately without making a request.
2. **Deduplicate requests** — if multiple components use the same key simultaneously, only one request goes out.
3. **Target invalidation** — when you call `invalidateQueries`, you provide a key (or partial key) to identify which cache entries to mark as stale.

### Shape

Always an array. The first element is a string identifier; additional elements narrow the scope:

```ts
["entities"]           // the paginated list
["entity", "abc-123"]  // one specific entity
["user"]                // the current authenticated user
```

Using an array enables **partial key matching** for invalidation — more on that below.

### Convention in this project

| Data | Key |
|---|---|
| Entity list (paginated) | `["entities", params]` |
| Entity by id | `["entity", id]` |
| Current user | `["user"]` |

These must be consistent everywhere. A typo (`"entites"` vs `"entities"`) creates two separate cache entries that never share data and never invalidate each other — a bug that shows stale data silently.

**Paginated lists key on the params object, not a bare string** — see [pagination.md](./pagination.md#3-the-query-hook-shape) for why, and for the full `queryKey`/`placeholderData` shape every paginated query hook follows.

---

## `invalidateQueries` — the right way to refresh data

After a mutation (create, update, cancel), the cached data is stale — it no longer reflects what's on the server. `invalidateQueries` is how you tell React Query that.

```ts
await queryClient.invalidateQueries({ queryKey: ["entities"] })
```

What this actually does:

1. **Marks all matching cache entries as stale.** The data isn't deleted — it stays in memory.
2. **Triggers an immediate background refetch for any matching query that is currently mounted** (i.e. a component is actively rendering with that data).
3. Queries that are not currently mounted just get marked stale — they will re-fetch the next time a component mounts and uses them.

### Partial key matching

`invalidateQueries` matches by prefix. `{ queryKey: ["entity"] }` would invalidate both `["entity", "abc"]` and `["entity", "xyz"]`. In this project, mutation hooks currently only invalidate the list key. If the detail view also needs to refresh after a write, add a second call:

```ts
onSuccess: async () => {
  await queryClient.invalidateQueries({ queryKey: ["entities"] })
  await queryClient.invalidateQueries({ queryKey: ["entity", id] })
}
```

---

## `removeQueries` — wiping data from cache

`removeQueries` completely removes entries from the cache. The data is gone — the next time a component requests it, it will be treated as if it was never fetched.

```ts
queryClient.removeQueries({ queryKey: ["user"] })
```

Use it when the data should no longer exist in memory at all, not just be refreshed. The primary use case is **logout**: after the user signs out, their data should be cleared from memory entirely — not just marked stale (which would still briefly show the old user data on re-mount).

### `invalidateQueries` vs `removeQueries`

| | `invalidateQueries` | `removeQueries` |
|---|---|---|
| What it does | Marks stale, triggers background refetch | Deletes from cache entirely |
| Data visible while re-fetching | Yes — stale data shows until new data arrives | No — loading state until re-fetch completes |
| When to use | After mutations — fresh data, brief stale flash is fine | After logout — showing stale user data is a security concern |

---

## Pagination

Query hooks backing a paginated list (e.g. `useGetEntities`) follow a specific `queryKey`/`placeholderData` shape so that page changes don't fight the cache or flash the skeleton. The full pattern — request shape, URL-driven page state, the query hook shape, and rendering — is documented in **[pagination.md](./pagination.md)**. Read it before adding pagination to any new list.

---

## Never use `refetch`

`useQuery` returns a `refetch` function. Do not use it.

```ts
// ❌ Never do this
const { data, refetch } = useGetEntities()

const handleSomething = async () => {
  await doSomeMutation()
  refetch()  // wrong
}
```

### Why `refetch` is wrong here

`refetch` is **component-scoped and imperative**. Problems:

1. **It only affects the component that called it.** If another component on the page also uses `useGetEntities()`, it won't re-fetch — it will still show stale data.
2. **It ignores `staleTime`.** React Query is designed around declaring when data is stale and managing re-fetching automatically. `refetch` overrides that and forces an immediate request regardless of cache state.
3. **It creates invisible coupling.** The mutation and the query are coupled through the component. If the query moves to a different component, the `refetch` call breaks silently with no type error.

`invalidateQueries` is **global and declarative**. It says "this data is now stale" and React Query handles the rest — re-fetching every mounted component that uses the key, regardless of where in the component tree they are:

```ts
// ✅ Always do this — in the mutation hook's onSuccess
onSuccess: async () => {
  await queryClient.invalidateQueries({ queryKey: ["entities"] })
}
```

---
