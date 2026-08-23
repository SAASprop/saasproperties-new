import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PROPERTY } from '../../lib/property'
import { MediaLightbox, type LightboxMedia } from '../MediaLightbox'
import { useMotionDisabled } from '../../lib/motion'
import './styles.css'

gsap.registerPlugin(ScrollTrigger)

const { floorPlans } = PROPERTY

export function FloorPlans() {
  const root = useRef<HTMLElement>(null)
  const reducedMotion = useMotionDisabled()
  const [active, setActive] = useState(0)
  const [viewerOpen, setViewerOpen] = useState(false)

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

        // The plan frame is uncovered by a wipe, the same reveal the other
        // media panels on the page use.
        gsap.utils.toArray<HTMLElement>('[data-anim="plan-reveal"]').forEach((el) => {
          gsap.set(el, { visibility: 'visible', yPercent: 0 })
          gsap.to(el, {
            yPercent: -101,
            duration: 1.5,
            ease: 'expo.inOut',
            scrollTrigger: { trigger: el, start: 'top 82%', once: true },
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

  const current = floorPlans.plans[active]

  /**
   * The sheets are dense enough to want a full-screen read, so they reuse the
   * gallery's viewer. Every layout with a drawing goes in, which also lets the
   * viewer step between layouts.
   */
  const viewerItems: LightboxMedia[] = floorPlans.plans
    .filter((plan): plan is typeof plan & { image: string } => Boolean(plan.image))
    .map((plan) => ({
      kind: 'image',
      src: plan.image,
      title: `${plan.label} — ${plan.totalSqft} sq ft`,
      alt: `${plan.label} floor plan, ${PROPERTY.name}`,
    }))

  /** Where `active` sits within the drawings that actually exist. */
  const viewerIndex = floorPlans.plans
    .slice(0, active)
    .filter((plan) => plan.image).length

  return (
    <section
      id="floor-plan"
      ref={root}
      className="overflow-hidden bg-bg py-24 lg:py-28"
      aria-labelledby="floor-plan-heading"
    >
      <div className="mx-auto max-w-[1600px] px-5 md:px-[3.75rem]">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left: heading, layout picker, documents. */}
          <div className="lg:col-span-6">
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
            <p
              data-anim="element"
              className="fp-hide mt-5 text-base leading-relaxed tracking-[0.02em] text-muted"
            >
              {floorPlans.intro}
            </p>

            {/* Layout picker. A list of buttons rather than a tab widget: each
                one only swaps the drawing beside it, and radio semantics would
                promise a form control this is not. */}
            <ul
              data-anim="element"
              className="fp-hide mt-10 list-none border-t border-stroke p-0"
            >
              {floorPlans.plans.map((plan, index) => {
                const isActive = index === active
                return (
                  <li key={plan.label} className="border-b border-stroke">
                    <button
                      type="button"
                      onClick={() => setActive(index)}
                      aria-current={isActive ? 'true' : undefined}
                      className="group flex w-full items-center justify-between gap-4 py-4 text-left"
                    >
                      <span className="flex items-baseline gap-4">
                        <span className="font-display text-[10px] not-italic tabular-nums text-muted">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span>
                          <span
                            className={`block font-display text-lg not-italic transition-colors duration-300 sm:text-xl ${
                              isActive ? 'text-text' : 'text-muted group-hover:text-text'
                            }`}
                          >
                            {plan.label}
                          </span>
                          {/* Areas come off the drawing itself, so the list and
                              the sheet always agree. */}
                          <span className="mt-1 block text-[11px] uppercase tracking-[0.12em] text-muted">
                            {plan.baths} bath · {plan.totalSqm} m² · {plan.totalSqft} sq ft
                          </span>
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        className={`h-px transition-all duration-500 ${
                          isActive ? 'w-8 bg-champagne' : 'w-4 bg-stroke group-hover:w-6'
                        }`}
                      />
                    </button>
                  </li>
                )
              })}
            </ul>

            {/* Documents. */}
            <div data-anim="element" className="fp-hide mt-10 flex flex-col gap-3 sm:flex-row lg:flex-col">
              {floorPlans.downloads.map((doc) =>
                doc.url ? (
                  <a
                    key={doc.label}
                    href={doc.url}
                    download
                    className="flex flex-1 items-center justify-center gap-2 border border-champagne/40 px-5 py-4 text-[11px] uppercase tracking-[0.2em] text-text transition-colors duration-300 hover:border-champagne hover:bg-champagne hover:text-bg"
                  >
                    {doc.label}
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M12 4v11m0 0 4-4m-4 4-4-4M5 19h14" />
                    </svg>
                  </a>
                ) : (
                  // No file yet: send the visitor to the enquiry form instead of
                  // handing them a link that would 404.
                  <a
                    key={doc.label}
                    href={`#${PROPERTY.cta.targetId}`}
                    className="flex flex-1 items-center justify-center gap-2 border border-stroke px-5 py-4 text-[11px] uppercase tracking-[0.2em] text-muted transition-colors duration-300 hover:border-champagne/60 hover:text-text"
                  >
                    {doc.requestLabel}
                    <span aria-hidden="true">↗</span>
                  </a>
                ),
              )}
            </div>
          </div>

          {/* Right: the drawing. The sheets are 9:16 portrait, so the frame
              takes that ratio and is capped in width — a landscape frame would
              letterbox a tall sheet down to a strip. */}
          <div className="lg:col-span-5 lg:col-start-8">
            {current.image ? (
              <button
                type="button"
                onClick={() => setViewerOpen(true)}
                className="fp-frame group relative mx-auto block aspect-[9/16] w-full max-w-[19rem] overflow-hidden border border-stroke bg-surface/40 sm:max-w-[21rem]"
                aria-label={`Enlarge the ${current.label} floor plan`}
              >
                <img
                  key={current.image}
                  src={current.image}
                  alt={`${current.label} floor plan, ${PROPERTY.name}`}
                  className="fp-plan h-full w-full object-contain"
                  loading="lazy"
                  decoding="async"
                />

                {/* Enlarge affordance. A sheet this detailed is meant to be
                    opened, and the viewer is already built. */}
                <span className="pointer-events-none absolute bottom-0 inset-x-0 flex items-center justify-center gap-2 bg-gradient-to-t from-bg/90 to-transparent pb-4 pt-10 text-[10px] uppercase tracking-[0.25em] text-text opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                  Enlarge
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    <path d="M9 4H4v5M15 20h5v-5M20 9V4h-5M4 15v5h5" />
                  </svg>
                </span>

                {/* Reveal panel. */}
                <span
                  data-anim="plan-reveal"
                  aria-hidden="true"
                  className="fp-hide pointer-events-none absolute inset-x-0 -top-[1%] block h-[101%] bg-bg"
                />
              </button>
            ) : (
              // A layout with no sheet yet. Nothing is invented in its place.
              <div className="fp-frame relative mx-auto grid aspect-[9/16] w-full max-w-[19rem] place-items-center border border-stroke bg-surface/40 px-6 text-center sm:max-w-[21rem]">
                <div>
                  <p className="font-display text-xl italic text-text">{current.label}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    Plan drawing to follow.
                  </p>
                  <a
                    href={`#${PROPERTY.cta.targetId}`}
                    className="mt-6 inline-block border border-champagne/40 px-5 py-3 text-[10px] uppercase tracking-[0.25em] text-text transition-colors duration-300 hover:bg-champagne hover:text-bg"
                  >
                    Request this layout
                  </a>
                </div>
              </div>
            )}

            <p className="mx-auto mt-4 max-w-[21rem] text-[11px] leading-relaxed text-muted">
              {floorPlans.disclaimer}
            </p>
          </div>

          {/* Mounts nothing until a sheet is opened. Stepping inside it also
              moves the picker, so closing leaves the layout last looked at. */}
          <MediaLightbox
            items={viewerItems}
            index={viewerOpen ? viewerIndex : null}
            onClose={() => setViewerOpen(false)}
            onNavigate={(next) => {
              // Every viewer item is an image here, but the union also covers
              // video, so narrow before reading src.
              const item = viewerItems[next]
              if (item?.kind !== 'image') return
              const target = floorPlans.plans.findIndex((plan) => plan.image === item.src)
              if (target >= 0) setActive(target)
            }}
          />
        </div>
      </div>
    </section>
  )
}
