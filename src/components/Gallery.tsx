import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PROPERTY } from '../lib/property'
import { MediaLightbox } from './MediaLightbox'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import './gallery.css'

const { gallery } = PROPERTY

/** How long a card holds before the carousel advances. */
const AUTO_ADVANCE_MS = 5000
/** How long after the last scroll event the position is treated as settled. */
const SETTLE_MS = 140
/** Copies of the item list laid end to end, so there is always a set either side. */
const COPIES = 3

export function Gallery() {
  const trackRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLElement | null)[]>([])
  const reducedMotion = usePrefersReducedMotion()

  const count = gallery.items.length
  // The middle copy is where the visitor always is; the outer two exist only to
  // be scrolled into, and the position is normalised back here once idle.
  const startIndex = count
  const [activeIndex, setActiveIndex] = useState(startIndex)
  const [progress, setProgress] = useState(0)
  const [interacting, setInteracting] = useState(false)
  const [inView, setInView] = useState(false)
  /** Logical item index the viewer is open on, or null when closed. */
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const displayItems = useMemo(
    () => Array.from({ length: COPIES }, () => gallery.items).flat(),
    [],
  )

  /** Scroll offset that puts a card in the middle of the track. */
  const offsetFor = useCallback((index: number) => {
    const track = trackRef.current
    const card = cardRefs.current[index]
    if (!track || !card) return null
    return card.offsetLeft + card.offsetWidth / 2 - track.clientWidth / 2
  }, [])

  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = 'smooth') => {
      const track = trackRef.current
      const left = offsetFor(index)
      if (!track || left === null) return
      track.scrollTo({ left, behavior: reducedMotion ? 'auto' : behavior })
    },
    [offsetFor, reducedMotion],
  )

  // Start on the middle copy. Measured from the DOM rather than computed from a
  // card-width constant, so the card can be sized responsively in CSS without
  // this maths going out of step with it.
  useEffect(() => {
    scrollToIndex(startIndex, 'auto')
  }, [scrollToIndex, startIndex])

  // Nearest card to the middle of the track wins, and once scrolling settles the
  // position is shifted a whole set back or forward to keep the visitor inside
  // the middle copy. That shift is what makes the loop seamless: it is a jump of
  // exactly one set, so the card under the cursor does not move.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let settle = 0

    const measure = () => {
      const centre = track.scrollLeft + track.clientWidth / 2
      let nearest = 0
      let best = Infinity
      cardRefs.current.forEach((card, index) => {
        if (!card) return
        const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - centre)
        if (distance < best) {
          best = distance
          nearest = index
        }
      })
      setActiveIndex(nearest)
      // Progress runs across one logical set, not the whole tripled track — the
      // copies are an implementation detail and should not show up in the bar.
      setProgress(((nearest % count) / Math.max(count - 1, 1)) * 100)
      return nearest
    }

    const normalise = () => {
      const nearest = measure()
      const first = cardRefs.current[0]
      const oneSetOn = cardRefs.current[count]
      if (!first || !oneSetOn) return
      const setWidth = oneSetOn.offsetLeft - first.offsetLeft

      if (nearest < count) {
        track.scrollLeft += setWidth
      } else if (nearest >= count * 2) {
        track.scrollLeft -= setWidth
      }
    }

    const onScroll = () => {
      measure()
      window.clearTimeout(settle)
      // Only ever adjusted while idle — moving scrollLeft mid-animation fights
      // the smooth scroll and reads as a stutter.
      settle = window.setTimeout(normalise, SETTLE_MS)
    }

    measure()
    track.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', measure)

    return () => {
      window.clearTimeout(settle)
      track.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
    }
  }, [count])

  // Nothing plays or advances while the section is off screen.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.25,
    })
    observer.observe(track)
    return () => observer.disconnect()
  }, [])

  // Auto-advance, suspended whenever the visitor is touching it, the viewer is
  // open over it, the tab is hidden, the section is off screen, or reduced
  // motion is asked for.
  useEffect(() => {
    if (reducedMotion || interacting || !inView || lightboxIndex !== null) return

    const tick = () => {
      if (document.hidden) return
      setActiveIndex((current) => {
        const next = current + 1
        scrollToIndex(next)
        return next
      })
    }

    const timer = window.setInterval(tick, AUTO_ADVANCE_MS)
    return () => window.clearInterval(timer)
  }, [reducedMotion, interacting, inView, lightboxIndex, scrollToIndex])

  const activeItem = displayItems[activeIndex] ?? displayItems[0]
  const logicalIndex = activeIndex % count

  return (
    <section id="gallery" className="bg-bg py-24 lg:py-32" aria-label="Gallery">
      <div className="mx-auto max-w-[1600px] px-5 md:px-[3.75rem]">
        {/* Header: caption and heading left, arrows right. */}
        <div className="mb-12 flex items-end justify-between gap-6 lg:mb-16">
          <div>
            <p className="eyebrow">{gallery.caption}</p>
            <h2 className="mt-4 font-display text-3xl uppercase leading-[1.1] tracking-[-0.02em] text-text sm:text-4xl lg:text-[2.75rem]">
              {gallery.heading}
            </h2>
          </div>

          <div className="flex shrink-0 gap-3">
            {(
              [
                { label: 'Previous', step: -1, glyph: '←' },
                { label: 'Next', step: 1, glyph: '→' },
              ] as const
            ).map((control) => (
              <button
                key={control.label}
                type="button"
                onClick={() => scrollToIndex(activeIndex + control.step)}
                className="grid h-11 w-11 place-items-center rounded-full border border-stroke text-text transition-colors duration-300 hover:border-text hover:bg-text hover:text-bg"
                aria-label={`${control.label} image`}
              >
                {control.glyph}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Track. Gutters are scroll padding rather than margin so the first card
          still centres, and the cards bleed past both edges of the frame. */}
      <div
        ref={trackRef}
        className="gallery-track flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain px-5 md:gap-6 md:px-[3.75rem]"
        tabIndex={0}
        role="group"
        aria-label={`${gallery.heading} — ${count} items`}
        onPointerEnter={() => setInteracting(true)}
        onPointerLeave={() => setInteracting(false)}
        onPointerDown={() => setInteracting(true)}
        onFocus={() => setInteracting(true)}
        onBlur={() => setInteracting(false)}
      >
        {displayItems.map((item, index) => {
          const isActive = index === activeIndex
          return (
            <button
              key={`${item.title}-${index}`}
              type="button"
              ref={(el) => {
                cardRefs.current[index] = el
              }}
              // A neighbour centres itself; the centred card opens the viewer.
              // Making every click open it would cost the ability to browse the
              // track by clicking, which is how a carousel is expected to work.
              onClick={() => {
                if (isActive) setLightboxIndex(index % count)
                else scrollToIndex(index)
              }}
              className={`group relative aspect-video w-[78vw] shrink-0 snap-center overflow-hidden rounded-lg border border-stroke bg-surface transition-[transform,opacity] duration-700 ease-out sm:w-[60vw] lg:w-[46vw] xl:w-[38vw] ${
                isActive ? 'scale-100 opacity-100' : 'scale-[0.94] opacity-45'
              }`}
              aria-label={isActive ? `Open ${item.title}` : `Show ${item.title}`}
              aria-current={isActive ? 'true' : undefined}
            >
              {/* Cards are always a still — a video item shows its poster. The
                  hero already streams this same reel, and a <video> here made
                  the browser fetch all 29 MB of it a second time on load, which
                  doubled the page weight for a card the size of a postcard. The
                  film plays at full size in the viewer instead. */}
              <img
                src={item.kind === 'video' ? item.poster : item.src}
                alt={item.alt}
                className="h-full w-full object-cover"
                // The centred card and its immediate neighbours are what a
                // visitor can actually see; the rest wait until scrolled to.
                loading={Math.abs(index - activeIndex) <= 1 ? 'eager' : 'lazy'}
                decoding="async"
                draggable={false}
              />

              {/* Play affordance, so a video item is not mistaken for a still. */}
              {item.kind === 'video' && (
                <span
                  className={`pointer-events-none absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/60 text-sm text-white transition-opacity duration-500 ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                  aria-hidden="true"
                >
                  ▶
                </span>
              )}

              {/* Caption sits on the card so the frame stays self-describing
                  when the track is scrolled with the keyboard. */}
              <span
                className={`pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5 text-left text-xs uppercase tracking-[0.2em] transition-opacity duration-500 ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <span className="text-text">{item.title}</span>
              </span>
            </button>
          )
        })}
      </div>

      {/* Counter and progress. */}
      <div className="mx-auto mt-10 max-w-[1600px] px-5 md:px-[3.75rem]">
        <div className="flex items-center gap-6">
          <span className="font-display text-xs not-italic tabular-nums text-muted">
            {String(logicalIndex + 1).padStart(2, '0')}
            <span className="mx-1 text-muted/60">/</span>
            {String(count).padStart(2, '0')}
          </span>

          <div
            className="h-px flex-1 bg-stroke"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={count}
            aria-valuenow={logicalIndex + 1}
            aria-label="Gallery position"
          >
            <div
              className="h-px bg-text transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <span className="hidden text-xs uppercase tracking-[0.2em] text-muted sm:block">
            {activeItem.title}
          </span>
        </div>
      </div>

      {/* Mounts nothing until opened. Navigating inside it also moves the track
          underneath, so closing leaves the carousel on the item last looked at. */}
      <MediaLightbox
        items={gallery.items}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={(next) => {
          setLightboxIndex(next)
          scrollToIndex(count + next, 'auto')
        }}
      />
    </section>
  )
}
