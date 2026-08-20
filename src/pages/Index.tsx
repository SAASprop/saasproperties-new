import { useState } from 'react'
import { motion } from 'framer-motion'
import { LoadingScreen } from '../components/LoadingScreen'
import { Navbar } from '../components/Navbar'
import { ScrollStory, StoryVariantSwitcher } from '../components/scroll-story'
import { RevealProvider } from '../components/RevealProvider'
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

  return (
    <>
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

      {/* Demo-only; renders nothing on a bare deployed link. */}
      <StoryVariantSwitcher />
    </>
  )
}
