# Confirm Dialog

This document covers the app-wide confirmation dialog: why it's a single global instance instead of a per-component `AlertDialog`, how the three pieces fit together, and how to use it.

---

## Why one global dialog instead of one per component

Confirming a destructive or significant action (delete, leave, cancel, ...) needs an `AlertDialog`, some open/close state, and a way to run a callback on confirm. Doing that per component means re-declaring `isOpen` state and JSX in every place that needs a confirmation — repeated boilerplate, and a chance for the copy/buttons to drift from one usage to the next.

Instead, this app renders **one** `<ConfirmDialog />` (mounted once, in `App.tsx`) and drives it from anywhere via a Zustand store. Any component calls `useConfirmDialog()` and gets back functions that open that single dialog with whatever copy/variant/callback it needs — no local state, no JSX to write at the call site.

---

## The three pieces

### 1. `confirmDialogStore` — `src/shared/stores/confirmDialogStore.ts`

Holds the dialog's `isOpen`/`options` state and a pending `resolve` for the promise returned to the caller. `confirm(options)`:

1. Sets `isOpen: true` with the given `options` (filling in defaults for `cancelText`/`confirmVariant`).
2. Returns a `Promise<boolean>` that stays pending until the user responds.
3. `handleConfirm`/`handleCancel` (called by the rendered dialog) run the matching `options.onConfirm`/`onCancel` callback, resolve the promise (`true`/`false`), then close the dialog.

`ConfirmOptions` is the shape every caller fills in — hover any of its fields in your editor for what it does:

```ts
export interface ConfirmOptions {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void | Promise<void>
}
```

### 2. `<ConfirmDialog />` — `src/shared/components/ConfirmDialog.tsx`

A dumb component wrapping shadcn's `AlertDialog`. Reads `isOpen`/`options` off the store and wires `handleConfirm`/`handleCancel` to the two buttons. Mounted exactly once, at the app root (`src/app/layout/App.tsx`) — it doesn't need to exist anywhere near the component that triggers it, the same way a single `<Toaster />` backs every `toast.success(...)` call.

### 3. `useConfirmDialog` — `src/shared/hooks/useConfirmDialog.ts`

The hook features actually call. Returns four functions — hover any of them at a call site for what they do:

```ts
const { confirm, confirmDelete, confirmUpdate, confirmCreate } = useConfirmDialog()
```

- **`confirm(options)`** — full control over copy and variant.
- **`confirmDelete` / `confirmUpdate` / `confirmCreate`** — `confirm` preset with this app's standard title/description/button-text/variant for that action (e.g. `confirmDelete` defaults to a destructive "Delete" button and "cannot be undone" copy). Each takes the same `options` shape minus `confirmVariant` (which the preset owns) — pass `title`/`description`/etc. to override the defaults for a specific case.

Prefer a `confirm<Verb>` preset whenever the action fits delete/update/create — it keeps copy and button color consistent across the app. Reach for the bare `confirm` when the action doesn't fit those three (e.g. "join", "leave" — see [Usage](#usage) below).

---

## Usage

### Reacting via `onConfirm` (preferred)

Put the actual side effect in `onConfirm`. It runs before the dialog closes and before the returned promise resolves — this is how every current call site in the app does it:

```ts
const handleLeave = useCallback(() => {
  if (!entity) return

  confirm({
    title: "Leave entity",
    description: "Are you sure you want to leave?",
    confirmText: "Leave",
    confirmVariant: "destructive",
    onConfirm: async () => {
      await leaveEntityAsync(
        { id: entity.id },
        { onSuccess: () => toast.success("You've left the entity") }
      )
    },
  })
}, [entity, confirm, leaveEntityAsync])
```

Note the call is not awaited — `onConfirm` owns the async work, so the calling component doesn't need to.

### Reacting via the returned promise

`confirm`/`confirm<Verb>` also resolve `true`/`false`, for the rarer case where the caller needs the boolean itself rather than firing a side effect:

```ts
const shouldProceed = await confirmDelete({ title: "Delete entity" })
if (!shouldProceed) return
```

Don't mix both patterns for the same call — pick `onConfirm` for the side effect, or `await` the boolean, not both.

---

## Gotchas

- **Don't render a second `<ConfirmDialog />`.** There is exactly one, in `App.tsx`. A feature that needs a confirmation calls `useConfirmDialog()` — it never mounts its own dialog.
- **`confirmVariant` is owned by the preset on `confirm<Verb>`.** That's why `Omit<ConfirmOptions, "confirmVariant">` is the parameter type — passing a variant to `confirmDelete` wouldn't type-check. If a case needs a non-default variant with delete/update/create-style copy, use the bare `confirm` instead and set every field yourself.
- **Only one confirmation can be open at a time.** The store holds a single `isOpen`/`options`/`resolve` — calling `confirm` again before the first one resolves replaces the pending dialog rather than stacking a second one.
