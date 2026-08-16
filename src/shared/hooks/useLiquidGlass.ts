import { useCallback, useMemo, useRef, useState, type CSSProperties } from "react"
import {
  buildDisplacementFilter,
  detectLiquidGlassSupport,
  LIQUID_GLASS_PRESET,
} from "@/shared/lib/liquidGlass"

interface GlassSize {
  width: number
  height: number
  radius: number
}

interface UseLiquidGlassOptions {
  enabled?: boolean
}

export function useLiquidGlass<T extends HTMLElement>({
  enabled = true,
}: UseLiquidGlassOptions = {}) {
  const [size, setSize] = useState<GlassSize | null>(null)
  const observerRef = useRef<ResizeObserver | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastElRef = useRef<T | null>(null)
  const detachTokenRef = useRef(0)

  const measure = useCallback((el: T) => {
    const rect = el.getBoundingClientRect()
    const radius = parseFloat(getComputedStyle(el).borderRadius) || 0
    setSize(prev => {
      if (
        prev &&
        prev.width === rect.width &&
        prev.height === rect.height &&
        prev.radius === radius
      ) {
        return prev
      }
      return { width: rect.width, height: rect.height, radius }
    })
  }, [])

  // A callback ref (not an object ref) is required here: Radix's Presence-wrapped
  // content (Dialog, Popover, DropdownMenu, Select, Combobox, HoverCard, AlertDialog)
  // attaches/detaches its ref multiple times during mount as part of its own open
  // choreography — an object ref read once inside a `[enabled]`-keyed useLayoutEffect
  // can catch a transient null and never recover, while a callback ref re-measures on
  // every attach, so it always ends up wired to whatever the final node is.
  //
  // Radix's `Slot` (`asChild`) recreates its internal composed-ref function on every
  // render (it isn't memoized), which forces React to detach+reattach our ref on every
  // render of an `asChild` consumer even though the underlying DOM node never changed.
  // Two guards keep that from ever becoming a render loop:
  //  - `lastElRef` short-circuits a reattach of the *same* node into a true no-op —
  //    the detach call in between doesn't clear it, so a same-node detach+reattach
  //    pair (always synchronous) never reaches the teardown logic below.
  //  - genuine detaches (a real unmount, or `enabled` flipping false) are deferred one
  //    microtask via `detachTokenRef`, so if a same-node reattach *does* land first,
  //    the stale detach is skipped instead of tearing down a still-live observer.
  //  - measuring is further coalesced onto a single rAF, so even a burst of distinct
  //    reattaches in one tick (Presence's own mount choreography) produces one measurement.
  const ref = useCallback(
    (el: T | null) => {
      detachTokenRef.current++

      if (el !== null && enabled && el === lastElRef.current) {
        return
      }

      if (el === null || !enabled) {
        const token = detachTokenRef.current
        queueMicrotask(() => {
          if (detachTokenRef.current !== token) return
          lastElRef.current = null
          observerRef.current?.disconnect()
          observerRef.current = null
          if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current)
            rafRef.current = null
          }
          setSize(prev => (prev === null ? prev : null))
        })
        return
      }

      lastElRef.current = el
      observerRef.current?.disconnect()
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        measure(el)
      })

      const observer = new ResizeObserver(() => measure(el))
      observer.observe(el)
      observerRef.current = observer
    },
    [enabled, measure]
  )

  const style = useMemo<CSSProperties>(() => {
    if (!enabled || !size || size.width === 0 || size.height === 0) return {}

    const { blur, strength, chromaticAberration, depth, brightness, saturate } = LIQUID_GLASS_PRESET

    if (!detectLiquidGlassSupport()) {
      return { backdropFilter: `blur(${blur * 2}px)` }
    }

    const filterUrl = buildDisplacementFilter({
      width: size.width,
      height: size.height,
      radius: size.radius,
      depth,
      strength,
      chromaticAberration,
    })

    return {
      backdropFilter: `blur(${blur / 2}px) url('${filterUrl}') blur(${blur}px) brightness(${brightness}) saturate(${saturate})`,
      boxShadow:
        "inset 1px 1px 1px 0 var(--glass-highlight), inset -1px -1px 1px 0 var(--glass-highlight)",
    }
  }, [enabled, size])

  return { ref, style }
}
