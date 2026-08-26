import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { Media } from '../lib/property'
import { useMotionDisabled } from '../lib/motion'

export type LightboxMedia = Media & { title: string }

/**
 * Where on screen the thing that was clicked is. A plain object rather than the
 * DOMRect itself, so the caller can capture it and let the element go.
 */
export interface OpenOrigin {
  left: number
  top: number
  width: number
  height: number
}

interface MediaLightboxProps {
  items: LightboxMedia[]
  /** Index into `items`, or null when closed. */
  index: number | null
  onClose: () => void
  onNavigate: (index: number) => void
  /**
   * The clicked card's on-screen box. When given, the media grows out of it
   * instead of fading in on the spot. Optional: a caller with nothing to grow
   * from can leave it off and gets the plain fade.
   */
  origin?: OpenOrigin | null
}

/** How long the media takes to reach full size, and to collapse back. */
const EXPAND_MS = 620
const COLLAPSE_MS = 340

/** Elements that can hold focus inside the dialog. */
const FOCUSABLE = 'button, [href], video[controls], [tabindex]:not([tabindex="-1"])'

/** Expo-out. The same curve the gallery cards use, so the two agree. */
const EASE = [0.16, 1, 0.3, 1] as const

/**
 * The counter, the close button and the arrows settle in a beat after the
 * media, rather than arriving with it — the image is what was asked for, and
 * the controls should not compete with it for the first frame.
 */
const CHROME = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.55, delay: 0.14, ease: EASE },
}

/**
 * Full-screen viewer for a gallery item, with next/previous.
 *
 * Performance notes, since this sits on a page that gets measured:
 *  - Returns null when closed, so there is no DOM, no listeners and no media
 *    element to decode until it is actually opened.
 *  - Renders only the current item, never all of them.
 *  - Uses the same asset URLs as the carousel cards, so opening usually costs no
 *    network at all — the file is already in the HTTP cache.
 *  - Animates transform and opacity only, both compositor properties.
 *  - The ground is translucent but never blurred. Alpha is close to free; a
 *    full-screen backdrop-filter is one of the more expensive things a low-end
 *    device can be asked to paint every frame. 97% is deliberate: the gallery
 *    behind this is a light ivory band, and at 95% its heading was still faintly
 *    legible through the overlay, which pulls against the image it is meant to
 *    be framing. Three percent still reads as depth without ghosting.
 */
