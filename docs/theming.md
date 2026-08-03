# Theming — Colors and Dark Mode

This document is the rulebook for anything color-related in the app: where colors come from and how dark mode works. Each rule below is already how the codebase behaves today — this document makes it explicit so it stays that way.

For component primitives (shadcn) and loading-state skeletons, see [ui-components.md](./ui-components.md) and [loading-states.md](./loading-states.md). For translucent floating surfaces (popovers, dropdowns, modals, the navbar), see [glass.md](./glass.md).

---

## Colors: one source of truth

**Rule: never use a color that doesn't come directly from `src/app/layout/styles.css`. No hex codes, no `bg-blue-500`/`text-red-600`-style Tailwind palette classes, no inline `style={{ color: ... }}`. Ever.**

Every color in the app is a CSS custom property defined in `styles.css`, in two places:

```css
/* src/app/layout/styles.css */
:root {
  --primary: oklch(49.1% 0.27 292.581);
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --positive: oklch(62.7% 0.194 149.214);
  --warning: oklch(66.6% 0.179 58.318);
  /* ...border, input, ring, card, popover, accent, secondary, sidebar, chart-1..5 */
}
```

`@theme inline` then maps each variable to a Tailwind color utility:

```css
@theme inline {
  --color-primary: var(--primary);
  --color-background: var(--background);
  --color-muted-foreground: var(--muted-foreground);
  /* ... */
}
```

That mapping is what makes `bg-primary`, `text-muted-foreground`, `border-border`, `bg-destructive/10`, etc. work as Tailwind classes anywhere in the app. **A color class you can type only exists if it's registered here first.** If you need a color Tailwind doesn't already expose through this file, it doesn't exist yet — you add it to `styles.css`, not around it.

This rule is already fully followed: there isn't a single hardcoded hex value or Tailwind palette color (`bg-red-500`, `text-blue-600`, etc.) anywhere in `src/`. Every component reads a semantic token — `primary`, `destructive`, `muted-foreground` — never a literal color. Keep it that way.

### Why semantic tokens, not literal colors

- **One edit changes the whole app.** Rebranding the primary color means changing `--primary` in one file. If components used `bg-[#6d28d9]` directly, you'd hunt through every file that happened to need "the brand color."
- **Dark mode is free.** A component that says `bg-card text-card-foreground` never needs to know what mode is active — see below.
- **Semantic names document intent.** `bg-destructive` tells you *why* a color was chosen (this is a dangerous action) in a way `bg-red-600` never can — the literal class doesn't say whether red was chosen for danger, for a brand mark, or by accident.

### Adding a new color

**Rule: every new color needs a light value in `:root` and a dark value in `.dark`, defined together, in the same change.** A color added to only one of the two doesn't have a "no theme" escape hatch — Tailwind will resolve it in dark mode to whatever `:root` says (or vice versa), which is very likely wrong, and nobody will notice until someone opens the app in the other mode.

```css
:root {
  --info: oklch(0.6 0.15 240);       /* pick the light-mode value */
}
.dark {
  --info: oklch(0.75 0.18 240);      /* pick the dark-mode value in the same PR */
}
@theme inline {
  --color-info: var(--info);          /* register it so `bg-info`/`text-info` exist */
}
```

Only after all three edits does `bg-info`/`text-info`/`border-info` become usable Tailwind classes anywhere in the app.

---

## Dark mode

### What it is

Dark mode is driven by a single class, `.dark`, applied to an ancestor element (normally `<html>`). `styles.css` declares:

```css
@custom-variant dark (&:is(.dark *));
```

This tells Tailwind: "the `dark:` variant, and every color token resolved through `@theme inline`, applies to anything inside an element carrying the `.dark` class." Because every component already reads semantic tokens (`bg-card`, never `bg-white`), **no component needs a `dark:` class of its own** for color — the token itself resolves to a different OKLCH value depending on whether `.dark` is present:

```css
:root { --card: oklch(1 0 0); }        /* light: white card */
.dark { --card: oklch(0.205 0 0); }    /* dark: near-black card */
```

`<Card>` never changes; the variable it points at does.

### How to activate it

`src/app/layout/ThemeProvider.tsx` is a hand-rolled context (following [shadcn's Vite dark-mode guide](https://ui.shadcn.com/docs/dark-mode/vite) — **not** `next-themes`, even though that package is still a dependency; it's unused apart from `src/shared/components/ui/sonner.tsx`'s toast-theme sync, which isn't currently mounted anywhere). It reads/writes `localStorage`, applies `"light"` or `"dark"` to `document.documentElement`, and resolves `"system"` via `window.matchMedia("(prefers-color-scheme: dark)")`:

```tsx
// src/app/layout/App.tsx
<ThemeProvider defaultTheme="system" storageKey="reactivities-ui-theme">
  <div>
    <Navbar />
    {/* ... */}
  </div>
</ThemeProvider>
```

The theme lives at this level (wrapping `App`'s own returned tree) rather than in `main.tsx`, because `main.tsx` renders `<RouterProvider>`, not `<App>` directly — `App` is what the router mounts as the layout route's element, and it's also where `Navbar` (the thing that needs `useTheme()`) renders.

The toggle itself is a `DropdownMenu` in `Navbar.tsx` (Light / Dark / System, per the linked guide), calling `setTheme` from the same file:

```tsx
import { useTheme } from "@/app/layout/ThemeProvider"

const { setTheme } = useTheme()
// ...
<DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
<DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
<DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
```

No other component needs to change — the whole point of the token system above is that flipping `.dark` on `<html>` is enough; every component already reads the semantic tokens that respond to it.

---

## Scrollbars

Scrollbar color is themed globally in `styles.css`'s `@layer base`, using `--border` (thumb) and `--muted-foreground` (thumb hover) — both via `scrollbar-color`/`scrollbar-width` (Firefox, current Chromium/Safari) and `::-webkit-scrollbar-*` (older WebKit). No component needs its own scrollbar styling or a `dark:` variant — same reasoning as [Dark mode](#dark-mode): the thumb color is a token, so it already resolves correctly per theme.

**Rule: never hardcode a scrollbar color** (`scrollbar-color: #ccc transparent` or similar) — always reference a token from this file, per the [Colors](#colors-one-source-of-truth) rule above.

To hide a scrollbar entirely on a specific scroll container (e.g. a dropdown list where the scroll affordance isn't wanted), use the `.no-scrollbar` class (`@layer components` in `styles.css`) — already applied to `ComboboxList` and `CommandList`.

---

## Summary checklist

- [ ] Every color is a class that resolves through `styles.css` — no hex, no Tailwind palette colors, no inline styles.
- [ ] Every new color gets both a `:root` and a `.dark` value, plus a `@theme inline` registration, in the same change.
- [ ] Any new translucent floating surface follows the glass recipe in [glass.md](./glass.md), not this doc.
