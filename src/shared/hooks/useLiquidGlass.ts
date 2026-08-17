import { useCallback, useMemo, useRef, useState, type CSSProperties } from "react"
import {
  buildDisplacementFilter,
  detectLiquidGlassSupport,
  LIQUID_GLASS_PRESETS,
  resolveDepth,
  type LiquidGlassPreset,
} from "@/shared/lib/liquidGlass"

interface GlassSize {
  width: number
  height: number
  radius: number
}

interface UseLiquidGlassOptions {
  enabled?: boolean
  preset?: LiquidGlassPreset
}

export function useLiquidGlass<T extends HTMLElement>({
  enabled = true,
  preset = "large",
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

  // A callback ref, not an object ref: Radix's Presence-wrapped content (Dialog,
  // Popover, DropdownMenu, Select, Combobox, HoverCard, AlertDialog) attaches/detaches
  // this ref multiple times during its own open choreography, and a callback ref
  // re-measures on every attach so it always ends up wired to the final node.
  //
  // Radix's `Slot` (`asChild`) also recreates its composed-ref function on every
  // render, forcing a detach+reattach on every render of an `asChild` consumer even
  // when the DOM node hasn't changed. Two guards keep that from becoming a render loop:
  //  - `lastElRef` turns a same-node reattach into a no-op — the detach call in
  //    between doesn't clear it, so a same-node detach+reattach pair never reaches
  //    the teardown logic below.
  //  - a genuine detach (a real unmount, or `enabled` flipping false) is deferred one
  //    microtask via `detachTokenRef`, so a same-node reattach that lands first
  //    cancels the stale detach instead of tearing down a still-live observer.
  //  - measuring is coalesced onto a single rAF, so a burst of reattaches in one tick
  //    produces one measurement, not several.
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

    const { blur, strength, chromaticAberration, depth, brightness, saturate } =
      LIQUID_GLASS_PRESETS[preset]

    if (!detectLiquidGlassSupport()) {
      return { backdropFilter: `blur(${blur * 2}px)` }
    }

    const filterUrl = buildDisplacementFilter({
      width: size.width,
      height: size.height,
      radius: size.radius,
      depth: resolveDepth(depth, size.width, size.height),
      strength,
      chromaticAberration,
    })

    return {
      backdropFilter: `blur(${blur / 2}px) url('${filterUrl}') blur(${blur}px) brightness(${brightness}) saturate(${saturate})`,
      boxShadow:
        "inset 1px 1px 1px 0 var(--glass-highlight), inset -1px -1px 1px 0 var(--glass-highlight)",
    }
  }, [enabled, size, preset])

  return { ref, style }
}