export function MediaLightbox({
  items,
  index,
  onClose,
  onNavigate,
  origin,
}: MediaLightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const restoreFocusTo = useRef<HTMLElement | null>(null)
  /** Which way the last navigation went, so the transition slides to match. */
  const [direction, setDirection] = useState(1)
  const reducedMotion = useMotionDisabled()

  /** The frame the media grows inside. Driven directly, not by framer-motion. */
  const frameRef = useRef<HTMLDivElement>(null)
  /** The transform that sits the frame back on the card it came from. */
  const collapsed = useRef<string | null>(null)
  const closeTimer = useRef(0)

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

  /**
   * Grow the media out of the card that was clicked.
   *
   * A FLIP: the frame is laid out where it belongs, measured, then put back on
   * the card for one frame and released. Measuring is what makes it exact —
   * the resting size depends on the image's own proportions inside a stage
   * whose height varies with the viewport, so it cannot be worked out ahead of
   * time.
   *
   * The scale comes from width alone, and uniformly. The card crops its still
   * to a portrait box while the viewer shows the whole frame, so no single
   * transform can match both edges; object-fit is not animatable either. What
   * reads as the card expanding is the origin and the growth, not the edges
   * lining up, and a uniform scale keeps the image undistorted on the way.
   *
   * Written straight to the DOM rather than through framer-motion, which is
   * animating the ground around it and the per-image slide within it. Three
   * owners for one transform would fight; this way each owns its own element.
   */
  useLayoutEffect(() => {
    const frame = frameRef.current
    if (!isOpen || !origin || !frame || reducedMotion) {
      collapsed.current = null
      return
    }

    const rest = frame.getBoundingClientRect()
    if (!rest.width || !rest.height) return

    const scale = origin.width / rest.width
    const dx = origin.left + origin.width / 2 - (rest.left + rest.width / 2)
    const dy = origin.top + origin.height / 2 - (rest.top + rest.height / 2)
    const transform = `translate3d(${dx}px, ${dy}px, 0) scale(${scale})`
    // Kept for the close, so it collapses back the way it came.
    collapsed.current = transform

    frame.style.willChange = 'transform, opacity'
    frame.style.transition = 'none'
    frame.style.transform = transform
    frame.style.opacity = '0.55'

    // Released on the next frame: setting both states in one go would give the
    // browser nothing to interpolate between.
    const raf = requestAnimationFrame(() => {
      frame.style.transition = `transform ${EXPAND_MS}ms cubic-bezier(0.16, 1, 0.3, 1), opacity ${Math.round(EXPAND_MS * 0.6)}ms ease-out`
      frame.style.transform = ''
      frame.style.opacity = ''
    })

    return () => cancelAnimationFrame(raf)
    // Deliberately not keyed on `index`: navigating inside the viewer must not
    // replay the expansion. `origin` only changes when it is opened afresh.
  }, [isOpen, origin, reducedMotion])

  /**
   * Collapse back onto the card, then close for real.
   *
   * The ground fades on unmount, so the two overlap rather than running one
   * after the other — the frame is most of the way home before it is gone.
   *
   * It returns to the card that was opened, which after paging through the
   * viewer is no longer the card being looked at. Tracking the live one would
   * mean the gallery reporting positions for a ring that is still turning; a
   * return to where the journey started reads as intended, so this is a choice
   * rather than an oversight.
   */
  const requestClose = useCallback(() => {
    const frame = frameRef.current
    const transform = collapsed.current
    if (!frame || !transform || reducedMotion) {
      onClose()
      return
    }

    frame.style.transition = `transform ${COLLAPSE_MS}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${COLLAPSE_MS}ms ease-in`
    frame.style.transform = transform
    frame.style.opacity = '0'

    window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(onClose, Math.round(COLLAPSE_MS * 0.75))
  }, [onClose, reducedMotion])

  useEffect(() => () => window.clearTimeout(closeTimer.current), [])

  // Keys, scroll lock and focus, all only while open.
  useEffect(() => {
    if (!isOpen) return

    restoreFocusTo.current = document.activeElement as HTMLElement | null
    dialogRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        requestClose()
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
  }, [isOpen, requestClose, go])

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
  /** Reduced motion gets the same controls, just already in place. */
  const chrome = reducedMotion ? {} : CHROME

  return (
    <AnimatePresence>
      {isOpen && item && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col bg-bg/[0.97]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onClick={requestClose}
          role="dialog"
          aria-modal="true"
          aria-label={`${item.title} — gallery viewer`}
          ref={dialogRef}
          tabIndex={-1}
        >
          {/* Top bar: counter and close. */}
          <motion.div
            className="flex shrink-0 items-center justify-between px-5 py-5 md:px-10"
            {...chrome}
          >
            <span className="font-display text-xs not-italic tabular-nums text-muted">
              {String(index + 1).padStart(2, '0')}
              <span className="mx-1 text-muted/60">/</span>
              {String(count).padStart(2, '0')}
            </span>

            <button
              type="button"
              onClick={requestClose}
              className="grid h-11 w-11 place-items-center rounded-full border border-stroke text-text transition-colors duration-300 hover:border-text hover:bg-text hover:text-bg"
              aria-label="Close viewer"
            >
              <X size={17} strokeWidth={1.25} aria-hidden="true" />
            </button>
          </motion.div>

          {/* Stage. Deliberately does NOT stop clicks: the dark space beside the
              media is the backdrop, and clicking it should close. Only the media
              and the controls swallow their own clicks. */}
          <div className="flex min-h-0 flex-1 items-center justify-center gap-3 px-3 py-4 md:gap-6 md:px-10 md:py-6">
            <motion.button
              type="button"
              onClick={(event) => { event.stopPropagation(); go(-1) }}
              className="hidden h-11 w-11 shrink-0 place-items-center rounded-full border border-stroke text-text transition-colors duration-300 hover:border-text hover:bg-text hover:text-bg sm:grid"
              aria-label="Previous item"
              {...chrome}
            >
              <ChevronLeft size={19} strokeWidth={1.25} aria-hidden="true" />
            </motion.button>

            {/* The frame the expansion drives. Sized by the flex row exactly as
                the figure used to be, so introducing it changed no layout. */}
            <div
              ref={frameRef}
              className="flex min-h-0 min-w-0 flex-1 items-center justify-center"
            >
              <AnimatePresence mode="wait" initial={false}>
              <motion.figure
                key={index}
                className="m-0 flex min-h-0 min-w-0 flex-col items-center justify-center"
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
                {/* The caption sits on the media, so the frame has to be the
                    thing it is positioned against. inline-flex, so the box
                    shrink-wraps whatever is inside it rather than taking the
                    figure's full width — otherwise the overlay would run out
                    past the edges of a portrait image. */}
                <span className="relative inline-flex min-h-0 min-w-0">
                {item.kind === 'video' ? (
                  <video
                    src={item.mp4}
                    poster={item.poster}
                    className="max-h-[66vh] max-w-full rounded-lg border border-stroke object-contain sm:max-h-[74vh]"
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
                    /* Capped in vh, not %. The percentage this used to carry
                       resolved against a figure whose own height is decided by
                       its content, so it did nothing: the image was only ever
                       bounded by width, and on a short or wide window it grew
                       tall enough to push the caption off the bottom of the
                       screen. Viewport units always resolve, and they leave
                       room for the bar above and the caption below at any
                       window size — 66vh on a phone, where the controls take
                       another row. */
                    className="max-h-[66vh] max-w-full rounded-lg border border-stroke object-contain sm:max-h-[74vh]"
                    // Never lazy: this is the one thing the viewer opened to see.
                    loading="eager"
                    decoding="async"
                  />
                )}

                {/* On the image, and never beside it.
                    A video puts its controls along the bottom edge, so for one
                    the panel goes to the top instead — covering a play button
                    with a caption would be trading a label for the control the
                    viewer actually needs. The gradient runs from the caption
                    edge outwards in each case, and the blur is clipped to the
                    panel so the photograph behind it stays sharp. */}
                <figcaption
                  className={`pointer-events-none absolute inset-x-0 flex items-end rounded-lg px-5 text-[0.6875rem] uppercase tracking-[0.28em] text-white ${
                    item.kind === 'video'
                      ? 'top-0 rounded-b-none bg-gradient-to-b from-black/85 via-black/45 to-transparent pb-8 pt-4'
                      : 'bottom-0 rounded-t-none bg-gradient-to-t from-black/85 via-black/45 to-transparent pb-4 pt-10'
                  }`}
                >
                  <span className="w-full [backdrop-filter:blur(2px)]">{item.title}</span>
                </figcaption>
                </span>
              </motion.figure>
              </AnimatePresence>
            </div>

            <motion.button
              type="button"
              onClick={(event) => { event.stopPropagation(); go(1) }}
              className="hidden h-11 w-11 shrink-0 place-items-center rounded-full border border-stroke text-text transition-colors duration-300 hover:border-text hover:bg-text hover:text-bg sm:grid"
              aria-label="Next item"
              {...chrome}
            >
              <ChevronRight size={19} strokeWidth={1.25} aria-hidden="true" />
            </motion.button>
          </div>

          {/* Mobile controls: the edge arrows are too small a target on a phone. */}
          <motion.div
            className="flex shrink-0 items-center justify-center gap-4 px-5 pb-6 pt-4 sm:hidden"
            {...chrome}
          >
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); go(-1) }}
              className="grid h-12 w-12 place-items-center rounded-full border border-stroke text-text"
              aria-label="Previous item"
            >
              <ChevronLeft size={21} strokeWidth={1.25} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); go(1) }}
              className="grid h-12 w-12 place-items-center rounded-full border border-stroke text-text"
              aria-label="Next item"
            >
              <ChevronRight size={21} strokeWidth={1.25} aria-hidden="true" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
