import { useSyncExternalStore } from "react"

export function useMediaQuery(query: string) {
  const getSnapshot = () => window.matchMedia(query).matches

  const subscribe = (onChange: () => void) => {
    const mediaQueryList = window.matchMedia(query)
    mediaQueryList.addEventListener("change", onChange)
    return () => mediaQueryList.removeEventListener("change", onChange)
  }

  return useSyncExternalStore(subscribe, getSnapshot)
}
