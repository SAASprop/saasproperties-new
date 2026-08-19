import { motion } from 'framer-motion'
import { PROJECTS, SELECTED_WORKS } from '../lib/content'
import { SectionHeading } from './SectionHeading'

export function SelectedWorks() {
  return (
    <section id="works" className="px-4 py-24 sm:px-6 sm:py-32">
      <SectionHeading eyebrow={SELECTED_WORKS.eyebrow} title={SELECTED_WORKS.title} />

      <div className="grid gap-x-10 gap-y-16 md:grid-cols-2">
        {PROJECTS.map((project, index) => (
          <motion.article
            key={project.title}
            className="group"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: (index % 2) * 0.08 }}
          >
            <div className="overflow-hidden rounded-lg border border-stroke bg-surface">
              <img
                src={project.image}
                alt={project.title}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
              />
            </div>

            <h3 className="mt-6 font-display text-2xl italic text-text sm:text-3xl">
              {project.title}
            </h3>

            {project.description.map((paragraph) => (
              <p key={paragraph} className="mt-3 text-sm leading-relaxed text-muted">
                {paragraph}
              </p>
            ))}

            <a
              href="#works"
              className="mt-5 inline-block text-[10px] uppercase tracking-[0.3em] text-text transition-opacity duration-300 hover:opacity-60"
            >
              {SELECTED_WORKS.cta} →
            </a>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
