import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useMotionDisabled } from '../../lib/motion'

gsap.registerPlugin(ScrollTrigger, SplitText)

/**
 * The motion system for /design-2.
 *
 * This route's premise is that the scroll IS the design, so almost everything
 * here is SCRUBBED — tied to scroll position rather than fired once when an
 * element arrives. A one-shot reveal is something the page does at you on
 * arrival and then never again; a scrubbed one runs forwards and backwards under
 * your hand, which is what makes a page feel driven rather than decorated.
 *
 * Roles, marked with `data-k`:
 *
 *   lines    heading split to lines, each rising out of its own mask on scroll
 *   words    heading split to words, revealing in sequence on scroll
 *   rise     fade and lift — supporting copy, fired once (scrubbing body text
 *            makes it unreadable while it moves)
 *   open     a clip-path opening from the bottom as the section passes
 *   drift    parallax, held oversized so no edge enters the frame
 *   rules    hairlines drawing out from their leading edge, in sequence
 *   count    a figure counting up to its final value
 *   track    letter-spacing tightening as the frame settles
 *
 * Plus one pinned move — the horizontal gallery — which is desktop-only and
 * lives behind `matchMedia`, because pinning a section on a phone fights the
 * one gesture a phone user has.
 *
 * Gated on the site's shared motion hook, so the Motion switch and the
 * reduced-motion preference both turn this route into a static page.
 */
export function useKinetic(root: RefObject<HTMLElement | null>) {
  const motionOff = useMotionDisabled()

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    if (motionOff) return

    let ctx: gsap.Context | undefined
    let cancelled = false

    // Trigger positions are measurements; taken before the display face lands
    // they are measurements of the fallback's line height.
    Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
    ]).then(() => {
      if (cancelled) return

      ctx = gsap.context(() => {
        const splits: SplitText[] = []

        /* --- Headings: split, then scrub each part into place --- */

        gsap.utils.toArray<HTMLElement>('[data-k="lines"]').forEach((node) => {
          const split = new SplitText(node, {
            type: 'lines',
            linesClass: 'd2-split-line',
            mask: 'lines',
          })
          splits.push(split)
          gsap.set(node, { visibility: 'visible' })
          gsap.from(split.lines, {
            yPercent: 115,
            stagger: 0.12,
            ease: 'none',
            scrollTrigger: {
              trigger: node,
              start: 'top 88%',
              end: 'top 42%',
              scrub: 0.6,
            },
          })
        })

        gsap.utils.toArray<HTMLElement>('[data-k="words"]').forEach((node) => {
          const split = new SplitText(node, { type: 'words', wordsClass: 'd2-split-word' })
          splits.push(split)
          gsap.set(node, { visibility: 'visible' })
          gsap.from(split.words, {
            opacity: 0.14,
            stagger: 0.06,
            ease: 'none',
            scrollTrigger: {
              trigger: node,
              start: 'top 82%',
              end: 'bottom 55%',
              scrub: 0.5,
            },
          })
        })

        /* --- Once-only reveals, for anything meant to be read --- */

        gsap.utils.toArray<HTMLElement>('[data-k="rise"]').forEach((node) => {
          gsap.set(node, { visibility: 'visible' })
          gsap.from(node, {
            opacity: 0,
            y: 30,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: { trigger: node, start: 'top 86%', once: true },
          })
        })

        /* --- Scrubbed frames --- */

        gsap.utils.toArray<HTMLElement>('[data-k="open"]').forEach((node) => {
          gsap.set(node, { visibility: 'visible' })
          gsap.fromTo(
            node,
            { clipPath: 'inset(88% 0% 0% 0%)' },
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              ease: 'none',
              scrollTrigger: {
                trigger: node,
                start: 'top 92%',
                end: 'top 34%',
                scrub: 0.7,
              },
            },
          )
        })

        gsap.utils.toArray<HTMLElement>('[data-k="drift"]').forEach((node) => {
          const scope = node.closest('[data-k-scope]') ?? node
          const distance = Number(node.dataset.kDrift ?? 14)
          gsap.fromTo(
            node,
            { yPercent: distance / 2 },
            {
              yPercent: -distance / 2,
              ease: 'none',
              scrollTrigger: {
                trigger: scope,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
              },
            },
          )
        })

        gsap.utils.toArray<HTMLElement>('[data-k="rules"]').forEach((node) => {
          const rules = node.querySelectorAll<HTMLElement>('[data-k-rule]')
          gsap.set(node, { visibility: 'visible' })
          gsap.from(rules, {
            scaleX: 0,
            stagger: 0.1,
            ease: 'none',
            scrollTrigger: {
              trigger: node,
              start: 'top 88%',
              end: 'top 48%',
              scrub: 0.6,
            },
          })
        })

        // The markup carries the FINAL figure, so a page with no motion reads
        // correctly — it is the animation that is the enhancement, not the
        // number. Zeroing it here, inside the motion-on path only, is what
        // stops it showing the answer for a frame before counting to it.
        gsap.utils.toArray<HTMLElement>('[data-k="count"]').forEach((node) => {
          const target = Number(node.dataset.kTo ?? 0)
          const pad = node.dataset.kPad === 'true'
          node.textContent = pad ? '00' : '0'
          const value = { n: 0 }
          gsap.to(value, {
            n: target,
            ease: 'none',
            scrollTrigger: {
              trigger: node,
              start: 'top 90%',
              end: 'top 55%',
              scrub: 0.5,
            },
            onUpdate: () => {
              const n = Math.round(value.n)
              node.textContent = pad ? String(n).padStart(2, '0') : String(n)
            },
          })
        })

        // Letter-spacing is not a compositor property, so this is the one place
        // layout is touched per frame. It is worth it exactly once, on the hero
        // wordmark, where the tightening is the whole gesture — and it is a
        // single short element, so the reflow is trivial.
        gsap.utils.toArray<HTMLElement>('[data-k="track"]').forEach((node) => {
          gsap.fromTo(
            node,
            { letterSpacing: '0.62em' },
            {
              letterSpacing: '0.34em',
              ease: 'none',
              scrollTrigger: { trigger: node, start: 'top 78%', end: 'top 34%', scrub: 0.8 },
            },
          )
        })

        /* --- The pinned horizontal gallery, desktop only --- */

        ScrollTrigger.matchMedia({
          '(min-width: 1024px)': () => {
            const rail = el.querySelector<HTMLElement>('[data-k-rail]')
            const pin = el.querySelector<HTMLElement>('[data-k-pin]')
            if (!rail || !pin) return

            // Travel is measured, not guessed: how far the rail overflows its
            // own frame is exactly how far it has to move.
            const travel = () => rail.scrollWidth - pin.clientWidth

            gsap.to(rail, {
              x: () => -travel(),
              ease: 'none',
              scrollTrigger: {
                trigger: pin,
                start: 'top top',
                // The pin lasts as long as the horizontal distance, so the
                // vertical and horizontal speeds match and the scroll does not
                // feel geared.
                end: () => `+=${travel()}`,
                pin: true,
                scrub: 0.5,
                anticipatePin: 1,
                invalidateOnRefresh: true,
              },
            })
          },
        })

        ScrollTrigger.refresh()

        return () => splits.forEach((split) => split.revert())
      }, el)
    })

    return () => {
      cancelled = true
      ctx?.revert()
    }
  }, [root, motionOff])
}
