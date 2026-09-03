import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PROPERTY } from '../../lib/property'
import { useMotionDisabled } from '../../lib/motion'
import './styles.css'

gsap.registerPlugin(ScrollTrigger)

const { timeline } = PROPERTY

/**
 * The house's record, as a drawn line.
 *
 * An editorial spread rather than a card list: each milestone is a photograph on
 * one side and a short passage on the other, alternating across a hairline that
 * draws itself as the page moves. The year is the only ornament, and it sits on
 * the line as a marker that lights when its milestone is the one being read.
 *
 * Layout is a three-column grid on desktop — image, rule, text — with the two
 * outer columns swapping per row. Below 1024px it collapses to a single column
 * with the rule pinned to the left edge, which is the arrangement that survives
 * a phone without the alternation turning into a zigzag.
 */
export function Timeline() {
  const root = useRef<HTMLElement>(null)
  const reducedMotion = useMotionDisabled()

  useLayoutEffect(() => {
    if (reducedMotion) return

    const ctx = gsap.context(() => {}, root)
    let cancelled = false
    /** Owned here rather than by the context, so cleanup is unambiguous. */
    let mm: ReturnType<typeof gsap.matchMedia> | undefined

    // Same reason as every other section on this page: these triggers are
    // `once: true`, and one built before the CSS lands or the webfont swaps
    // measures against the wrong layout and fires immediately. A later refresh
    // cannot un-fire it.
    const layoutSettled = Promise.all([
      document.fonts.ready,
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
    ])

    void layoutSettled.then(() => {
      if (cancelled) return

      ctx.add(() => {
        const section = root.current
        if (!section) return

        // --- Heading ------------------------------------------------------
        gsap.utils.toArray<HTMLElement>('[data-tl="head"]', section).forEach((el, i) => {
          gsap.set(el, { visibility: 'visible' })
          gsap.from(el, {
            opacity: 0,
            y: 34,
            duration: 1.1,
            delay: i * 0.08,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          })
        })

        // --- The rule draws itself ----------------------------------------
        // Scrubbed rather than fired: the line is a progress indicator, so it
        // has to track the scroll position instead of playing once.
        const rail = section.querySelector<HTMLElement>('[data-tl="rail-fill"]')
        const list = section.querySelector<HTMLElement>('[data-tl="list"]')
        if (rail && list) {
          gsap.set(rail, { transformOrigin: 'top center', scaleY: 0 })
          gsap.to(rail, {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: list,
              // Starts as the first milestone reaches the reading line and
              // finishes on the last, so the line is never ahead of the content.
              start: 'top 70%',
              end: 'bottom 72%',
              scrub: 0.6,
            },
          })
        }

        // --- Milestones ----------------------------------------------------
        gsap.utils.toArray<HTMLElement>('[data-tl="item"]', section).forEach((item) => {
          const frame = item.querySelector<HTMLElement>('[data-tl="frame"]')
          const media = item.querySelector<HTMLElement>('[data-tl="media"]')
          const marker = item.querySelector<HTMLElement>('[data-tl="marker"]')
          const copy = gsap.utils.toArray<HTMLElement>('[data-tl="line"]', item)

          gsap.set(item, { visibility: 'visible' })

          const reveal = gsap.timeline({
            defaults: { ease: 'expo.out' },
            scrollTrigger: { trigger: item, start: 'top 78%', once: true },
          })

          // The photograph uncovers from its lower edge while the image itself
          // settles back from an overscale — two speeds in one gesture, which is
          // what stops it reading as a plain fade.
          if (frame) {
            reveal.fromTo(
              frame,
              { clipPath: 'inset(0% 0% 100% 0%)' },
              { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5 },
              0,
            )
          }
          if (media) {
            reveal.fromTo(media, { scale: 1.18 }, { scale: 1, duration: 1.9 }, 0)
          }

          reveal.fromTo(
            copy,
            { opacity: 0, y: 26 },
            { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, ease: 'power3.out' },
            0.25,
          )

          if (marker) {
            reveal.fromTo(marker, { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.9 }, 0.15)
          }

          // Which milestone is being read. Toggled on a band around the middle
          // of the viewport so exactly one is lit at a time on the way down and
          // on the way back up.
          ScrollTrigger.create({
            trigger: item,
            start: 'top 55%',
            end: 'bottom 45%',
            onToggle: ({ isActive }) => item.setAttribute('data-current', String(isActive)),
          })
        })

        // --- Parallax, desktop only ---------------------------------------
        // matchMedia so the tween is built and reverted with the breakpoint
        // rather than merely being inert below it: on a phone the extra
        // scroll-linked transform is cost with nothing to show for it, since
        // the frames are close to full width and barely drift.
        mm = gsap.matchMedia()
        mm.add('(min-width: 1024px)', () => {
          const drifts = gsap.utils.toArray<HTMLElement>('[data-tl="media"]', section)
          drifts.forEach((el) => {
            gsap.fromTo(
              el,
              { yPercent: -4 },
              {
                yPercent: 4,
                ease: 'none',
                scrollTrigger: {
                  trigger: el.closest('[data-tl="item"]'),
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: true,
                },
              },
            )
          })
        })

        ScrollTrigger.refresh()
      })
    })

    return () => {
      cancelled = true
      mm?.revert()
      ctx.revert()
    }
  }, [reducedMotion])

  return (
    <section
      id="legacy"
      ref={root}
      className="tl-section full-bleed"
      aria-labelledby="legacy-heading"
    >
      <div className="mx-auto max-w-[1600px] px-5 md:px-[3.75rem]">
        {/* Header. Held to the left two-thirds so the measure stays readable
            on a wide monitor instead of running the full 1600px. */}
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p data-tl="head" className="tl-hide eyebrow">
              {timeline.caption}
            </p>
            <h2
              id="legacy-heading"
              data-tl="head"
              className="tl-hide tl-heading mt-5 font-display text-text"
            >
              {timeline.heading}
            </h2>
          </div>
          <div className="lg:col-span-4 lg:col-start-9 lg:pt-3">
            <p
              data-tl="head"
              className="tl-hide text-base leading-relaxed tracking-[0.02em] text-muted"
            >
              {timeline.intro}
            </p>
          </div>
        </div>

        {/* The rule, and the lit length of it. One element for the whole
            column rather than a segment per row, so the draw is continuous
            across the gaps between milestones. It wraps the list rather than
            sitting inside it: a <div> is not a permitted child of <ol>, and as
            the first child it also shifted every :nth-child by one, which
            reversed the alternation. */}
        <div className="tl-spread">
          <div className="tl-rail" aria-hidden="true">
            <span data-tl="rail-fill" className="tl-rail-fill" />
          </div>

          {/* `ol` because the order is the meaning. */}
          <ol data-tl="list" className="tl-list">
            {timeline.milestones.map((milestone, index) => (
            <li
              key={milestone.year}
              data-tl="item"
              data-current="false"
              className="tl-item tl-hide"
            >
              <figure className="tl-figure">
                <span data-tl="frame" className="tl-frame">
                  <img
                    data-tl="media"
                    src={milestone.image.src}
                    alt={milestone.image.alt}
                    // Height is reserved by the frame's aspect-ratio in CSS, so
                    // these never shift the page as they arrive.
                    width={1600}
                    height={1000}
                    loading="lazy"
                    decoding="async"
                    className="tl-media"
                  />
                </span>
              </figure>

              {/* The marker sits on the rule, between the two columns. */}
              <span data-tl="marker" className="tl-marker" aria-hidden="true">
                <span className="tl-marker-dot" />
              </span>

              <div className="tl-copy">
                <p data-tl="line" className="tl-year">
                  {milestone.year}
                </p>
                <h3 data-tl="line" className="tl-title font-display text-text">
                  {milestone.title}
                </h3>
                <p data-tl="line" className="tl-body">
                  {milestone.body}
                </p>
                <p data-tl="line" className="tl-index" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                  <span className="tl-index-sep">/</span>
                  {String(timeline.milestones.length).padStart(2, '0')}
                </p>
              </div>
            </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
