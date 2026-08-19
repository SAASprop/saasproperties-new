import { motion } from 'framer-motion'
import { BRAND, FOOTER } from '../lib/content'

export function ContactFooter() {
  return (
    <footer id="contact" className="border-t border-stroke px-4 py-24 sm:px-6 sm:py-32">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <p className="eyebrow">{FOOTER.eyebrow}</p>
        <h2 className="mt-3 font-display text-3xl italic text-text sm:text-5xl">
          {FOOTER.heading}
        </h2>

        <a
          href={`mailto:${BRAND.email}`}
          className="accent-gradient-text mt-8 inline-block break-all font-display text-2xl italic sm:text-4xl md:text-5xl"
        >
          {BRAND.email}
        </a>

        <p className="mt-8 max-w-md text-sm text-muted">{BRAND.tagline}</p>
      </motion.div>

      <div className="mt-16 flex flex-wrap gap-x-8 gap-y-3">
        {BRAND.socials.map((social) => (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] uppercase tracking-[0.3em] text-muted transition-colors duration-300 hover:text-text"
          >
            {social.label}
          </a>
        ))}
      </div>

      <div className="mt-16 flex flex-col gap-4 border-t border-stroke pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted">{FOOTER.copyright}</p>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="gradient-border-ring self-start rounded-full border border-stroke px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] text-text transition-colors duration-300 hover:bg-text/5"
        >
          {FOOTER.backToTop} ↑
        </button>
      </div>
    </footer>
  )
}
