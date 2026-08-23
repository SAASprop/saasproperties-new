import { motion } from 'framer-motion'
import { BRAND, FOOTER } from '../lib/content'
import { useMotionDisabled } from '../lib/motion'

/** Rise-and-fade, staggered by band so the footer arrives in reading order. */
const BANDS = [0, 0.09, 0.18]

export function ContactFooter() {
  const motionOff = useMotionDisabled()

  /**
   * The whole footer was one framer-motion block that honoured neither the
   * reduced-motion preference nor the switch, and everything below the heading
   * was unanimated — so the page's last screen went still exactly where the
   * invitation is. Three bands now arrive in sequence instead.
   *
   * `false` for `initial` is what makes the off state clean: framer-motion skips
   * the enter animation entirely and renders the resting styles, so there is no
   * hidden pre-state to escape from and nothing for motion-off.css to undo.
   */
  const band = (order: number) =>
    motionOff
      ? { initial: false as const }
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.3 },
          transition: { duration: 0.9, delay: BANDS[order], ease: [0.16, 1, 0.3, 1] as const },
        }

  return (
    <footer className="border-t border-stroke px-4 py-24 sm:px-6 sm:py-32">
      <motion.div {...band(0)}>
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

      <motion.div className="mt-16 flex flex-wrap gap-x-8 gap-y-3" {...band(1)}>
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
      </motion.div>

      <motion.div
        className="mt-16 flex flex-col gap-4 border-t border-stroke pt-8 sm:flex-row sm:items-center sm:justify-between"
        {...band(2)}
      >
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted">{FOOTER.copyright}</p>
        <button
          type="button"
          // Jumps rather than glides when motion is off or unwanted: a
          // full-page smooth scroll is the largest movement on the site, and it
          // was the one thing here ignoring the preference outright.
          onClick={() =>
            window.scrollTo({ top: 0, behavior: motionOff ? 'auto' : 'smooth' })
          }
          className="gradient-border-ring self-start rounded-full border border-stroke px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] text-text transition-colors duration-300 hover:bg-text/5"
        >
          {FOOTER.backToTop} ↑
        </button>
      </motion.div>
    </footer>
  )
}
