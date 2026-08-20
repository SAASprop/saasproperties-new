import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PROPERTY } from '../lib/property'
import { FloorPlanDrawing } from './FloorPlanDrawing'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import './floor-plans.css'

gsap.registerPlugin(ScrollTrigger)

const { floorPlans } = PROPERTY

export function FloorPlans() {
  const root = useRef<HTMLElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  const [active, setActive] = useState(0)

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
          <div className="lg:col-span-4">
            <p data-anim="element" className="ct-hide eyebrow">
              {floorPlans.caption}
            </p>
            <h2
              id="floor-plan-heading"
              data-anim="element"
              className="ct-hide mt-4 font-display text-4xl italic leading-[1.05] text-text sm:text-5xl"
            >
              {floorPlans.heading}
            </h2>
            <p
              data-anim="element"
              className="ct-hide mt-5 text-base leading-relaxed tracking-[0.02em] text-muted"
            >
              {floorPlans.intro}
            </p>

            {/* Layout picker. A list of buttons rather than a tab widget: each
                one only swaps the drawing beside it, and radio semantics would
                promise a form control this is not. */}
            <ul
              data-anim="element"
              className="ct-hide mt-10 list-none border-t border-stroke p-0"
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
                      <span className="flex items-center gap-4">
                        <span className="font-display text-[10px] not-italic tabular-nums text-muted">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span
                          className={`font-display text-lg not-italic transition-colors duration-300 sm:text-xl ${
                            isActive ? 'text-text' : 'text-muted group-hover:text-text'
                          }`}
                        >
                          {plan.label}
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
            <div data-anim="element" className="ct-hide mt-10 flex flex-col gap-3 sm:flex-row lg:flex-col">
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

          {/* Right: the drawing. */}
          <div className="lg:col-span-8">
            <div className="fp-frame relative aspect-[4/3] overflow-hidden border border-stroke bg-surface/40 sm:aspect-[16/10]">
              {current.image ? (
                <img
                  src={current.image}
                  alt={`${current.label} floor plan, ${PROPERTY.name}`}
                  className="h-full w-full object-contain p-6 sm:p-10"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                // No supplied drawing: show the indicative schematic. It is
                // keyed so React swaps the element on change, which lets the
                // fade below run per layout instead of once.
                <div key={current.drawing} className="fp-plan absolute inset-0 p-5 sm:p-9">
                  <FloorPlanDrawing
                    drawing={current.drawing}
                    className="h-full w-full text-text"
                  />
                </div>
              )}

              {/* Layout name, over the drawing rather than in it, so the SVG
                  stays generic and reusable. */}
              <span className="pointer-events-none absolute left-5 top-5 font-display text-sm italic text-muted sm:left-7 sm:top-7 sm:text-base">
                {current.label}
              </span>

              {/* Reveal panel. */}
              <div
                data-anim="plan-reveal"
                aria-hidden="true"
                className="ct-hide pointer-events-none absolute inset-x-0 -top-[1%] h-[101%] bg-bg"
              />
            </div>

            <p className="mt-4 text-[11px] leading-relaxed text-muted">
              {floorPlans.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
