import { useEffect, useRef, useState } from 'react'
import { BRAND, FOOTER } from '../../lib/content'
import { PROPERTY } from '../../lib/property'

/** The sections the index rail steps through, in page order. */
const DV2_SECTIONS = [
  { id: 'dv2-residence', label: 'Residence' },
  { id: 'dv2-amenities', label: 'Amenities' },
  { id: 'dv2-collection', label: 'Collection' },
  { id: 'dv2-plans', label: 'Plans' },
  { id: 'dv2-place', label: 'Place' },
  { id: 'dv2-enquiry', label: 'Enquiry' },
] as const

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/**
 * Masthead, scroll hairline and section index.
 *
 * The index is the route's navigation: a column of hairlines down the right
 * edge, each naming its section only when it is current or pointed at. V1 keeps
 * a row of pills in a centred bar; this keeps the top of the page empty so the
 * photography has it, which is most of why the two feel different before a word
 * is read.
 */
export function Chrome() {
  const [settled, setSettled] = useState(false)
  const [active, setActive] = useState<string>(DV2_SECTIONS[0].id)
  const [overPaper, setOverPaper] = useState(false)
  const progress = useRef<HTMLDivElement>(null)

  // One scroll listener for the hairline and the masthead state. Written
  // straight to a transform so it never triggers layout.
  useEffect(() => {
    let frame = 0

    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const doc = document.documentElement
        const max = doc.scrollHeight - doc.clientHeight
        const ratio = max > 0 ? doc.scrollTop / max : 0
        if (progress.current) progress.current.style.scale = `${ratio} 1`
        setSettled(doc.scrollTop > window.innerHeight * 0.72)
      })
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  // Which section owns the middle of the viewport, and whether that section is
  // one of the light bands — the index has to invert over those or it vanishes.
  useEffect(() => {
    const nodes = DV2_SECTIONS.map(({ id }) => document.getElementById(id)).filter(
      (node): node is HTMLElement => node !== null,
    )
    if (nodes.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const winner = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (!winner) return
        setActive(winner.target.id)
        setOverPaper(winner.target.getAttribute('data-ground') === 'paper')
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    )

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div className="dv2-progress" ref={progress} aria-hidden="true" />

      <header className="dv2-masthead" data-settled={settled ? 'true' : 'false'}>
        <a
          className="dv2-mark"
          href="#dv2-top"
          onClick={(event) => {
            event.preventDefault()
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        >
          {BRAND.name} Properties
        </a>

        <span className="dv2-masthead-mid">{PROPERTY.name}</span>

        <button
          type="button"
          className="dv2-cta"
          onClick={() => scrollToId('dv2-enquiry')}
        >
          Enquire
        </button>
      </header>

      <nav
        className="dv2-index"
        data-over={overPaper ? 'paper' : 'ink'}
        aria-label="Sections"
      >
        {DV2_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            className="dv2-index-item"
            aria-current={active === section.id ? 'true' : undefined}
            onClick={() => scrollToId(section.id)}
          >
            <span className="dv2-index-label">{section.label}</span>
            <span className="dv2-index-rule" aria-hidden="true" />
          </button>
        ))}
      </nav>
    </>
  )
}

/** Closing block: the address, the socials, the line of record. */
export function Colophon() {
  return (
    <footer className="dv2-section" data-ground="ink">
      <div className="dv2-frame">
        <div className="dv2-rail" aria-hidden="true">
          <span className="dv2-rail-tick" />
        </div>

        <div>
          <p className="dv2-eyebrow">{FOOTER.eyebrow}</p>
          <a className="dv2-email" href={`mailto:${BRAND.email}`}>
            {BRAND.email}
          </a>

          <div className="dv2-colophon">
            <div className="dv2-socials">
              {BRAND.socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.label}
                </a>
              ))}
            </div>
            <p className="dv2-note" style={{ marginTop: 0 }}>
              {FOOTER.copyright}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
