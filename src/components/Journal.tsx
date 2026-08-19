import { motion } from 'framer-motion'
import { JOURNAL, JOURNAL_SECTION } from '../lib/content'
import { SectionHeading } from './SectionHeading'

export function Journal() {
  return (
    <section id="journal" className="px-4 py-24 sm:px-6 sm:py-32">
      <SectionHeading eyebrow={JOURNAL_SECTION.eyebrow} title={JOURNAL_SECTION.title} />

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {JOURNAL.map((entry, index) => (
          <motion.article
            key={entry.title}
            className="group"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: index * 0.07 }}
          >
            <div className="overflow-hidden rounded-lg border border-stroke bg-surface">
              <img
                src={entry.image}
                alt={entry.title}
                loading="lazy"
                decoding="async"
                className="aspect-[3/4] w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
              />
            </div>

            <div className="mt-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-muted">
              <span>{entry.date}</span>
              <span className="h-[1px] w-4 bg-stroke" />
              <span>{entry.readTime}</span>
            </div>

            <h3 className="mt-3 font-display text-xl italic leading-snug text-text">
              {entry.title}
            </h3>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
