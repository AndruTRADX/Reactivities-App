# Loading States — Skeletons

**Rule: any page component that fetches data from the API on mount must render a skeleton while that data is loading — never a blank page, never a bare spinner as the only loading state.**

A page that shows nothing (or just a spinner) while its `useQuery` is in flight causes a layout jump the instant data arrives — the user's eyes have nothing to anchor on, and the page visibly "pops" into existence. A skeleton shaped like the real content eliminates both problems: the user sees the page's structure immediately, and nothing shifts when real data replaces the placeholders.

## Where skeletons live

Colocated with the page they belong to, in a `components/` subfolder, named after what they're standing in for:

```plainText
src/features/<feature>/components/SkeletonPage.tsx                  # entity list (EntityListPage)
src/features/<feature>/pages/details/components/SkeletonPage.tsx    # entity details (EntityDetailsPage)
src/features/<feature>/pages/update/components/SkeletonForm.tsx     # edit form (UpdateEntityPage)
```

The naming convention is `Skeleton<Purpose>` — `SkeletonPage` for a page-shaped layout (list or detail view, usually with `Card`s), `SkeletonForm` for a form-shaped layout. Every future paginated or detail page follows this same `components/Skeleton<Purpose>.tsx` placement — colocated with the specific page, not centralized in `shared/`, because a skeleton's shape only makes sense next to the layout it mimics.

## How to build one

Compose the same layout primitives the real page uses (`Card`, `CardHeader`, `CardContent`, the same grid/flex structure), and swap every piece of real content for a `<Skeleton>` (`@sharedUi/skeleton`) sized to roughly match what will render there:

```tsx
// src/features/<feature>/pages/update/components/SkeletonForm.tsx
import { Skeleton } from "@sharedUi/skeleton"
import { Card, CardContent, CardHeader } from "@sharedUi/card"

export function SkeletonForm() {
  return (
    <div className="flex w-full justify-center">
      <Card className="w-full sm:max-w-2xl">
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Skeleton className="h-4 w-1/4 mt-4" />
          <Skeleton className="h-10 w-full" />
          {/* one Skeleton pair per real field */}
        </CardContent>
      </Card>
    </div>
  )
}
```

`Skeleton` itself (`src/shared/components/ui/skeleton.tsx`, a shadcn primitive — see [ui-components.md](./ui-components.md)) is just `animate-pulse rounded-xl bg-muted` — the shimmering placeholder block. Everything else is the surrounding page's own real layout, so the transition from skeleton to real content is a content swap, not a layout change.

## Wiring it into the page

The loading check is the first early return in the component, before any other guard:

```tsx
export default function EntityListPage() {
  const { pagedEntities, isLoadingEntities, errorPagedEntities } = useGetEntities(params)

  if (isLoadingEntities) {
    return <SkeletonPage />
  }

  if (errorPagedEntities) {
    return <ErrorShow error={errorPagedEntities} />
  }
  // ...
}
```

A page that doesn't fetch anything on mount (`HomePage`, `LoginPage`, `CreateEntityPage`) doesn't need a skeleton — this rule only applies when the page's first render depends on a `useQuery` that hasn't resolved yet. If you're adding a page that calls a `useGetX`-style hook, it needs a `Skeleton<Purpose>` component before it ships.

For paginated lists specifically, note that `placeholderData: keepPreviousData` (see [pagination.md](./pagination.md)) keeps the previous page's real content on screen during a page change — the skeleton only covers the *first* load, not subsequent page changes.

## Summary checklist

- [ ] Every page whose first render depends on API data has a colocated `Skeleton<Purpose>` component, rendered before any other early return.
