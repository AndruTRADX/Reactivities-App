# Glass — Translucent Floating Surfaces

This document is the rulebook for the app's "glass" effect: which surfaces use it, how it's implemented, and what to do when adding a new one. For where colors themselves come from and how dark mode works, see [theming.md](./theming.md).

---

## When to use it

**Rule: any *bounded* surface that floats above other content — a popover, a combobox/select dropdown, a dropdown menu (including submenus), a modal card, the navbar, a toggle/switch — uses the glass treatment below, not a flat opaque background.** Full-bleed scrims that cover an entire screen or image (`DialogOverlay`/`AlertDialogOverlay`, the `ActivityDetailsPage` hero-image scrim) are a different, simpler pattern — see [Full-bleed scrims](#full-bleed-scrims) below — because there's no bounded edge for a glass effect to catch light on.

## How it works

The effect is a real optical distortion, not a CSS approximation: `useLiquidGlass` (`src/shared/hooks/useLiquidGlass.ts`) generates an SVG `feDisplacementMap` filter shaped to the surface's own size and border-radius, and applies it through `backdrop-filter` — so it warps whatever is visible *behind* the surface, exactly like real glass bending light, while the surface's own content (text, icons, children) stays perfectly sharp. `backdrop-filter` only ever samples the backdrop, never the element's own painted content, so this is guaranteed by construction — no extra care is needed to keep menu text or button icons crisp.

The math (`src/shared/lib/liquidGlass.ts`, `buildDisplacementMap`/`buildDisplacementFilter`) and the composed filter chain are a TypeScript port of [srdavo/liquid-glass](https://github.com/srdavo/liquid-glass).

**Using it on a component:**

```tsx
const { ref, style } = useLiquidGlass<HTMLDivElement>()

return <div ref={ref} style={style} className="rounded-2xl bg-popover/25 ..." />
```

- `ref` is a **callback ref** (required, not swappable for a plain object ref) — Radix's Presence-wrapped content (Popover, DropdownMenu, Select, Combobox, HoverCard, Dialog, AlertDialog) attaches/detaches its ref multiple times during its own open choreography, and a callback ref is what lets the hook always end up measuring the real, final node instead of possibly latching onto a transient `null`. Goes on the actual DOM node that should distort its backdrop.
- `style` carries the computed `backdropFilter` (and a small inset `box-shadow` light-catching edge, using the `--glass-highlight` token) — spread it directly onto that same node.
- Radius, width, and height are auto-detected from the live element (`ResizeObserver` + computed `border-radius`), so a caller never duplicates its own Tailwind rounding class as a JS number — just give the element a `rounded-*` class as usual.
- On browsers without reliable SVG-filter support in `backdrop-filter` (non-Chromium), the hook automatically falls back to a plain `blur()` — no distortion, no chromatic aberration, but still a translucent, legible surface.
- Pass `{ enabled: false }` to skip the effect entirely (e.g. `Button`'s non-`glass-*` variants call the hook unconditionally per the Rules of Hooks, but disable it for solid variants).
- Pass `{ preset: "compact" }` for small/dense surfaces — see [Presets](#presets) below. Defaults to `"large"`.

## Presets

`LIQUID_GLASS_PRESETS` (`src/shared/lib/liquidGlass.ts`) has two entries, `large` (the default) and `compact`. They're identical except `blur`: `compact` is softer-focused than `large`. Everything else — `depth`/`strength`/`chromaticAberration`/`brightness`/`saturate` — stays the same between them, so the *character* of the distortion doesn't change, only how soft the surface reads at a glance. `compact` exists because the distortion alone reads as too subtle on small, dense surfaces at the shared `large` blur amount.

- **`large`** (default, no option needed) — big, low-frequency surfaces: `Navbar`, `DialogContent`/`AlertDialogContent`, the profile avatar frame.
- **`compact`** (`{ preset: "compact" }`) — small or content-dense surfaces: `PopoverContent`, `SelectContent`, `ComboboxContent`, `DropdownMenuContent`/`DropdownMenuSubContent`, `HoverCardContent`, and all four `glass-*` `Button` variants.

**The `bg-<token>/<opacity>` background is still required** — the hook only supplies the distortion/blur, not the tint. Pick the background token from the table below; it's the surface's actual glass color, independent of the distortion mechanism.

This is the pattern for every bounded floating surface in `src/shared/components/ui/`:

| Component | Where | Background token |
|---|---|---|
| `PopoverContent` | `popover.tsx` | `bg-popover/25` |
| `DropdownMenuContent` / `DropdownMenuSubContent` | `dropdown-menu.tsx` | `bg-popover/25` |
| `ComboboxContent` | `combobox.tsx` | `bg-popover/25` |
| `SelectContent` | `select.tsx` | `bg-popover/25` |
| `HoverCardContent` (profile card) | `hover-card.tsx` / `shared/components/common/ProfileCard.tsx` | `bg-popover/25` |
| `DialogContent` / `AlertDialogContent` | `dialog.tsx` / `alert-dialog.tsx` | `bg-popover/70 dark:bg-popover/30` |
| `Navbar` | `shared/components/Navbar.tsx` | `bg-primary-foreground/35` |
| Profile avatar frame | `ProfileHeader.tsx` / `SkeletonPage.tsx` | `bg-background/40` |
| `Button` (`variant="glass-outline"`) | `shared/components/ui/button.tsx` | `bg-input/70` |
| `Button` (`variant="glass-default"`) | `shared/components/ui/button.tsx` | `bg-primary/70` |
| `Button` (`variant="glass-secondary"`) | `shared/components/ui/button.tsx` | `bg-secondary/70` |
| `Button` (`variant="glass-destructive"`) | `shared/components/ui/button.tsx` | `bg-destructive/10 dark:bg-destructive/20` |

**`Button`'s `glass-*` variants are opt-in, not the default.** `default`/`outline`/`secondary`/`ghost`/`destructive` stay solid — a `<Button>` is reused everywhere, mostly sitting on a flat, opaque background (a `Card`, a `Dialog`, a form) with nothing behind it worth distorting, so glass there is invisible at best. Only pass a `glass-*` variant when a button is placed on top of something with real texture or color behind it — an image, a gradient — like the photo-overlay trigger in `ProfilePhotosCard` or the join/leave/manage buttons in `ActivityHeroSection`. `Button` calls `useLiquidGlass` internally keyed off the variant name, so consumers never call the hook themselves — just pick the right `glass-*` variant.

**The `--glass-highlight` token** (`styles.css`, `:root`/`.dark`, per the [Colors rule](./theming.md#colors-one-source-of-truth)) is the one piece of the old recipe still in use: it colors the hook's inset box-shadow (the light-catching edge). Unlike `primary`/`destructive`, it isn't content-semantic — it represents a simulated light reflection, so it stays a near-white translucency in both themes rather than inverting.

**When adding a new floating component — including a `Switch`/`Toggle` if one gets added later:** call `useLiquidGlass`, attach `ref`/`style`, add a `rounded-*` class and a background token per the table above, and pick whichever preset the closest existing surface in that table uses — don't invent a third preset without a concrete visual reason the two existing ones don't cover.

## Full-bleed scrims

A small number of surfaces use `backdrop-blur` without the rest of the glass treatment, because they cover an entire screen or image rather than floating as a bounded panel: `DialogOverlay`/`AlertDialogOverlay` (`bg-black/30 supports-backdrop-filter:backdrop-blur-xs`) and the `ActivityDetailsPage` hero-image scrim (`bg-black/35 backdrop-blur-xs`). These stay as plain blur — no `useLiquidGlass`, no distortion — since there's no edge for a glass effect to read against.

## Summary checklist

- [ ] Every bounded floating surface (popover, dropdown, combobox/select, modal card, navbar) calls `useLiquidGlass` with the right preset (`compact` for small/dense surfaces, `large` otherwise), spreads its `ref`/`style` onto the surface, and keeps a `bg-<token>/<opacity>` background per the table above.
- [ ] Full-bleed scrims (dialog overlays, hero-image scrims) stay plain blur, no `useLiquidGlass`.
- [ ] The host element carries its own `rounded-*` class — radius is auto-detected from it, not passed as a prop.
