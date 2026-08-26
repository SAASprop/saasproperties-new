import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { BRAND } from '../lib/content'
import { PROPERTY } from '../lib/property'
import { useMotionDisabled } from '../lib/motion'

/** What the visitor asked for, and where it lives. */
export interface GatedDocument {
  label: string
  url: string
}

/**
 * Takes a name and a way to reach the visitor before handing over a document.
 *
 * A floor plan or a brochure is the most qualified signal on the page — someone
 * asking for one is further along than someone reading it — so it is worth a
 * form. The document still opens either way: the gate is a request, not a
 * toll, and refusing to hand over the file after asking would be worse than not
 * asking.
 *
 * It opens the PDF in a new tab rather than navigating, so the page the visitor
 * was reading is still behind it when they come back. That is also why the tab
 * is opened inside the submit handler and not after an await — a `window.open`
 * that is not the direct result of a click is a popup, and gets blocked.
 */
export function DocumentGate({
  document: doc,
  onClose,
}: {
  document: GatedDocument | null
  onClose: () => void
}) {
  const reducedMotion = useMotionDisabled()
  const dialogRef = useRef<HTMLDivElement>(null)
  const restoreFocusTo = useRef<HTMLElement | null>(null)
  const [sent, setSent] = useState(false)

  const open = doc !== null

  /** Closing is the one thing that clears the sent state. */
  const close = () => {
    setSent(false)
    onClose()
  }

  useEffect(() => {
    if (!open) return

    restoreFocusTo.current = window.document.activeElement as HTMLElement | null
    // The first field, not the dialog: this is a form, and the thing to do on
    // opening it is to start filling it in.
    dialogRef.current?.querySelector<HTMLInputElement>('input')?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKeyDown)

    const previous = window.document.body.style.overflow
    window.document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.document.body.style.overflow = previous
      restoreFocusTo.current?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!doc) return

    const form = new FormData(event.currentTarget)
    const lines = [
      `Requested: ${doc.label}`,
      `Name: ${String(form.get('name') ?? '').trim()}`,
      `Email: ${String(form.get('email') ?? '').trim()}`,
      `Phone: ${String(form.get('phone') ?? '').trim()}`,
      `Property: ${PROPERTY.name}`,
    ]

    // Straight from the click, so the browser treats it as user-initiated.
    window.open(doc.url, '_blank', 'noopener,noreferrer')

    // No endpoint is configured for the site's forms yet, so the details are
    // drafted to the sales address rather than dropped. Opened in a hidden
    // frame instead of assigning location, which would navigate away from the
    // page the visitor is still reading.
    if (!PROPERTY.contact.endpoint) {
      const mail = `mailto:${BRAND.email}?subject=${encodeURIComponent(
        `${doc.label} — ${PROPERTY.name}`,
      )}&body=${encodeURIComponent(lines.join('\n'))}`
      window.location.href = mail
    }

    setSent(true)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] grid place-items-center bg-bg/95 px-5 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.25, ease: 'easeOut' }}
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={`Request the ${doc.label}`}
        >
          <motion.div
            ref={dialogRef}
            className="relative w-full max-w-lg border border-champagne/25 bg-surface p-7 sm:p-10"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.99 }}
            transition={{ duration: reducedMotion ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/30 text-text transition-colors duration-300 hover:border-text hover:bg-text hover:text-bg"
              aria-label="Close"
            >
              <X size={15} strokeWidth={1.25} aria-hidden="true" />
            </button>

            {sent ? (
              <div role="status" className="py-6 text-center">
                <p className="font-display text-2xl not-italic text-text">
                  {doc.label} opened
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  It should be in a new tab. If your browser blocked it,{' '}
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-champagne underline underline-offset-4"
                  >
                    open it here
                  </a>
                  .
                </p>
              </div>
            ) : (
              <>
                <p className="eyebrow">{doc.label}</p>
                <h2 className="mt-4 font-display text-3xl italic leading-tight text-text">
                  Tell us where to send it
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  The {doc.label.toLowerCase()} opens in a new tab. Leave your
                  details and a member of our team will follow up with you.
                </p>

                <form onSubmit={submit} className="mt-7 space-y-5">
                  {[
                    { name: 'name', label: 'Full name', type: 'text', autoComplete: 'name' },
                    { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
                    { name: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel' },
                  ].map((field) => (
                    <label key={field.name} className="block">
                      <span className="block text-[11px] uppercase tracking-[0.22em] text-muted">
                        {field.label}
                      </span>
                      <input
                        name={field.name}
                        type={field.type}
                        autoComplete={field.autoComplete}
                        required={field.name !== 'phone'}
                        className="mt-2 w-full border-0 border-b border-white/30 bg-transparent pb-2 text-base text-text outline-none transition-colors duration-300 focus:border-champagne"
                      />
                    </label>
                  ))}

                  <button
                    type="submit"
                    className="mt-2 w-full border border-champagne bg-champagne py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-bg transition-colors duration-300 hover:border-white hover:bg-white"
                  >
                    Open {doc.label}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
