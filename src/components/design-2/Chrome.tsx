import { useEffect, useRef, useState } from 'react'
import { BRAND, FOOTER } from '../../lib/content'
import { PROPERTY } from '../../lib/property'

const CHAPTERS = [
  { id: 'd2-overture', label: 'Overture' },
  { id: 'd2-ascent', label: 'Ascent' },
  { id: 'd2-amenities', label: 'Amenities' },
  { id: 'd2-gallery', label: 'Gallery' },
  { id: 'd2-plans', label: 'Layouts' },
  { id: 'd2-place', label: 'Place' },
  { id: 'd2-enquiry', label: 'Enquiry' },
] as const

function goTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/**
 * The bar names the chapter you are in rather than listing all of them.
 *
 * A seven-item nav across the top would be the loudest thing on a page whose
 * whole argument is restraint — and with a pinned horizontal section in the
 * middle, a list of jump links is a poor map anyway. One current chapter,
 * changing as you go, tells you where you are without competing.
 */
export function Chrome() {
  const [lift, setLift] = useState(false)
  // Empty until a chapter is actually reached: naming the first one while the
  // reader is still in the hero says they are somewhere they have not been.
  const [chapter, setChapter] = useState('')
  const progress = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const doc = document.documentElement
        const max = doc.scrollHeight - doc.clientHeight
        if (progress.current) {
          progress.current.style.scale = `${max > 0 ? doc.scrollTop / max : 0} 1`
        }
        setLift(doc.scrollTop > window.innerHeight * 0.7)
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

  useEffect(() => {
    const nodes = CHAPTERS.map(({ id }) => document.getElementById(id)).filter(
      (node): node is HTMLElement => node !== null,
    )
    if (nodes.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const winner = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (!winner) return
        const found = CHAPTERS.find((entry) => entry.id === winner.target.id)
        if (found) setChapter(found.label)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.3, 0.6, 1] },
    )
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div className="d2-progress" ref={progress} aria-hidden="true" />

      <header className="d2-bar" data-lift={lift ? 'true' : 'false'}>
        <a
          className="d2-bar-mark"
          href="#d2-top"
          onClick={(event) => {
            event.preventDefault()
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        >
          {BRAND.name}
        </a>

        <div className="d2-bar-right">
          <span className="d2-chapter" aria-live="polite">
            {chapter}
          </span>
          <button type="button" className="d2-enquire" onClick={() => goTo('d2-enquiry')}>
            Enquire
          </button>
        </div>
      </header>
    </>
  )
}

export function Colophon() {
  return (
    <footer className="d2-section" style={{ paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
      <div className="d2-wrap">
        <p className="d2-kicker">{FOOTER.eyebrow}</p>
        <a className="d2-mailto" href={`mailto:${BRAND.email}`}>
          {BRAND.email}
        </a>

        <div className="d2-colophon">
          <div className="d2-socials">
            {BRAND.socials.map((social) => (
              <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer">
                {social.label}
              </a>
            ))}
          </div>
          <p className="d2-fine" style={{ marginTop: 0 }}>
            {FOOTER.copyright} · {PROPERTY.place.name}
          </p>
        </div>
      </div>
    </footer>
  )
}
