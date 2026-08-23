import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useMotionDisabled } from '../../lib/motion'

gsap.registerPlugin(ScrollTrigger)

/**
 * The whole motion vocabulary for this route, in one place.
 *
 * Sections mark elements with `data-dv2` and get the behaviour; nothing else.
 * Six roles, chosen so no section needs a seventh:
 *
 *   mask     a line of type rising out of its own overflow — the house reveal
 *   rise     fade and lift, for supporting copy and small blocks
 *   image    a clip wipe with the frame settling out of a slight oversize
 *   rule     a hairline drawing out from its leading edge
 *   stagger  one of a set, revealed in sequence within its own container
 *   drift    scrubbed parallax, held oversized so no edge enters the frame
 *
 * Everything animates transform, opacity or clip-path — no layout properties.
 * Gated on the same hook the production page uses, so the site's Motion switch
 * governs this route too and the off state is the static page.
 */
export function useReveal(root: RefObject<HTMLElement | null>) {
  const motionOff = useMotionDisabled()

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return

    // With motion off nothing is built at all. The pre-hide class is released
    // by CSS instead — see the escapes at the foot of dv2.css.
    if (motionOff) return

    let ctx: gsap.Context | undefined
    let cancelled = false

    // Measuring before the display face lands measures the fallback's line
    // height, which moves every trigger position afterwards.
    const settled = Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
    ])

    settled.then(() => {
      if (cancelled) return

      ctx = gsap.context(() => {
        const enter = { start: 'top 82%', once: true } as const

        gsap.utils.toArray<HTMLElement>('[data-dv2="mask"]').forEach((node) => {
          gsap.set(node, { visibility: 'visible' })
          gsap.from(node.querySelectorAll<HTMLElement>('[data-dv2-line]'), {
            yPercent: 118,
            duration: 1.5,
            ease: 'expo.out',
            stagger: 0.09,
            scrollTrigger: { trigger: node, ...enter },
          })
        })

        gsap.utils.toArray<HTMLElement>('[data-dv2="rise"]').forEach((node) => {
          gsap.set(node, { visibility: 'visible' })
          gsap.from(node, {
            opacity: 0,
            y: 34,
            duration: 1.3,
            ease: 'power3.out',
            scrollTrigger: { trigger: node, ...enter },
          })
        })

        gsap.utils.toArray<HTMLElement>('[data-dv2="image"]').forEach((node) => {
          gsap.set(node, { visibility: 'visible' })
          const frame = node.querySelector<HTMLElement>('[data-dv2-frame]') ?? node
          gsap
            .timeline({ scrollTrigger: { trigger: node, ...enter } })
            .from(node, {
              clipPath: 'inset(0% 0% 100% 0%)',
              duration: 1.5,
              ease: 'expo.inOut',
            })
            .from(frame, { scale: 1.14, duration: 2.1, ease: 'expo.out' }, 0)
        })

        gsap.utils.toArray<HTMLElement>('[data-dv2="rule"]').forEach((node) => {
          gsap.set(node, { visibility: 'visible' })
          gsap.from(node, {
            scaleX: 0,
            duration: 1.4,
            ease: 'expo.inOut',
            scrollTrigger: { trigger: node, ...enter },
          })
        })

        gsap.utils.toArray<HTMLElement>('[data-dv2="stagger"]').forEach((node) => {
          const items = node.querySelectorAll<HTMLElement>('[data-dv2-item]')
          gsap.set(node, { visibility: 'visible' })
          gsap.from(items, {
            opacity: 0,
            y: 26,
            duration: 1.1,
            ease: 'power3.out',
            stagger: 0.07,
            scrollTrigger: { trigger: node, ...enter },
          })
        })

        // Scrubbed, so it runs both ways with the scroll rather than firing once.
        gsap.utils.toArray<HTMLElement>('[data-dv2="drift"]').forEach((node) => {
          gsap.to(node, {
            yPercent: -12,
            ease: 'none',
            scrollTrigger: {
              trigger: node.closest('[data-dv2-drift-scope]') ?? node,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          })
        })
      }, el)

      ScrollTrigger.refresh()
    })

    return () => {
      cancelled = true
      ctx?.revert()
    }
  }, [root, motionOff])
}
