import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LOADER } from '../lib/content'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

/** Quadratic in-out — slow start, quick middle, soft landing on 100. */
function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

interface LoadingScreenProps {
  onComplete: () => void
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const reducedMotion = usePrefersReducedMotion()
  const [progress, setProgress] = useState(0)
  const [wordIndex, setWordIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  // onComplete is stored in a ref so the timing effect never re-runs when the
  // parent re-renders with a new callback identity.
  const onCompleteRef = useRef(onComplete)
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    // Reduced motion: hold the finished state briefly, then dismiss.
    if (reducedMotion) {
      const dismiss = window.setTimeout(() => {
        setVisible(false)
        onCompleteRef.current()
      }, LOADER.completeDelayMs)
      return () => window.clearTimeout(dismiss)
    }

    let frame = 0
    let start: number | null = null
    let dismiss = 0

    const tick = (now: number) => {
      if (start === null) start = now
      const linear = Math.min((now - start) / LOADER.durationMs, 1)
      setProgress(easeInOutQuad(linear) * 100)

      if (linear < 1) {
        frame = window.requestAnimationFrame(tick)
        return
      }

      dismiss = window.setTimeout(() => {
        setVisible(false)
        onCompleteRef.current()
      }, LOADER.completeDelayMs)
    }

    frame = window.requestAnimationFrame(tick)

    const words = window.setInterval(() => {
      setWordIndex((index) => (index + 1) % LOADER.words.length)
    }, LOADER.wordIntervalMs)

    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(dismiss)
      window.clearInterval(words)
    }
  }, [reducedMotion])

  // With reduced motion there is no counter animation — show the settled value.
  const shown = reducedMotion ? 100 : progress
  const counter = String(Math.round(shown)).padStart(3, '0')

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-bg"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.2 : 0.8, ease: 'easeInOut' }}
        >
          <span className="absolute left-6 top-6 text-[10px] uppercase tracking-[0.3em] text-muted sm:left-10 sm:top-10">
            {LOADER.label}
          </span>

          <div className="relative flex h-[1.4em] items-center justify-center px-6">
            <AnimatePresence mode="wait">
              <motion.span
                key={LOADER.words[wordIndex]}
                className="font-display text-5xl italic text-text sm:text-7xl md:text-8xl"
                initial={{ opacity: 0, y: reducedMotion ? 0 : 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reducedMotion ? 0 : -18 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              >
                {LOADER.words[wordIndex]}
              </motion.span>
            </AnimatePresence>
          </div>

          <span
            className="absolute bottom-8 right-6 font-display text-4xl italic tabular-nums text-text sm:bottom-12 sm:right-10 sm:text-5xl"
            aria-live="off"
          >
            {counter}
          </span>

          <div className="absolute bottom-0 left-0 h-[2px] w-full bg-stroke">
            <div
              className="accent-gradient h-full"
              style={{ width: `${shown}%` }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
