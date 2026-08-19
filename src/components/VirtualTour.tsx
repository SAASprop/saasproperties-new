import { motion } from 'framer-motion'
import { KUULA_TOUR } from '../lib/content'
import { SectionHeading } from './SectionHeading'

export function VirtualTour() {
  return (
    <section id="tour" className="px-4 py-24 sm:px-6 sm:py-32">
      <SectionHeading
        eyebrow={KUULA_TOUR.eyebrow}
        title={KUULA_TOUR.title}
        subtitle={KUULA_TOUR.subtitle}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className="aspect-video w-full overflow-hidden rounded-lg border border-stroke bg-surface">
          <iframe
            src={KUULA_TOUR.embedUrl}
            title={KUULA_TOUR.title}
            className="h-full w-full border-0"
            loading="lazy"
            allow="xr-spatial-tracking; gyroscope; accelerometer; fullscreen"
            allowFullScreen
          />
        </div>

        <a
          href={KUULA_TOUR.shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block text-[10px] uppercase tracking-[0.3em] text-text transition-opacity duration-300 hover:opacity-60"
        >
          {KUULA_TOUR.cta} ↗
        </a>
      </motion.div>
    </section>
  )
}
