import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export interface LightboxItem {
  title: string
  image: string
}

interface LightboxProps {
  item: LightboxItem | null
  onClose: () => void
}

/**
 * Kept in its own component so the Framer Motion presence animation never
 * shares a tree with the GSAP-driven parallax in Explorations.
 */
export function Lightbox({ item, onClose }: LightboxProps) {
  useEffect(() => {
    if (!item) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [item, onClose])

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-bg/95 p-4 backdrop-blur-sm sm:p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={item.title}
        >
          <motion.figure
            className="max-h-full w-full max-w-4xl"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={item.image}
              alt={item.title}
              className="max-h-[75vh] w-full rounded-lg border border-stroke object-contain"
            />
            <figcaption className="mt-4 text-center text-[10px] uppercase tracking-[0.3em] text-muted">
              {item.title}
            </figcaption>
          </motion.figure>

          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border border-stroke bg-surface text-text sm:right-8 sm:top-8"
            aria-label="Close"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
