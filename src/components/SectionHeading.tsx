import { motion } from 'framer-motion'

interface SectionHeadingProps {
  eyebrow: string
  title: string
  subtitle?: string
}

/** Shared eyebrow + serif title + hairline rule used by most sections. */
export function SectionHeading({ eyebrow, title, subtitle }: SectionHeadingProps) {
  return (
    <motion.header
      className="mb-10 sm:mb-16"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl italic text-text sm:text-5xl">{title}</h2>
      {subtitle && <p className="mt-3 max-w-xl text-sm text-muted">{subtitle}</p>}
      <div className="mt-6 h-[1px] w-full bg-stroke" />
    </motion.header>
  )
}
