import { createContext, useContext } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery'

/**
 * The page's motion system.
 *
 * Every animated section on this page already follows one house pattern, and
 * this module is the shared part of it rather than a second system alongside it:
 *
 *   1. Ask `useMotionDisabled()`. If it is true, return before building
 *      anything — no timelines, no ScrollTriggers, no SplitText.
 *   2. Scope the work to a `gsap.context(..., root)` and `ctx.revert()` on
 *      cleanup, so turning motion off restores the original styles exactly.
 *   3. Wait for `layoutSettled()` before measuring. Fonts change line heights,
 *      which changes every trigger position.
 *   4. Mark anything that starts hidden with that section's `-hide` class, and
 *      let CSS reveal it when motion is off. Without the class the element
 *      flashes before its trigger; without the CSS escape it never appears.
 *
 * The vocabulary for what gets animated is the `data-anim` attribute, already
 * established across the sections:
 *
 *   element       fade and rise — the default reveal for text
 *   split         per-line or per-word mask reveal, via SplitText
 *   stagger       one of a set that reveals in sequence
 *   rule          a hairline that draws out from its origin edge
 *   img-parallax  scrubbed drift, held oversized so no edge shows
 *   img-overlay   a ground-coloured panel that wipes up off the image
 *
 * Prefer one of those to inventing a seventh. A section that needs something
 * genuinely different — the galleries' 3D rings, the stats' counters — owns it
 * locally instead of widening this list.
 */

/** Where the visitor's choice is kept between visits. */
export const MOTION_STORAGE_KEY = 'saas:motion'

/** Set on <html> so CSS can see the switch. Either 'on' or 'off'. */
export const MOTION_ATTR = 'data-motion'

/**
 * Whether the enhanced scroll motion is switched on. Defaults to true so a
 * component rendered outside the provider still animates.
 */
export const MotionContext = createContext(true)

/** Flips the switch. No-op outside the provider. */
export const MotionSetContext = createContext<(on: boolean) => void>(() => {})

export function useMotionEnabled(): boolean {
  return useContext(MotionContext)
}

export function useSetMotionEnabled(): (on: boolean) => void {
  return useContext(MotionSetContext)
}

/**
 * Whether motion must be suppressed — either the visitor asked the operating
 * system for less of it, or the switch is off.
 *
 * This is what a section should gate on. It is deliberately shaped like the
 * `usePrefersReducedMotion` it replaces, returning true for "do not animate", so
 * the existing early-returns and dependency arrays keep working untouched. The
 * accessibility preference is not overridable: no state of the switch can turn
 * motion back on for someone who asked for less.
 */
export function useMotionDisabled(): boolean {
  const enabled = useMotionEnabled()
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')
  return reduced || !enabled
}

/**
 * Resolves once the page has stopped moving under its own weight: webfonts
 * swapped in, and two frames painted after that.
 *
 * Every trigger position is a measurement, and a measurement taken before the
 * display face loads is taken against the fallback's line height. The sections
 * that predate this module each carry their own copy of this wait; new ones
 * should use this.
 */
export function layoutSettled(): Promise<void> {
  return Promise.all([
    document.fonts?.ready ?? Promise.resolve(),
    new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    }),
  ]).then(() => undefined)
}
