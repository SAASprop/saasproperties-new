import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Media } from '../lib/property'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

export type LightboxMedia = Media & { title: string }

interface MediaLightboxProps {
  items: LightboxMedia[]
  /** Index into `items`, or null when closed. */
  index: number | null
  onClose: () => void
  onNavigate: (index: number) => void
}

/** Elements that can hold focus inside the dialog. */
const FOCUSABLE = 'button, [href], video[controls], [tabindex]:not([tabindex="-1"])'

/**
 * Full-screen viewer for a gallery item, with next/previous.
 *
 * Performance notes, since this sits on a page that gets measured:
 *  - Returns null when closed, so there is no DOM, no listeners and no media
 *    element to decode until it is actually opened.
 *  - Renders only the current item, never all of them.
 *  - Uses the same asset URLs as the carousel cards, so opening usually costs no
 *    network at all — the file is already in the HTTP cache.
 *  - Animates transform and opacity only, both compositor properties. No
 *    backdrop-filter and no translucent overlay: a full-screen blur is one of
 *    the more expensive things a low-end device can be asked to paint each
 *    frame, and a solid ground also stops the page behind ghosting through.
 */
export function MediaLightbox({ items, index, onClose, onNavigate }: MediaLightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const restoreFocusTo = useRef<HTMLElement | null>(null)
  /** Which way the last navigation went, so the transition slides to match. */
  const [direction, setDirection] = useState(1)
  const reducedMotion = usePrefersReducedMotion()

  const isOpen = index !== null
  const count = items.length

  const go = useCallback(
    (step: number) => {
      if (index === null) return
      setDirection(step)
      onNavigate((index + step + count) % count)
    },
    [count, index, onNavigate],
  )

  // Keys, scroll lock and focus, all only while open.
  useEffect(() => {
    if (!isOpen) return

    restoreFocusTo.current = document.activeElement as HTMLElement | null
    dialogRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        go(1)
        return
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        go(-1)
        return
      }
      if (event.key !== 'Tab') return

      // Minimal focus trap: keep Tab inside the dialog rather than letting it
      // walk the page behind the overlay.
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE)
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    // Hiding the page scrollbar widens the viewport, which would shift the
    // layout underneath and register as a layout shift. Pad by exactly the
    // scrollbar's width to keep everything still.
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    const { overflow, paddingRight } = document.body.style
    document.body.style.overflow = 'hidden'
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
      restoreFocusTo.current?.focus()
    }
  }, [isOpen, onClose, go])

  // Warm the neighbours so stepping through is instant. Images only — decoding a
  // neighbouring video up front would cost far more than it saves.
  useEffect(() => {
    if (index === null) return
    for (const step of [1, -1]) {
      const neighbour = items[(index + step + count) % count]
      if (neighbour?.kind === 'image') {
        const img = new Image()
        img.src = neighbour.src
      }
    }
  }, [index, items, count])

  const item = index === null ? null : items[index]

  return (
    <AnimatePresence>
      {isOpen && item && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col bg-bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`${item.title} — gallery viewer`}
          ref={dialogRef}
          tabIndex={-1}
        >
          {/* Top bar: counter and close. */}
          <div className="flex shrink-0 items-center justify-between px-5 py-5 md:px-10">
            <span className="font-display text-xs not-italic tabular-nums text-muted">
              {String(index + 1).padStart(2, '0')}
              <span className="mx-1 text-muted/60">/</span>
              {String(count).padStart(2, '0')}
            </span>

            <button
              type="button"
              onClick={onClose}
              className="grid h-11 w-11 place-items-center rounded-full border border-stroke text-text transition-colors duration-300 hover:border-text hover:bg-text hover:text-bg"
              aria-label="Close viewer"
            >
              ✕
            </button>
          </div>

          {/* Stage. Deliberately does NOT stop clicks: the dark space beside the
              media is the backdrop, and clicking it should close. Only the media
              and the controls swallow their own clicks. */}
          <div className="flex min-h-0 flex-1 items-center justify-center gap-3 px-3 md:gap-6 md:px-10">
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); go(-1) }}
              className="hidden h-11 w-11 shrink-0 place-items-center rounded-full border border-stroke text-text transition-colors duration-300 hover:border-text hover:bg-text hover:text-bg sm:grid"
              aria-label="Previous item"
            >
              ←
            </button>

            <AnimatePresence mode="wait" initial={false}>
              <motion.figure
                key={index}
                className="m-0 flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center"
                onClick={(event) => event.stopPropagation()}
                initial={
                  reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * 36, scale: 0.98 }
                }
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={
                  reducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, x: direction * -36, scale: 0.98 }
                }
                transition={{ duration: reducedMotion ? 0.15 : 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                {item.kind === 'video' ? (
                  <video
                    src={item.mp4}
                    poster={item.poster}
                    className="max-h-full max-w-full rounded-lg border border-stroke object-contain"
                    controls
                    autoPlay
                    // Muted so autoplay is permitted at all; controls let the
                    // viewer turn sound on deliberately.
                    muted
                    loop
                    playsInline
                    aria-label={item.alt}
                  />
                ) : (
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="max-h-full max-w-full rounded-lg border border-stroke object-contain"
                    // Never lazy: this is the one thing the viewer opened to see.
                    loading="eager"
                    decoding="async"
                  />
                )}

                <figcaption className="mt-5 shrink-0 text-center text-[10px] uppercase tracking-[0.3em] text-muted">
                  {item.title}
                </figcaption>
              </motion.figure>
            </AnimatePresence>

            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); go(1) }}
              className="hidden h-11 w-11 shrink-0 place-items-center rounded-full border border-stroke text-text transition-colors duration-300 hover:border-text hover:bg-text hover:text-bg sm:grid"
              aria-label="Next item"
            >
              →
            </button>
          </div>

          {/* Mobile controls: the edge arrows are too small a target on a phone. */}
          <div
            className="flex shrink-0 items-center justify-center gap-4 px-5 pb-6 pt-4 sm:hidden"
          >
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); go(-1) }}
              className="grid h-12 w-12 place-items-center rounded-full border border-stroke text-text"
              aria-label="Previous item"
            >
              ←
            </button>
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); go(1) }}
              className="grid h-12 w-12 place-items-center rounded-full border border-stroke text-text"
              aria-label="Next item"
            >
              →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
