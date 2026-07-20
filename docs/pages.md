# Pages — Creating and Organizing

This document covers three things that always go together: how a page component must be named, how a feature's folder is organized around its pages (a "screaming" architecture), and how a page gets wired into the router.

---

## Naming rule: every page is `<Name>Page.tsx`

**Every page component file ends in `Page.tsx`, PascalCase, default-exported.**

```tsx
export default function CreateEntityPage() {
  return (/* ... */)
}
```

The `<Name>` prefix names what the page shows: the feature/entity it belongs to (`EntityPage`), optionally combined with the action it performs (`CreateEntityPage`, `UpdateEntityPage`) or the view it renders (`EntityDetailsPage`). There's no fixed word order — pick whichever reads best — but the `Page` suffix is never optional and never abbreviated. This is what lets anyone scan a feature folder or an import list and immediately tell pages (routable, full-view components) apart from everything else (cards, forms, dialogs) at a glance.

---

## Feature folder structure ("screaming architecture")

`src/features/<feature>/` is organized so the top-level folder names scream what the app *does* (its business features) rather than what technical layer the code belongs to. Nothing at `src/` level is grouped by type across the whole app (no app-wide `pages/`, `components/`, `hooks/`) — each feature owns its own `components/`, `forms/`, `hooks/`, `schemas/`, and pages, all inside its own folder. Only code that's genuinely cross-cutting — reused by more than one feature — earns a place in `src/shared/`.

The canonical shape of one feature:

```plainText
src/features/<feature>/
  EntityPage.tsx              # the feature's primary page — lives at the feature root
  components/                 # feature-specific components (cards, feature-scoped dialogs, ...)
  forms/                      # feature-specific React Hook Form forms — see forms.md
  hooks/
    api/                      # useQuery/useMutation hooks — see api-hooks.md
  schemas/
    request/
    response/
    enums/
  pages/                      # additional pages beyond the primary one — see below
```

Not every folder is mandatory — a feature with no extra forms simply has no `forms/` folder. Only create the subfolders a feature actually needs; don't scaffold empty ones "for later."

---

## `pages/` — additional pages inside a feature

A feature that needs more than one page — a primary list/landing view plus, say, create/details/update views for its entity — keeps exactly **one** page at the feature root: the primary one, `EntityPage.tsx`. Every other page lives under `pages/<action>/`, one subfolder per page.

Each `pages/<action>/` folder follows the *exact same organizing principle* as the feature root — it's allowed its own `components/` (and, if it ever needs one, its own `forms/`) — just scoped down to that single page instead of the whole feature. Anything used only by that one page belongs inside its own `pages/<action>/` folder, not in the feature-level `components/`, which is for things shared across the feature's pages.

```plainText
src/features/<feature>/pages/
  create/
    CreateEntityPage.tsx
  details/
    EntityDetailsPage.tsx
    components/
      SkeletonPage.tsx           # scoped to this page only — see loading-states.md
  update/
    UpdateEntityPage.tsx
    components/
      SkeletonForm.tsx           # scoped to this page only — see loading-states.md
```

A feature that only ever has one page (a simple standalone view) never gets a `pages/` folder at all — it's introduced the moment a *second* page is needed, not preemptively.

---

## Wiring a page into the router — `src/app/router/Route.tsx`

Every route lives in one place: `src/app/router/Route.tsx`, a single `createBrowserRouter([...])` call. The root route renders the app layout (`<App />`); everything else is a `children` entry:

```tsx
export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "", element: <HomePage /> },
      // public routes go here
      {
        element: <RequireAuth />,
        children: [
          // routes that require a logged-in user go here
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
])
```

To register a new page:

1. Import it at the top — a plain default import, matching the filename (`import CreateEntityPage from "@/features/<feature>/pages/create/CreateEntityPage"`).
2. Add a `{ path: "...", element: <CreateEntityPage /> }` entry to the right `children` array:
   - **Public** (no login required) — top-level `children`, alongside `HomePage`/`LoginPage`.
   - **Protected** (login required) — inside the `RequireAuth` block's `children` — see [Route guards](#route-guards--requireauth) below.
