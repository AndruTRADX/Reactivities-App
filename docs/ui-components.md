# UI Components — Using shadcn

This document is the rulebook for where UI primitives come from and where new shared components should live. For color tokens, dark mode, and floating-surface styling, see [theming.md](./theming.md). For skeleton loading states, see [loading-states.md](./loading-states.md).

---

## Never reinvent the wheel — always shadcn

**Rule: every UI primitive comes from shadcn. No hand-rolled `<button>`, `<select>`, `<dialog>`, dropdown, tooltip, etc. If shadcn has a component for it, use it — don't build a custom version.**

Every single interactive primitive in this app — `Button`, `Card`, `Dialog`, `AlertDialog`, `Select`, `Combobox`, `DropdownMenu`, `Popover`, `HoverCard`, `RadioGroup`, `Checkbox`, `Calendar`, `Table`, `Pagination`, `Skeleton`, `Spinner`, `Badge`, `Avatar` — lives in `src/shared/components/ui/` and was installed via the shadcn CLI, not written from scratch.

### Why

1. **Theming for free.** Every shadcn component already reads the same semantic tokens from `styles.css` (`bg-popover`, `text-foreground`, `ring-ring/50`, etc.). A hand-rolled component would need to be wired into that system manually, and it's easy to get subtly wrong (see [theming.md](./theming.md)).
2. **Accessibility for free.** shadcn components wrap Radix/Base UI primitives, which already handle focus trapping, keyboard navigation, `aria-*` attributes, and portal/positioning logic correctly. Reimplementing a dropdown or dialog from scratch means reimplementing all of that too — and it's very easy to ship something that looks right but is unusable with a keyboard or screen reader.
3. **Less code, one place to fix things.** If a bug or design change is needed, it's fixed once in `src/shared/components/ui/`, not in N different hand-rolled variants scattered across features.
4. **Consistency.** A user should never be able to tell that one dropdown in the app was built differently from another.

### How to add one that doesn't exist yet

```powershell
pnpm dlx shadcn@latest add <component>
```

Every existing primitive lives in `src/shared/components/ui/` and is imported via the `@sharedUi/*` alias (`vite.config.ts`/`tsconfig.app.json`), even though `components.json`'s `"ui"` alias literally points elsewhere. The CLI sometimes drops the generated file(s) in the wrong place (and can regenerate a component you already have, like `button.tsx`, as a near-duplicate) — when that happens, move the new file into `src/shared/components/ui/`, delete the duplicate, and fix its internal `cn` import to `@/shared/lib/utils` to match every other file in that folder. This is exactly what happened when the `pagination` component was added (see [pagination.md](./pagination.md)).

---

## Where a new component belongs: `forms/` vs `common/` vs `ui/`

Once a primitive exists in `src/shared/components/ui/`, most features don't use it directly — it gets wrapped one layer up, and which layer depends on whether the control is bound to a form:

- **A field inside a `react-hook-form` form** — wrap the shadcn primitive as a shared form component in `src/shared/components/forms/`, following the `useController` pattern (see [forms.md](./forms.md)). This is what `SelectInput` is: a `Select`/`Combobox` primitive bound to RHF via `control`/`name`.
- **A standalone controlled control that isn't part of a form** — a URL-driven filter, for example — belongs in `src/shared/components/common/` instead. It's a plain `value`/`onValueChange` component with no `control`/`name` pair. This is what `ComboboxSelect` is: it reuses the same underlying `Combobox` primitive as `SelectInput`, just without the RHF/`Field` wrapper. See it in action driving list sorting in [pagination.md](./pagination.md#sorting).

Both wrap the same `ui/` primitive; the difference is purely whether the value is owned by an RHF form (`forms/`) or by something else — URL state, a Zustand store, local state (`common/`).
