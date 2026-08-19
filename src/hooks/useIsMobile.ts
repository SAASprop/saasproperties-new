import { useMediaQuery } from './useMediaQuery'

/** True below the 768 px breakpoint, where the portrait video sources apply. */
export function useIsMobile(breakpoint = 768): boolean {
  return useMediaQuery(`(max-width: ${breakpoint}px)`)
}
