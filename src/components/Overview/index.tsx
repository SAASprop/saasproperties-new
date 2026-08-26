import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { PROPERTY } from '../../lib/property'
import { useMotionDisabled } from '../../lib/motion'
import './styles.css'

gsap.registerPlugin(ScrollTrigger, SplitText)

const { overview } = PROPERTY


export function Overview() {
  const root = useRef<HTMLElement>(null)
  const reducedMotion = useMotionDisabled()

  useLayoutEffect(() => {
    // The stylesheet leaves everything visible under reduced motion, so there is
    // nothing to reveal and no ScrollTriggers to install.
    if (reducedMotion) return

    const ctx = gsap.context(() => {}, root)
    let cancelled = false
    let splits: SplitText[] = []

    /**
     * Every trigger here is `once: true`, so it must not be created until the
     * layout it measures against is final. Two things would otherwise make the
     * whole section measure as already on screen and fire at load:
     *  - Vite injects imported CSS through JS in dev, so at useLayoutEffect time
     *    the hero has no height and this section sits at the top of the page.
     *  - Webfonts reflow the heading after they swap.
     * A refresh cannot undo a `once` trigger that already fired, so the fix is
     * to build them late rather than to correct them afterwards.
     */
    const layoutSettled = Promise.all([
      document.fonts.ready,
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
    ])

    void layoutSettled.then(() => {
      if (cancelled) return
      ctx.add(() => {
        buildAnimations()
        ScrollTrigger.refresh()
      })
    })

    function buildAnimations() {
      // Dark panel wipes upward off the image.
      gsap.utils.toArray<HTMLElement>('[data-anim="img-overlay"]').forEach((el) => {
        gsap.set(el, { visibility: 'visible', yPercent: 0 })
        gsap.to(el, {
          yPercent: -101,
          duration: 1.4,
          ease: 'expo.inOut',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        })
      })

      // Image drifts against the scroll. Held at a constant overscale so the
      // translate can never pull an edge into frame.
      gsap.utils.toArray<HTMLElement>('[data-anim="img-parallax"]').forEach((el) => {
        gsap.fromTo(
          el,
          { yPercent: -6, scale: 1.15 },
          {
            yPercent: 6,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 },
          },
        )
      })

      // Fade and rise.
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

      // Masked line-by-line heading reveal.
      splits = gsap.utils.toArray<HTMLElement>('[data-anim="split"]').map((el) => {
        gsap.set(el, { visibility: 'visible' })
        const split = new SplitText(el, {
          type: 'lines',
          linesClass: 'ov-line',
          mask: 'lines',
        })
        gsap.from(split.lines, {
          yPercent: 100,
          duration: 1.4,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        })
        return split
      })
    }

    return () => {
      cancelled = true
      splits.forEach((split) => split.revert())
      ctx.revert()
    }
  }, [reducedMotion])

  return (
    <section
      id="overview"
      ref={root}
      className="bg-bg pb-10 pt-24 md:pb-12 md:pt-32 lg:pb-14 lg:pt-40"
      aria-label="Overview"
    >
      {/* Same container as the navbar and the hero, so every left edge lines up. */}
      <div className="mx-auto max-w-[1600px] px-5 md:px-[3.75rem]">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Caption + heading */}
          <div className="lg:col-span-4">
            <p data-anim="element" className="ov-hide eyebrow">
              {overview.caption}
            </p>
            <h2
              data-anim="split"
              className="ov-hide mt-6 font-display text-3xl uppercase leading-[1.15] tracking-[-0.02em] text-text sm:text-4xl lg:mt-10 lg:text-[2.75rem]"
            >
              {overview.heading.map((part) => (
                <span key={part.text} className={part.italic ? 'italic' : 'not-italic'}>
                  {part.text}{' '}
                </span>
              ))}
            </h2>
          </div>

          {/* Portrait image with the wipe panel over it */}
          <div className="relative aspect-[2/3] overflow-hidden lg:col-span-4">
            <img
              src={overview.image.src}
              alt={overview.image.alt}
              loading="lazy"
              decoding="async"
              data-anim="img-parallax"
              className="h-full w-full object-cover will-change-transform"
            />
            {/* No fade here on purpose. This is a framed editorial portrait in
                a grid column, not a plate behind the page — its rectangle is
                the composition, and its side edges line up with the columns
                either side of it. Softening only its top and bottom would have
                left it neither one thing nor the other. The fades belong to the
                sections whose image *is* the background. */}
            <div
              data-anim="img-overlay"
              // Sits 1% outside the frame so no hairline of image shows above it
              // before the wipe starts.
              className="ov-hide absolute inset-x-0 -top-[1%] h-[101%] bg-bg"
            />
          </div>

          {/* Body copy */}
          <div className="flex flex-col gap-6 lg:col-span-3 lg:col-start-10 lg:justify-end lg:pb-2">
            {overview.body.map((paragraph) => (
              <p
                key={paragraph}
                data-anim="element"
                className="ov-hide text-base leading-relaxed tracking-[0.02em] text-muted"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
