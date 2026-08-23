import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PROPERTY } from '../../lib/property'
import { FeatureGlyph } from '../FeatureGlyph'
import { useMotionDisabled } from '../../lib/motion'
import './styles.css'

gsap.registerPlugin(ScrollTrigger)

const { features } = PROPERTY

export function Features() {
  const root = useRef<HTMLElement>(null)
  const reducedMotion = useMotionDisabled()

  useLayoutEffect(() => {
    if (reducedMotion) return

    const ctx = gsap.context(() => {}, root)
    let cancelled = false

    // Same reason as the other sections: these triggers are `once: true`, and one
    // built before the CSS lands or the webfont swaps measures against the wrong
    // layout and fires immediately. A refresh cannot un-fire it.
    const layoutSettled = Promise.all([
      document.fonts.ready,
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
    ])

    void layoutSettled.then(() => {
      if (cancelled) return
      ctx.add(() => {
        // Dark panel wipes upward off the background image.
        gsap.utils.toArray<HTMLElement>('[data-anim="img-overlay"]').forEach((el) => {
          gsap.set(el, { visibility: 'visible', yPercent: 0 })
          gsap.to(el, {
            yPercent: -101,
            duration: 1.4,
            ease: 'expo.inOut',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          })
        })

        // Background drifts against the scroll, held at a constant overscale so
        // the translate can never pull an edge into frame.
        gsap.utils.toArray<HTMLElement>('[data-anim="img-parallax"]').forEach((el) => {
          gsap.fromTo(
            el,
            { yPercent: -6, scale: 1.15 },
            {
              yPercent: 6,
              ease: 'none',
              scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 1 },
            },
          )
        })

        // Intro copy fades up.
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

        // Cards rise in, staggered. Batched per row rather than one trigger for
        // all twelve, so a card near the bottom of a tall grid still animates as
        // it arrives instead of having finished long before it is reached.
        ScrollTrigger.batch('[data-anim="stagger"]', {
          start: 'top 92%',
          once: true,
          batchMax: 4,
          onEnter: (batch) => {
            gsap.set(batch, { visibility: 'visible' })
            gsap.from(batch, {
              opacity: 0,
              y: 48,
              duration: 1,
              ease: 'power3.out',
              stagger: 0.09,
            })
          },
        })

        ScrollTrigger.refresh()
      })
    })

    return () => {
      cancelled = true
      ctx.revert()
    }
  }, [reducedMotion])

  return (
    <section
      id="features"
      ref={root}
      className="full-bleed relative isolate overflow-hidden bg-bg py-24 lg:py-16"
      aria-label="Features"
    >
      {/* Full-bleed background. Sits behind everything via a negative z-index
          inside the section's own isolation, so it never escapes upward. */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div data-anim="img-parallax" className="h-full w-full will-change-transform">
          <img
            src={features.image.src}
            alt={features.image.alt}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
        {/* Darkens the plate so white copy holds over any part of the photo. The
            cards blur what shows through here, so this is also what stops the
            frosted panels turning milky over the bright sky.

            This used to run from bg/90 through bg/55 and back, which held the
            copy but left a tenth of the photograph showing at the very top and
            bottom edges — a bright strip meeting the black section either side.
            The scrim across the middle is unchanged at 0.55; only the two ends
            now resolve the whole way to the page's ground. */}
        <div
          className="img-fade-y"
          style={{ '--fade-scrim': 0.55, '--fade-edge': 0.93 } as React.CSSProperties}
        />
        <div
          data-anim="img-overlay"
          className="ft-hide absolute inset-x-0 -top-[1%] h-[101%] bg-bg"
        />
      </div>

      <div className="mx-auto max-w-[1600px] px-5 md:px-[3.75rem]">
        {/* Header and intro */}
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <p data-anim="element" className="ft-hide eyebrow">
              {features.caption}
            </p>
            <h2
              data-anim="element"
              className="ft-hide mt-4 font-display text-3xl uppercase leading-[1.1] tracking-[-0.02em] text-text sm:text-4xl lg:mt-6 lg:text-[2.75rem]"
            >
              {features.heading}
            </h2>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-5 lg:col-start-8 lg:pt-2">
            {features.intro.map((paragraph) => (
              <p
                key={paragraph}
                data-anim="element"
                className="ft-hide text-base leading-relaxed tracking-[0.02em] text-muted"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Cards. Two up on a phone, then three, then four — the count is
            whatever the data holds, so adding an amenity needs no layout work. */}
        <ul className="mt-14 grid list-none grid-cols-2 gap-3 p-0 sm:gap-4 md:grid-cols-3 lg:mt-12 lg:grid-cols-4 lg:gap-4">
          {features.items.map((item, index) => (
            <li
              key={item.name}
              data-anim="stagger"
              className="ft-hide group relative min-h-[9.5rem] overflow-hidden border border-stroke bg-white/[0.05] backdrop-blur-md transition-colors duration-500 hover:border-white/25 hover:bg-white/[0.09] sm:min-h-[11rem] lg:min-h-[8.5rem]"
            >
              {/* Pinned rather than in the flow, so it cannot shift the centred
                  block off centre. */}
              <span className="absolute left-5 top-5 font-display text-[11px] not-italic tabular-nums text-muted">
                ( {String(index + 1).padStart(2, '0')} )
              </span>

              {/* Icon and name centred on both axes. The padding-top clears the
                  ordinal so a long name never runs under it. */}
              <div className="flex h-full flex-col items-center justify-center gap-3 px-4 pb-5 pt-10 text-center sm:gap-4 sm:px-5">
                <FeatureGlyph
                  icon={item.icon}
                  className="h-7 w-7 shrink-0 text-text transition-transform duration-500 group-hover:-translate-y-0.5 sm:h-8 sm:w-8"
                />
                <h3 className="m-0 max-w-[18ch] font-display text-sm font-normal not-italic leading-snug text-text sm:text-base">
                  {item.name}
                </h3>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
