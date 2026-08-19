import { useState } from 'react'
import { motion } from 'framer-motion'
import { LoadingScreen } from '../components/LoadingScreen'
import { Navbar } from '../components/Navbar'
import { ScrollStory } from '../components/ScrollStory'
import { SelectedWorks } from '../components/SelectedWorks'
import { VirtualTour } from '../components/VirtualTour'
import { Journal } from '../components/Journal'
import { Explorations } from '../components/Explorations'
import { Stats } from '../components/Stats'
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
        <ScrollStory />
        <SelectedWorks />
        <VirtualTour />
        <Journal />
        <Explorations />
        <Stats />
        <ContactFooter />
      </motion.main>
    </>
  )
}
