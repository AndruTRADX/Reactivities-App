# Theming — Colors, Dark Mode, and Floating Surfaces

This document is the rulebook for anything color-related in the app: where colors come from, how dark mode works, and how floating surfaces use translucency. Each rule below is already how the codebase behaves today — this document makes it explicit so it stays that way.

For component primitives (shadcn) and loading-state skeletons, see [ui-components.md](./ui-components.md) and [loading-states.md](./loading-states.md).

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

## Glass — translucent floating surfaces

**Rule: any *bounded* surface that floats above other content — a popover, a combobox/select dropdown, a dropdown menu (including submenus), a modal card, the navbar, a toggle/switch — uses the glass recipe below, not a flat opaque background.** Full-bleed scrims that cover an entire screen or image (`DialogOverlay`/`AlertDialogOverlay`, the `ActivityDetailsPage` hero-image scrim) are a different, simpler pattern — see [Full-bleed scrims](#full-bleed-scrims) below — because there's no bounded edge for a glass effect to catch light on.

The glass recipe has four parts, always added together:

1. **Background** — a semantic token (never a literal color, per the rule above) at partial opacity: `bg-<token>/<opacity>`.
2. **Blur** — `backdrop-blur-<size>`, sized by what's behind the surface, not just its own size (see [Choosing a blur size](#choosing-a-blur-size) below).
3. **Vibrancy** — `backdrop-saturate-150`. Real glass makes blurred content *more* colorful, not washed out; without this the surface just looks like a dimmed panel instead of glass.
4. **Edge + sheen** — `inset-ring-1 inset-ring-glass-highlight/60 dark:inset-ring-glass-highlight/40` (a light-catching inner edge, composed via Tailwind's separate `inset-ring` channel so it doesn't fight the component's own `ring-*`/`shadow-*`) plus the `glass` class (defined once in `@layer components` in `styles.css`), which adds a radial-gradient sheen `::before` using the `--glass-highlight` token.

This is already the pattern for every bounded floating surface in `src/shared/components/ui/`:

| Component | Where | Classes |
|---|---|---|
| `PopoverContent` | `popover.tsx` | `bg-popover/25 backdrop-blur-sm backdrop-saturate-150 inset-ring-1 inset-ring-glass-highlight/60 glass` |
| `DropdownMenuContent` / `DropdownMenuSubContent` | `dropdown-menu.tsx` | same as above |
| `ComboboxContent` | `combobox.tsx` | same as above |
| `SelectContent` | `select.tsx` | same as above |
| `HoverCardContent` (profile card) | `hover-card.tsx` / `shared/components/common/ProfileCard.tsx` | same as above |
| `DialogContent` / `AlertDialogContent` | `dialog.tsx` / `alert-dialog.tsx` | `bg-popover/70 dark:bg-popover/30 backdrop-blur-lg backdrop-saturate-150 inset-ring-1 inset-ring-glass-highlight/60 glass` |
| `Navbar` | `shared/components/Navbar.tsx` | `bg-primary-foreground/35 backdrop-blur-xl backdrop-saturate-150 inset-ring-1 inset-ring-glass-highlight/60 glass` |
| Profile avatar frame | `ProfileHeader.tsx` / `SkeletonPage.tsx` | `bg-background/40 backdrop-blur-lg backdrop-saturate-150 inset-ring-1 inset-ring-glass-highlight/60 glass` |

### Choosing a blur size

Blur size isn't about how big the surface itself is — it's about how much *legibility risk* sits behind it, and whether something else is already absorbing that risk:

- **`sm`** — small surfaces anchored to a specific trigger (`Popover`, `DropdownMenu`, `Combobox`, `Select`, `HoverCard`). What's behind them is a small, already-focused area (a button, an avatar, a field), so a light blur is enough — it stays crisp and lets the vibrancy/sheen do the "glass" work instead of mush.
- **`lg`** — bounded surfaces where something else already separates them from the page. `DialogContent`/`AlertDialogContent` sit on top of the overlay scrim, which already dims and blurs the page behind it — the card's own blur is for glass thickness, not legibility. The profile avatar frame sits over a fixed, designed gradient (not scrolling content), so it's a taste call, not a contrast one.
- **`xl`** — full-width surfaces over unpredictable, continuously-changing content. `Navbar` is the only one: it's fixed above arbitrary scrolling page content (activity images, gradients, badges) with no scrim to fall back on, so it needs the strongest blur to keep its own text/icons legible against whatever happens to be underneath.

**The `--glass-highlight` token:** defined in `styles.css` (`:root`/`.dark`, registered in `@theme inline` like any other color per the rule above). Unlike `primary`/`destructive`, it isn't content-semantic — it represents a simulated light reflection, so it stays a near-white translucency in both themes (bright and more opaque in light mode, dim and more subtle in dark mode) rather than inverting.

**When adding a new floating component — including a `Switch`/`Toggle` if one gets added later:** apply all four parts of the recipe above, picking the background token from the table and the blur size per [Choosing a blur size](#choosing-a-blur-size) depending on how similar the new component is to an existing one.

### Full-bleed scrims

A small number of surfaces use `backdrop-blur` without the rest of the glass recipe, because they cover an entire screen or image rather than floating as a bounded panel: `DialogOverlay`/`AlertDialogOverlay` (`bg-black/30 supports-backdrop-filter:backdrop-blur-xs`) and the `ActivityDetailsPage` hero-image scrim (`bg-black/35 backdrop-blur-xs`). These stay as plain blur — no `backdrop-saturate-150`, `inset-ring`, or `glass` sheen — since there's no edge for a glass effect to read against.

---

## Scrollbars

Scrollbar color is themed globally in `styles.css`'s `@layer base`, using `--border` (thumb) and `--muted-foreground` (thumb hover) — both via `scrollbar-color`/`scrollbar-width` (Firefox, current Chromium/Safari) and `::-webkit-scrollbar-*` (older WebKit). No component needs its own scrollbar styling or a `dark:` variant — same reasoning as [Dark mode](#dark-mode): the thumb color is a token, so it already resolves correctly per theme.

**Rule: never hardcode a scrollbar color** (`scrollbar-color: #ccc transparent` or similar) — always reference a token from this file, per the [Colors](#colors-one-source-of-truth) rule above.

To hide a scrollbar entirely on a specific scroll container (e.g. a dropdown list where the scroll affordance isn't wanted), use the `.no-scrollbar` class (`@layer components` in `styles.css`) — already applied to `ComboboxList` and `CommandList`.

---

## Summary checklist

- [ ] Every color is a class that resolves through `styles.css` — no hex, no Tailwind palette colors, no inline styles.
- [ ] Every new color gets both a `:root` and a `.dark` value, plus a `@theme inline` registration, in the same change.
- [ ] Every bounded floating surface (popover, dropdown, combobox/select, modal card, navbar) uses the full glass recipe — translucent background + `backdrop-blur` + `backdrop-saturate-150` + `inset-ring-glass-highlight` + `glass` — matching the table above. Full-bleed scrims (dialog overlays, hero-image scrims) stay plain blur, no glass recipe.