3. Path segments are kebab-case (`create-entity`, `update-entity/:id`) and a detail/update route takes an `:id` param matched by `useParams()` in the page.

### Route guards — `RequireAuth`

`RequireAuth` (`src/app/router/RequireAuth.tsx`) is a layout route, not a page — it renders no content of its own. It's a gatekeeper that wraps a group of routes and decides whether to let them render at all:

```tsx
export default function RequireAuth() {
  const { user, isLoadingUser } = useGetCurrentUser()
  const location = useLocation()

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
```

It's not applied per-page — it's one route entry that owns a `children` array, and every protected route is nested inside that one array (see the `Route.tsx` shape above). Adding a new protected page means adding its entry to *that* `children` array, not wrapping the page component itself in anything.

**The three states, in order:**

1. **`isLoadingUser` is true** → render a full-screen `<Spinner />`, not a redirect and not the protected content. On first load, `user` is `undefined` whether or not the session cookie is actually valid, simply because the request to fetch it hasn't resolved yet. Skipping this branch and checking only `!user` would flash a redirect to `/login` on every page refresh, even for an already-logged-in user, before snapping back once the query resolves.
2. **Not loading, no `user`** → `<Navigate to="/login" replace state={{ from: location }} />`.
   - `replace` swaps the current history entry instead of pushing a new one, so the browser's back button from `/login` doesn't bounce straight back into the redirect.
   - `state={{ from: location }}` is what makes "log in and land back where you were going" work — `LoginForm` reads `location.state?.from` after a successful login and navigates there instead of the default landing page.
3. **Not loading, `user` exists** → `<Outlet />`, rendering whichever protected child route actually matched.

**When to use it:** any route that either should be invisible/inaccessible to an anonymous visitor, or assumes `useGetCurrentUser()`'s `user` is non-null somewhere downstream (mutations tied to the current user, user-specific data rendering, etc.).

**When *not* to use it:**

- **A public landing/marketing page** (`HomePage`) — the whole point is to be visible to visitors who aren't logged in yet.
- **The login/register pages themselves** — putting these inside `RequireAuth` creates an infinite redirect loop: an anonymous visitor hits `/login` → `RequireAuth` sees no user → redirects to `/login` → repeat.
- **Error pages** (`NotFoundPage`, `ServerErrorPage`, the `*` catch-all) — these must stay reachable regardless of auth state. `agent.ts`'s error interceptor navigates to `/not-found`/`/server-error` directly on 404/500, and that has to work whether or not the user is logged in — gating these behind auth would break error handling itself.

---

## Step-by-step: adding a new page

1. **Decide where it belongs.** Is this the feature's first/primary page, or an additional one alongside an existing primary page? Primary → `src/features/<feature>/EntityPage.tsx`. Additional → `src/features/<feature>/pages/<action>/<Name>Page.tsx`.
2. **Write the component** — default export, named to match the file exactly.
3. **If it fetches data on mount**, add a colocated `Skeleton<Purpose>` component in that page's `components/` folder and wire it as the first early return — see [loading-states.md](./loading-states.md) for the full rule.
4. **If it's a form page**, reuse `FormWrapper` (`src/shared/components/common/FormWrapper.tsx`) for the centered single-card layout and a form component from the feature's `forms/` folder for the fields — see [forms.md](./forms.md) for building the form itself.
5. **Register the route** in `src/app/router/Route.tsx` — import the page, add it to the correct `children` array (public vs. behind `RequireAuth`) as described above.
6. **Link to it** — add a `<Link to="...">` (or `navigate(...)`) wherever a user should be able to reach the new page. A page with no route linking to it is unreachable but won't fail any build or type check, so this step is easy to forget.
