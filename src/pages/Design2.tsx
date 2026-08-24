import { useEffect, useRef } from 'react'
import { MotionProvider } from '../components/MotionProvider'
import { Chrome, Colophon } from '../components/design-2/Chrome'
import { Hero } from '../components/design-2/Hero'
import { Overture } from '../components/design-2/Overture'
import { Ascent } from '../components/design-2/Ascent'
import { Amenities } from '../components/design-2/Amenities'
import { Gallery } from '../components/design-2/Gallery'
import { Plans } from '../components/design-2/Plans'
import { Place } from '../components/design-2/Place'
import { Enquiry } from '../components/design-2/Enquiry'
import { useKinetic } from '../components/design-2/useKinetic'
import '../components/design-2/d2.css'

/** The display face, loaded for this route only. */
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap'

/**
 * /design-2 — a third art direction, built around scroll.
 *
 * Shares the property data, the media components, the viewer and the motion
 * switch with the other two routes and none of their layout or styling: these
 * styles are scoped under `.d2`, declare their own tokens, and are imported only
 * here.
 *
 * The display face is added to the document head from this component rather than
 * from index.html, and removed on unmount. A `<link>` in index.html would make
 * the production page and /design pay for a webfont neither of them uses.
 */
export default function Design2() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Reuse an existing tag if one is already there (a remount, or a return
    // visit through client-side navigation).
    const existing = document.querySelector<HTMLLinkElement>(`link[href="${FONT_HREF}"]`)
    if (existing) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = FONT_HREF
    document.head.append(link)
    return () => link.remove()
  }, [])

  // One effect drives every scroll animation on the page — see useKinetic for
  // the eight roles and the one pinned move. Gated on the same hook the other
  // routes use, so the Motion switch turns this one static too.
  useKinetic(root)

  return (
    <MotionProvider>
      <div className="d2" ref={root} id="d2-top">
        <Chrome />

        <main>
          <Hero />
          <Overture />
          <Ascent />
          <Amenities />
          <Gallery />
          <Plans />
          <Place />
          <Enquiry />
        </main>

        <Colophon />
      </div>

    </MotionProvider>
  )
}
