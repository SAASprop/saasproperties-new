import { useLayoutEffect, useRef, useState } from 'react'
import { ArrowUpRight, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PROPERTY } from '../../lib/property'
import { MediaLightbox, type LightboxMedia } from '../MediaLightbox'
import { DocumentGate, type GatedDocument } from '../DocumentGate'
import { useMotionDisabled } from '../../lib/motion'
import './styles.css'

gsap.registerPlugin(ScrollTrigger)

const { floorPlans } = PROPERTY

export function FloorPlans() {
  const root = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useMotionDisabled()
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  /** The document a visitor has asked for, and so the gate to show. */
  const [gated, setGated] = useState<GatedDocument | null>(null)

  useLayoutEffect(() => {
    if (reducedMotion) return

    const ctx = gsap.context(() => {}, root)
    let cancelled = false

    // As elsewhere on the page: these triggers are `once: true`, and one built
    // before the CSS lands or the webfont swaps measures against the wrong
    // layout and fires immediately, which a later refresh cannot undo.
    const layoutSettled = Promise.all([
      document.fonts.ready,
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
    ])

    void layoutSettled.then(() => {
      if (cancelled) return
      ctx.add(() => {
        gsap.utils.toArray<HTMLElement>('[data-anim="element"]').forEach((el) => {
          gsap.set(el, { visibility: 'visible' })
          gsap.from(el, {
            opacity: 0,
            y: 40,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          })
        })


        ScrollTrigger.refresh()
      })
    })

    return () => {
      cancelled = true
      ctx.revert()
    }
  }, [reducedMotion])

  /**
   * The sheets are dense enough to want a full-screen read, so they reuse the
   * gallery's viewer. Only layouts that actually have a drawing go in.
   */
  const withPlans = floorPlans.plans.filter(
    (plan): plan is (typeof floorPlans.plans)[number] & { image: string } =>
      Boolean(plan.image),
  )

  const viewerItems: LightboxMedia[] = withPlans.map((plan) => ({
    kind: 'image',
    src: plan.image,
    title: `${plan.label} — ${plan.totalSqft} sq ft`,
    alt: `${plan.label} floor plan, ${PROPERTY.name}`,
  }))

  /** Which layout the carousel opens on. */
  const initialIndex = Math.min(1, Math.max(withPlans.length - 1, 0))

  /**
   * Move one card, wrapping round at either end.
   *
   * Positions are read from live rects rather than offsetLeft: the cards' offset
   * parent is the shell, not the track, so offsetLeft would be measured from the
   * wrong origin and every step would land short by the shell's own padding.
   *
   * Where it is now is worked out from the scroll position instead of being kept
   * in state, so dragging the track, pressing a dot and pressing an arrow all
   * agree about which card is current — with a counter they drift apart the first
   * time the visitor swipes.
   */
  const step = (direction: 1 | -1) => {
    const track = trackRef.current
    if (!track) return

    const cards = Array.from(track.children) as HTMLElement[]
    if (cards.length === 0) return

    const centreOf = (el: Element) => {
      const rect = el.getBoundingClientRect()
      return rect.left + rect.width / 2
    }
    const middle = centreOf(track)

    let current = 0
    let best = Infinity
    cards.forEach((card, index) => {
      const distance = Math.abs(centreOf(card) - middle)
      if (distance < best) {
        best = distance
        current = index
      }
    })

    const target = cards[(current + direction + cards.length) % cards.length]
    track.scrollTo({
      left: track.scrollLeft + (centreOf(target) - middle),
      behavior: reducedMotion ? 'auto' : 'smooth',
    })
  }

  return (
    <section
      id="floor-plan"
      ref={root}
      className="bg-bg py-24 lg:py-16"
      aria-labelledby="floor-plan-heading"
    >
      <div className="mx-auto max-w-[1600px] px-5 md:px-[3.75rem]">
        {/* Header: heading left, intro in its own measure right. */}
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p data-anim="element" className="fp-hide eyebrow">
              {floorPlans.caption}
            </p>
            <h2
              id="floor-plan-heading"
              data-anim="element"
              className="fp-hide mt-4 font-display text-4xl italic leading-[1.05] text-text sm:text-5xl"
            >
              {floorPlans.heading}
            </h2>
          </div>

          <div className="lg:col-span-5 lg:col-start-8 lg:pt-3">
            <p
              data-anim="element"
              className="fp-hide text-base leading-relaxed tracking-[0.02em] text-muted"
            >
              {floorPlans.intro}
            </p>
          </div>
        </div>

        {/* The carousel. The dots and the active-card treatment are still the
            browser's own — ::scroll-marker and a scroll-state() query — but the
            arrows are not: ::scroll-button disables itself at each end, so the
            track could only ever be walked to a stop and back. These wrap. */}
        <div
          data-anim="element"
          className="fp-carousel-shell fp-hide relative mx-auto mt-10 w-full max-w-[60rem] sm:px-14 lg:mt-12"
        >
          <button
            type="button"
            onClick={() => step(-1)}
            className="fp-arrow left-0"
            aria-label="Previous layout"
          >
            <ChevronLeft size={18} strokeWidth={1.25} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            className="fp-arrow right-0"
            aria-label="Next layout"
          >
            <ChevronRight size={18} strokeWidth={1.25} aria-hidden="true" />
          </button>

          <div
            ref={trackRef}
            className="fp-carousel"
            role="group"
            aria-label={`${floorPlans.plans.length} layouts`}
          >
            {floorPlans.plans.map((plan, index) => {
              const viewerIndex = withPlans.findIndex((p) => p.label === plan.label)
              return (
                <div
                  key={plan.label}
                  className={index === initialIndex ? 'fp-start' : undefined}
                >
                  <div className="fp-plate">
                    {plan.image ? (
                      <button
                        type="button"
                        onClick={() => setViewerIndex(viewerIndex)}
                        className="group relative block h-full w-full overflow-hidden border border-stroke bg-surface/40"
                        aria-label={`Enlarge the ${plan.label} floor plan`}
                      >
                        <img
                          src={plan.image}
                          alt={`${plan.label} floor plan, ${PROPERTY.name}`}
                          className="fp-sheet"
                          loading={index <= initialIndex + 1 ? 'eager' : 'lazy'}
                          decoding="async"
                        />
                        <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-bg/90 to-transparent pb-3 pt-9 text-[10px] uppercase tracking-[0.25em] text-text opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                          Enlarge
                        </span>
                      </button>
                    ) : (
                      // A layout with no sheet yet. Nothing is invented for it.
                      <div className="grid h-full w-full place-items-center border border-stroke bg-surface/40 px-5 text-center">
                        <p className="text-sm leading-relaxed text-muted">
                          Plan drawing to follow.
                        </p>
                      </div>
                    )}
                  </div>

                  <h3 className="fp-name m-0 font-display text-xl not-italic text-text sm:text-2xl">
                    {plan.label}
                  </h3>
                  <p className="fp-meta text-[11px] uppercase tracking-[0.14em] text-muted">
                    {plan.baths} bath · {plan.totalSqm} m² · {plan.totalSqft} sq ft
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Documents and the standing disclaimer. */}
        <div className="mt-4 flex flex-col items-center gap-6">
          <div
            data-anim="element"
            className="fp-hide flex w-full max-w-xl flex-col gap-3 sm:flex-row"
          >
            {floorPlans.downloads.map((doc) =>
              doc.url ? (
                <button
                  key={doc.label}
                  type="button"
                  onClick={() => setGated({ label: doc.label, url: doc.url as string })}
                  className="flex flex-1 items-center justify-center gap-2 border border-champagne bg-champagne whitespace-nowrap px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-bg transition-colors duration-300 hover:border-white hover:bg-white"
                >
                  {doc.label}
                  <Download size={14} strokeWidth={1.25} aria-hidden="true" />
                </button>
              ) : (
                // No file yet: send the visitor to the enquiry form rather than
                // hand them a link that would 404.
                <a
                  key={doc.label}
                  href={`#${PROPERTY.cta.targetId}`}
                  className="flex flex-1 items-center justify-center gap-2 border border-champagne/60 whitespace-nowrap px-6 py-4 text-[11px] font-medium uppercase tracking-[0.14em] text-text transition-colors duration-300 hover:border-champagne hover:bg-champagne hover:text-bg"
                >
                  {doc.requestLabel}
                  <ArrowUpRight size={14} strokeWidth={1.25} aria-hidden="true" />
                </a>
              ),
            )}
          </div>

          <p className="max-w-md text-center text-[11px] leading-relaxed text-muted">
            {floorPlans.disclaimer}
          </p>
        </div>
      </div>

      {/* Both mount nothing until they are opened. */}
      <DocumentGate document={gated} onClose={() => setGated(null)} />

      <MediaLightbox
        items={viewerItems}
        index={viewerIndex}
        onClose={() => setViewerIndex(null)}
        onNavigate={setViewerIndex}
      />
    </section>
  )
}
