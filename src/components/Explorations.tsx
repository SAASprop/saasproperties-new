import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { EXPLORATIONS, EXPLORATIONS_SECTION } from '../lib/content'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { Lightbox, type LightboxItem } from './Lightbox'

gsap.registerPlugin(ScrollTrigger)

const half = Math.ceil(EXPLORATIONS.length / 2)
const COLUMN_ONE = EXPLORATIONS.slice(0, half)
const COLUMN_TWO = EXPLORATIONS.slice(half)

export function Explorations() {
  const sectionRef = useRef<HTMLElement>(null)
  const columnOneRef = useRef<HTMLDivElement>(null)
  const columnTwoRef = useRef<HTMLDivElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  const [active, setActive] = useState<LightboxItem | null>(null)

  useEffect(() => {
    if (reducedMotion) return
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      // Columns drift in opposite directions as the section crosses the viewport.
      gsap.fromTo(
        columnOneRef.current,
        { y: 60 },
        {
          y: -60,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )

      gsap.fromTo(
        columnTwoRef.current,
        { y: -60 },
        {
          y: 60,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
    }, section)

    return () => ctx.revert()
  }, [reducedMotion])

  const renderColumn = (
    items: readonly LightboxItem[],
    ref: React.RefObject<HTMLDivElement | null>,
    offset: number,
  ) => (
    <div ref={ref} className="flex flex-col gap-6 sm:gap-10">
      {items.map((item, index) => (
        <button
          key={item.title}
          type="button"
          onClick={() => setActive(item)}
          className="group block overflow-hidden rounded-xl border border-stroke bg-surface"
          style={{ rotate: `${(index + offset) % 2 === 0 ? -2.5 : 2.5}deg` }}
        >
          <img
            src={item.image}
            alt={item.title}
            loading="lazy"
            decoding="async"
            className="aspect-square w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
          />
          <span className="block px-4 py-3 text-left text-[10px] uppercase tracking-[0.3em] text-muted">
            {item.title}
          </span>
        </button>
      ))}
    </div>
  )

  return (
    <section id="explorations" ref={sectionRef} className="relative px-4 py-24 sm:px-6 sm:py-32">
      <div className="relative grid grid-cols-2 gap-6 sm:gap-10 lg:gap-24">
        {renderColumn(COLUMN_ONE, columnOneRef, 0)}
        {renderColumn(COLUMN_TWO, columnTwoRef, 1)}

        {/* Stays centred and legible for the whole scroll of the gallery. */}
        <div className="pointer-events-none absolute inset-0 z-10 flex justify-center">
          <div className="pointer-events-auto sticky top-[38vh] h-fit max-w-sm rounded-xl border border-stroke bg-bg/80 px-6 py-8 text-center backdrop-blur-md sm:px-10">
            <p className="eyebrow">{EXPLORATIONS_SECTION.eyebrow}</p>
            <h2 className="mt-3 font-display text-3xl italic text-text sm:text-5xl">
              {EXPLORATIONS_SECTION.title}
            </h2>
            <p className="mt-3 text-sm text-muted">{EXPLORATIONS_SECTION.subtitle}</p>
            <a
              href="#works"
              className="mt-6 inline-block text-[10px] uppercase tracking-[0.3em] text-text transition-opacity duration-300 hover:opacity-60"
            >
              {EXPLORATIONS_SECTION.cta} →
            </a>
          </div>
        </div>
      </div>

      <Lightbox item={active} onClose={() => setActive(null)} />
    </section>
  )
}
