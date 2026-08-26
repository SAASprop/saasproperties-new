import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { LoadingScreen } from '../components/LoadingScreen'
import { Navbar } from '../components/Navbar'
import { ScrollStory } from '../components/scroll-story'
import { RevealProvider } from '../components/RevealProvider'
import { MotionProvider } from '../components/MotionProvider'
import { Overview } from '../components/Overview'
import { PropertyStats } from '../components/PropertyStats'
import { Features } from '../components/Features'
import { Gallery } from '../components/Gallery'
import { FloorPlans } from '../components/FloorPlans'
import { Location } from '../components/Location'
import { Contact } from '../components/Contact'
import { ContactFooter } from '../components/ContactFooter'

export default function Index() {
  const [revealed, setRevealed] = useState(false)

  // Every ScrollTrigger position on the page is a measurement, and they were all
  // taken while the loader was still up — holding the page at opacity 0 and the
  // body's scroll locked. Dismissing it returns the scrollbar and changes the
  // width everything was measured against, so they are all stale by a few pixels
  // until this runs. Deferred a frame so it measures after the dismissal lands.
  useEffect(() => {
    if (!revealed) return
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(frame)
  }, [revealed])

  return (
    <MotionProvider>
      <LoadingScreen onComplete={() => setRevealed(true)} />

      {/* Navbar lives outside the reveal gate so it is in place the moment the
          loader clears. */}
      <Navbar />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: revealed ? 1 : 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="mx-auto max-w-[1600px]"
      >
        {/* Entrance animations need to know when the loader has actually
            cleared, or they play out behind it. */}
        <RevealProvider revealed={revealed}>
          <ScrollStory />
        </RevealProvider>

        <Overview />
        <PropertyStats />
        <Features />
        <Gallery />
        <FloorPlans />
        <Location />
        <Contact />
        <ContactFooter />
      </motion.main>

    </MotionProvider>
  )
}
