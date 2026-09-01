import { useCallback, useEffect, useRef, useState } from 'react'
import { LOADER } from '../lib/content'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import './loading-screen.css'

/**
 * Animated in CSS rather than with framer-motion.
 *
 * The loader and the navbar were the only two things above the fold importing
 * that library, which put its 130 kB on the critical path — and on a throttled
 * phone the whole page waited on it, because nothing can render until every
 * script the entry needs has arrived. Everything else that uses it sits below
 * the fold and loads in that chunk instead. What it was doing here was a fade
 * and a slide, which CSS does without shipping anything.
 */

/** Quadratic in-out — slow start, quick middle, soft landing on 100. */
function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

/** How long the curtain takes to fade. Must match .loader in the stylesheet. */
const FADE_MS = 450
const FADE_REDUCED_MS = 200

interface LoadingScreenProps {
  onComplete: () => void
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const reducedMotion = usePrefersReducedMotion()
  const [progress, setProgress] = useState(0)
  const [wordIndex, setWordIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  /** Fading out: still on the page, no longer opaque. */
  const [leaving, setLeaving] = useState(false)

  // onComplete is stored in a ref so the timing effect never re-runs when the
  // parent re-renders with a new callback identity.
  const onCompleteRef = useRef(onComplete)
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  // Starts the fade and lets the page behind know it is live. Stable, so the
  // timing effect below never re-runs because of it.
  const dismiss = useCallback(() => {
    setLeaving(true)
    onCompleteRef.current()
  }, [])

  // Unmount once the fade has played out.
  useEffect(() => {
    if (!leaving) return
    const done = window.setTimeout(
      () => setVisible(false),
      reducedMotion ? FADE_REDUCED_MS : FADE_MS,
    )
    return () => window.clearTimeout(done)
  }, [leaving, reducedMotion])

  useEffect(() => {
    /**
     * How much of the loader's time has already been spent getting here.
     *
     * `performance.now()` is milliseconds since the navigation started, and this
     * effect runs once the bundle has downloaded, parsed and mounted — so on a
     * slow connection a second or two of the wait is already behind us. The
     * loader is here to cover that wait, not to be added to the end of it: it
     * now runs only the remainder, and on a slow enough load it has nothing left
     * to run and lifts immediately.
     *
     * Before this, a phone spent two and a half seconds fetching the scripts and
     * *then* began a fresh one-second countdown, which went straight onto
     * Largest Contentful Paint.
     */
    const alreadyElapsed = performance.now()
    const remaining = Math.max(0, LOADER.durationMs - alreadyElapsed)
    const tail = remaining > 0 ? LOADER.completeDelayMs : 0

    // Reduced motion: hold the finished state briefly, then dismiss.
    if (reducedMotion) {
      const dismissTimer = window.setTimeout(dismiss, tail)
      return () => window.clearTimeout(dismissTimer)
    }

    if (remaining === 0) {
      dismiss()
      return
    }

    let frame = 0
    let start: number | null = null
    let dismissTimer = 0

    const tick = (now: number) => {
      if (start === null) start = now
      const linear = Math.min((now - start) / remaining, 1)
      setProgress(easeInOutQuad(linear) * 100)

      if (linear < 1) {
        frame = window.requestAnimationFrame(tick)
        return
      }

      dismissTimer = window.setTimeout(dismiss, tail)
    }

    frame = window.requestAnimationFrame(tick)

    const words = window.setInterval(() => {
      setWordIndex((index) => (index + 1) % LOADER.words.length)
    }, LOADER.wordIntervalMs)

    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(dismissTimer)
      window.clearInterval(words)
    }
  }, [reducedMotion, dismiss])

  // With reduced motion there is no counter animation — show the settled value.
  const shown = reducedMotion ? 100 : progress
  const counter = String(Math.round(shown)).padStart(3, '0')

  if (!visible) return null

  return (
    <div
      className="loader fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-bg"
      // The class drives the fade out; unmounting waits for it to finish.
      data-leaving={leaving ? 'true' : 'false'}
      data-reduced={reducedMotion ? 'true' : 'false'}
    >
      <span className="absolute left-6 top-6 text-[10px] uppercase tracking-[0.3em] text-muted sm:left-10 sm:top-10">
        {LOADER.label}
      </span>

      <div className="relative flex h-[1.4em] items-center justify-center px-6">
        {/* Keyed on the word, so React replaces the element and the CSS entry
            animation runs again from the start for each one. */}
        <span
          key={LOADER.words[wordIndex]}
          className="loader-word font-display text-5xl italic text-text sm:text-7xl md:text-8xl"
        >
          {LOADER.words[wordIndex]}
        </span>
      </div>

      <span
        className="absolute bottom-8 right-6 font-display text-4xl italic tabular-nums text-text sm:bottom-12 sm:right-10 sm:text-5xl"
        aria-live="off"
      >
        {counter}
      </span>

      <div className="absolute bottom-0 left-0 h-[2px] w-full bg-stroke">
        <div className="accent-gradient h-full" style={{ width: `${shown}%` }} />
      </div>
    </div>
  )
}
