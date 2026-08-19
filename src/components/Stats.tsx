import { motion } from 'framer-motion'
import { STATS, STATS_SECTION } from '../lib/content'

export function Stats() {
  return (
    <section id="stats" className="px-4 py-24 sm:px-6 sm:py-32">
      <p className="eyebrow">{STATS_SECTION.eyebrow}</p>
      <div className="mt-6 h-[1px] w-full bg-stroke" />

      <div className="mt-12 grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-8">
        {STATS.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: index * 0.1 }}
          >
            <p className="font-display text-5xl italic leading-none text-text sm:text-6xl">
              {stat.value}
            </p>
            <p className="mt-4 text-sm text-muted">{stat.label}</p>
            {'period' in stat && stat.period && (
              <span className="mt-3 inline-block rounded-full border border-stroke px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-muted">
                {stat.period}
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  )
}
