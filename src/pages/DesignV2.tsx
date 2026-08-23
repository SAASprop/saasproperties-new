import { useRef } from 'react'
import { MotionProvider } from '../components/MotionProvider'
import { MotionToggle } from '../components/MotionToggle'
import { Chrome, Colophon } from '../components/design-v2/Chrome'
import { Hero } from '../components/design-v2/Hero'
import { Opening } from '../components/design-v2/Opening'
import { Chapters } from '../components/design-v2/Chapters'
import { Collection } from '../components/design-v2/Collection'
import { Plans } from '../components/design-v2/Plans'
import { Place } from '../components/design-v2/Place'
import { Enquiry } from '../components/design-v2/Enquiry'
import { useReveal } from '../components/design-v2/useReveal'
import '../components/design-v2/dv2.css'

/**
 * /design — a second art direction for the same property.
 *
 * Shares the data, the media components, the viewer and the motion switch with
 * the production page and none of its layout or styling. The route exists to be
 * compared against `/`, so the two are deliberately kept apart: this page's
 * styles are scoped under `.dv2`, declare their own tokens, and are imported
 * only here.
 *
 * No loading screen. The live page holds a three-second loader before anything
 * appears, which is right for an arrival but wrong for a page whose whole
 * purpose is to be opened next to another one and looked at.
 */
export default function DesignV2() {
  const root = useRef<HTMLDivElement>(null)

  // One effect drives every reveal on the page — see useReveal for the six
  // roles, and note it is gated on the same hook the production sections use,
  // so the Motion switch turns this route static too.
  useReveal(root)

  return (
    <MotionProvider>
      <div className="dv2" ref={root} id="dv2-top">
        <Chrome />

        <main>
          <Hero />
          <Opening />
          <Chapters />
          <Collection />
          <Plans />
          <Place />
          <Enquiry />
        </main>

        <Colophon />
      </div>

      <MotionToggle />
    </MotionProvider>
  )
}
