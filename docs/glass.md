# Glass — Translucent Floating Surfaces

This document is the rulebook for the app's "glass" effect: which surfaces use it, the four-part recipe, and how to pick a blur size. For where colors themselves come from and how dark mode works, see [theming.md](./theming.md).

---

## When to use it

**Rule: any *bounded* surface that floats above other content — a popover, a combobox/select dropdown, a dropdown menu (including submenus), a modal card, the navbar, a toggle/switch — uses the glass recipe below, not a flat opaque background.** Full-bleed scrims that cover an entire screen or image (`DialogOverlay`/`AlertDialogOverlay`, the `ActivityDetailsPage` hero-image scrim) are a different, simpler pattern — see [Full-bleed scrims](#full-bleed-scrims) below — because there's no bounded edge for a glass effect to catch light on.

## The recipe

The glass recipe has four parts, always added together:

1. **Background** — a semantic token (never a literal color, per the [Colors rule](./theming.md#colors-one-source-of-truth)) at partial opacity: `bg-<token>/<opacity>`.
2. **Blur** — `backdrop-blur-<size>`, sized by what's behind the surface, not just its own size (see [Choosing a blur size](#choosing-a-blur-size) below).
3. **Vibrancy** — `backdrop-saturate-150`. Real glass makes blurred content *more* colorful, not washed out; without this the surface just looks like a dimmed panel instead of glass.
4. **Edge + sheen** — `inset-ring-1 inset-ring-glass-highlight/60 dark:inset-ring-glass-highlight/40` (a light-catching inner edge, composed via Tailwind's separate `inset-ring` channel so it doesn't fight the component's own `ring-*`/`shadow-*`) plus the `glass` class (defined once in `@layer components` in `styles.css`), which adds a radial-gradient sheen `::before` using the `--glass-highlight` token.

`.glass` sets `position: relative; isolation: isolate` on the host element and draws its sheen as a `::before` with `border-radius: inherit` — so the host element needs its own rounded-corner class (e.g. `rounded-2xl`) for the sheen to curve correctly; it does not pick up rounding from an ancestor.

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
| Profile about card | `features/profile/components/cards/about/ProfileAboutCard.tsx` | `bg-background/40 backdrop-blur-lg backdrop-saturate-150 inset-ring-1 inset-ring-glass-highlight/60 glass`, over the same `bg-profile-header` gradient as the page header |
| `Button` (`variant="glass-outline"`) | `shared/components/ui/button.tsx` | `border-border bg-input/70 backdrop-blur-sm backdrop-saturate-150 inset-ring-1 inset-ring-glass-highlight/60 dark:inset-ring-glass-highlight/40 glass` |
| `Button` (`variant="glass-secondary"`) | `shared/components/ui/button.tsx` | `bg-secondary/70 backdrop-blur-sm backdrop-saturate-150 inset-ring-1 inset-ring-glass-highlight/60 dark:inset-ring-glass-highlight/40 glass` |
| `Button` (`variant="glass-default"`) | `shared/components/ui/button.tsx` | `bg-primary/70 backdrop-blur-sm backdrop-saturate-150 inset-ring-1 inset-ring-primary/40 glass`, sheen tinted down via `[--glass-highlight:var(--glass-tint-highlight)]` |
| `Button` (`variant="glass-destructive"`) | `shared/components/ui/button.tsx` | `bg-destructive/10 dark:bg-destructive/20 backdrop-blur-sm backdrop-saturate-150 inset-ring-1 inset-ring-destructive/40 glass`, sheen tinted down via `[--glass-highlight:var(--glass-tint-highlight)]` |

**`Button`'s `glass-*` variants are opt-in, not the default.** `default`/`outline`/`secondary`/`ghost`/`destructive` stay solid — a `<Button>` is reused everywhere, mostly sitting on a flat, opaque background (a `Card`, a `Dialog`, a form) with nothing behind it worth blurring, so glass there is invisible at best and, on `ghost` (no background at rest), an always-on blur over whatever sits behind the button with no visible cue it's happening. Only pass a `glass-*` variant when a button is placed on top of something with real texture or color behind it — an image, a gradient — like the photo-overlay trigger in `ProfilePhotosCard` or the edit button in `ProfileAboutCard`. Each `glass-*` variant mirrors its solid counterpart's color and state classes (`glass-secondary` keeps `secondary`'s opaque `aria-expanded` state, `glass-destructive` keeps `destructive`'s exact opacity levels since that variant is already low-opacity by design) with the four recipe parts layered on top — pick whichever tints the button to match the semantic weight of the action (e.g. a destructive action over an image gets `glass-destructive`, not `glass-outline`).

**Saturated variants need a tinted sheen and a color-matched ring, not the neutral defaults.** `--glass-highlight` and the `glass-highlight` ring were tuned against near-white/near-black surfaces (`popover`, `background`, `card` are all at the extremes of the lightness scale), where a white `mix-blend-mode: overlay` sheen barely changes anything. `primary` and `destructive` sit at mid-lightness (~49–58% in light mode) — right where `overlay` blending with white pushes hardest toward pure white, which is the "white shade" the sheen produced on `glass-default`/`glass-destructive`, and the same neutral highlight used for the ring read as a plain white border on a colored button. `glass-secondary` doesn't need this because `--secondary` is itself a near-neutral gray at both ends (barely any chroma), so the same white sheen doesn't wash it out the way it does a saturated hue.

The fix is scoped to just those two variants, not a change to the shared `.glass::before` rule (which would shift the look of every popover/dropdown/dialog/navbar in the app):
- **Ring** — `inset-ring-primary/40` / `inset-ring-destructive/40` instead of `inset-ring-glass-highlight`, so the border picks up the button's own hue.
- **Sheen** — `--glass-tint-highlight` (`styles.css`, `:root`/`.dark` pair, registered in `@theme inline` next to `--glass-highlight`) is a dimmer near-white than `--glass-highlight` (`18%`/`6%` alpha vs. `55%`/`12%`). The variant overrides `--glass-highlight` locally via the Tailwind arbitrary-property class `[--glass-highlight:var(--glass-tint-highlight)]` — CSS custom properties inherit from the element they're set on down to its own `::before`, so this only affects that button's sheen, leaving the global `--glass-highlight` (and every other surface that reads it) untouched.

## Choosing a blur size

Blur size isn't about how big the surface itself is — it's about how much *legibility risk* sits behind it, and whether something else is already absorbing that risk:

- **`sm`** — small surfaces anchored to a specific trigger (`Popover`, `DropdownMenu`, `Combobox`, `Select`, `HoverCard`, `Button`'s `glass-*` variants). What's behind them is a small, already-focused area (a button, an avatar, a field), so a light blur is enough — it stays crisp and lets the vibrancy/sheen do the "glass" work instead of mush.
- **`lg`** — bounded surfaces where something else already separates them from the page. `DialogContent`/`AlertDialogContent` sit on top of the overlay scrim, which already dims and blurs the page behind it — the card's own blur is for glass thickness, not legibility. The profile avatar frame and the profile about card both sit over a fixed, designed gradient (not scrolling content), so it's a taste call, not a contrast one.
- **`xl`** — full-width surfaces over unpredictable, continuously-changing content. `Navbar` is the only one: it's fixed above arbitrary scrolling page content (activity images, gradients, badges) with no scrim to fall back on, so it needs the strongest blur to keep its own text/icons legible against whatever happens to be underneath.

**The `--glass-highlight` token:** defined in `styles.css` (`:root`/`.dark`, registered in `@theme inline` like any other color per the [Colors rule](./theming.md#colors-one-source-of-truth)). Unlike `primary`/`destructive`, it isn't content-semantic — it represents a simulated light reflection, so it stays a near-white translucency in both themes (bright and more opaque in light mode, dim and more subtle in dark mode) rather than inverting.

**When adding a new floating component — including a `Switch`/`Toggle` if one gets added later:** apply all four parts of the recipe above, picking the background token from the table and the blur size per [Choosing a blur size](#choosing-a-blur-size) depending on how similar the new component is to an existing one.

## Full-bleed scrims

A small number of surfaces use `backdrop-blur` without the rest of the glass recipe, because they cover an entire screen or image rather than floating as a bounded panel: `DialogOverlay`/`AlertDialogOverlay` (`bg-black/30 supports-backdrop-filter:backdrop-blur-xs`) and the `ActivityDetailsPage` hero-image scrim (`bg-black/35 backdrop-blur-xs`). These stay as plain blur — no `backdrop-saturate-150`, `inset-ring`, or `glass` sheen — since there's no edge for a glass effect to read against.

## Summary checklist

- [ ] Every bounded floating surface (popover, dropdown, combobox/select, modal card, navbar) uses the full glass recipe — translucent background + `backdrop-blur` + `backdrop-saturate-150` + `inset-ring-glass-highlight` + `glass` — matching the table above.
- [ ] Full-bleed scrims (dialog overlays, hero-image scrims) stay plain blur, no glass recipe.
- [ ] The host element carries its own rounded-corner class — the `.glass::before` sheen inherits radius from the host, not an ancestor.
