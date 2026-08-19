import { useMediaQuery } from './useMediaQuery'

/** Tracks the reduced-motion preference and updates if the user changes it. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}
