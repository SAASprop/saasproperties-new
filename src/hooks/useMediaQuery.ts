import { useCallback, useSyncExternalStore } from 'react'

/**
 * Subscribes to a media query without an effect, so the first render already
 * reflects the real match instead of settling on a second pass.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onStoreChange)
      return () => mql.removeEventListener('change', onStoreChange)
    },
    [query],
  )

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query])

  // The site is client-rendered only; the server snapshot never actually runs.
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
