import { useCallback, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MOTION_ATTR, MOTION_STORAGE_KEY, MotionContext, MotionSetContext } from '../lib/motion'
// The half of the switch that CSS owns. Imported here rather than from index.css
// so it loads with the provider that turns it on.
import './motion-off.css'

/** Reads the stored choice, defaulting to on. */
function storedPreference(): boolean {
  try {
    return window.localStorage.getItem(MOTION_STORAGE_KEY) !== 'off'
  } catch {
    // Private windows and blocked site data both throw on access.
    return true
  }
}

/**
 * Owns the motion switch and publishes it two ways: through context, for the
 * sections that build their timelines in JavaScript, and as an attribute on
 * <html>, for the CSS that has to reveal whatever those timelines would have
 * revealed.
 *
 * Both are needed. Gating the effects alone leaves every element still wearing
 * its `-hide` class, so a page with motion off would render half empty.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(storedPreference)

  // Before paint, so the attribute is in place for the first frame CSS sees.
  useLayoutEffect(() => {
    document.documentElement.setAttribute(MOTION_ATTR, enabled ? 'on' : 'off')
  }, [enabled])

  useEffect(() => {
    try {
      window.localStorage.setItem(MOTION_STORAGE_KEY, enabled ? 'on' : 'off')
    } catch {
      // Not being able to remember the choice is not worth failing over.
    }
  }, [enabled])

  // Flipping the switch reverts or rebuilds every section's timeline, and the
  // CSS escape changes what is visible. Both move things, and every trigger
  // position is a stale measurement until this runs. Deferred a frame so it
  // measures the page after those effects have landed, not during them.
  useEffect(() => {
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(frame)
  }, [enabled])

  const set = useCallback((on: boolean) => setEnabled(on), [])

  // Two contexts rather than one object: the value is a primitive and the
  // setter is stable, so a consumer of either never re-renders for the other.
  const value = useMemo(() => enabled, [enabled])

  return (
    <MotionContext.Provider value={value}>
      <MotionSetContext.Provider value={set}>{children}</MotionSetContext.Provider>
    </MotionContext.Provider>
  )
}
