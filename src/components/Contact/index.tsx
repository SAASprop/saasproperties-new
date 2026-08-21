import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PROPERTY } from '../../lib/property'
import { BRAND } from '../../lib/content'
import { SocialGlyph } from './SocialGlyph'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import './styles.css'

gsap.registerPlugin(ScrollTrigger)

const { contact } = PROPERTY

/** Text fields, in the order they are asked for. Phone is handled separately. */
const FIELDS = [
  {
    name: 'firstName',
    type: 'text',
    label: 'First name',
    required: true,
    autoComplete: 'given-name',
    half: true,
  },
  {
    name: 'lastName',
    type: 'text',
    label: 'Last name',
    required: true,
    autoComplete: 'family-name',
    half: true,
  },
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    required: true,
    autoComplete: 'email',
    half: false,
  },
] as const

/**
 * Dial codes for the country selector.
 *
 * Deliberately a short list built around the Gulf and the markets that buy into
 * it, rather than all ~200 countries: a shorter menu is quicker to use, and the
 * full set is a lot of bytes for a field most visitors leave alone. Add rows as
 * enquiries arrive from elsewhere.
 *
 * Labelled with the ISO code rather than a flag emoji on purpose — Windows ships
 * no country-flag glyphs, so flags render there as bare letter pairs.
 */
const DIAL_CODES = [
  { iso: 'AE', dial: '+971' },
  { iso: 'SA', dial: '+966' },
  { iso: 'QA', dial: '+974' },
  { iso: 'KW', dial: '+965' },
  { iso: 'BH', dial: '+973' },
  { iso: 'OM', dial: '+968' },
  { iso: 'GB', dial: '+44' },
  { iso: 'US', dial: '+1' },
  { iso: 'IN', dial: '+91' },
  { iso: 'PK', dial: '+92' },
  { iso: 'EG', dial: '+20' },
  { iso: 'JO', dial: '+962' },
  { iso: 'LB', dial: '+961' },
  { iso: 'TR', dial: '+90' },
  { iso: 'RU', dial: '+7' },
  { iso: 'CN', dial: '+86' },
  { iso: 'DE', dial: '+49' },
  { iso: 'FR', dial: '+33' },
] as const

type FieldName = (typeof FIELDS)[number]['name'] | 'phone'
type Values = Record<FieldName, string>
type Status = 'idle' | 'sending' | 'done' | 'handoff' | 'error'

const EMPTY: Values = { firstName: '', lastName: '', email: '', phone: '' }

/** Composes a mail draft, used while no form endpoint is configured. */
function mailtoFor(values: Values, dial: string) {
  const body = [
    `Name: ${values.firstName} ${values.lastName}`.trim(),
    `Email: ${values.email}`,
    values.phone && `Phone: ${dial} ${values.phone}`,
    '',
    `Enquiry about ${PROPERTY.name}.`,
  ]
    .filter(Boolean)
    .join('\n')

  return `mailto:${BRAND.email}?subject=${encodeURIComponent(
    `${PROPERTY.name} — viewing request`,
  )}&body=${encodeURIComponent(body)}`
}

export function Contact() {
  const root = useRef<HTMLElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  const [values, setValues] = useState<Values>(EMPTY)
  const [dial, setDial] = useState<string>(DIAL_CODES[0].dial)
  const [status, setStatus] = useState<Status>('idle')

  useLayoutEffect(() => {
    if (reducedMotion) return

    const ctx = gsap.context(() => {}, root)
    let cancelled = false

    // As elsewhere on the page: these triggers are `once: true`, and one built
    // before the CSS lands or the webfont swaps measures against the wrong
    // layout and fires immediately, which a later refresh cannot undo.
    const layoutSettled = Promise.all([
      document.fonts.ready,
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
    ])

    void layoutSettled.then(() => {
      if (cancelled) return
      ctx.add(() => {
        gsap.utils.toArray<HTMLElement>('[data-anim="element"]').forEach((el) => {
          gsap.set(el, { visibility: 'visible' })
          gsap.from(el, {
            opacity: 0,
            y: 40,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          })
        })

        // Dark panel wipes off the background image.
        gsap.utils.toArray<HTMLElement>('[data-anim="img-overlay"]').forEach((el) => {
          gsap.set(el, { visibility: 'visible', yPercent: 0 })
          gsap.to(el, {
            yPercent: -101,
            duration: 1.4,
            ease: 'expo.inOut',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          })
        })

        // Background drifts against the scroll, at a constant overscale so the
        // translate can never pull an edge into frame.
        gsap.utils.toArray<HTMLElement>('[data-anim="img-parallax"]').forEach((el) => {
          gsap.fromTo(
            el,
            { yPercent: -6, scale: 1.15 },
            {
              yPercent: 6,
              ease: 'none',
              scrollTrigger: {
                trigger: root.current,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
              },
            },
          )
        })

        ScrollTrigger.refresh()
      })
    })

    return () => {
      cancelled = true
      ctx.revert()
    }
  }, [reducedMotion])

  const setField = (name: FieldName, value: string) =>
    setValues((current) => ({ ...current, [name]: value }))

  const clearField = (name: FieldName) => {
    setField(name, '')
    root.current?.querySelector<HTMLInputElement>(`[name="${name}"]`)?.focus()
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('sending')

    // No endpoint configured: hand off to the visitor's mail client with the
    // fields already filled in, rather than swallowing the submission.
    if (!contact.endpoint) {
      window.location.href = mailtoFor(values, dial)
      // Deliberately not 'done': nothing has been received yet, only drafted.
      // Claiming otherwise would tell the visitor their enquiry is with us when
      // it is still sitting unsent in their mail client.
      setStatus('handoff')
      return
    }

    try {
      const response = await fetch(contact.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...values,
          // Joined here so whoever receives this never has to reassemble it.
          phone: values.phone ? `${dial} ${values.phone}` : '',
          property: PROPERTY.name,
        }),
      })
      if (!response.ok) throw new Error(String(response.status))
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section
      id="contact"
      ref={root}
      className="full-bleed relative isolate overflow-hidden bg-bg py-24 lg:py-28"
      aria-labelledby="contact-heading"
    >
      {/* Full-bleed background, behind everything within the section's own
          isolation so it never escapes upward. */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div data-anim="img-parallax" className="h-full w-full will-change-transform">
          <img
            src={contact.image.src}
            alt={contact.image.alt}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-bg/95 via-bg/80 to-bg/95" />
        <div
          data-anim="img-overlay"
          aria-hidden="true"
          className="ct-hide absolute inset-x-0 -top-[1%] h-[101%] bg-bg"
        />
      </div>

      <div className="mx-auto max-w-[1600px] px-5 md:px-[3.75rem]">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
          {/* Left: the invitation, plus direct contact for anyone who would
              rather not fill in a form. */}
          <div className="lg:col-span-5">
            <p data-anim="element" className="ct-hide eyebrow">
              {contact.caption}
            </p>
            {/* One line per word, so the title reads as a display block rather
                than as a wrapped sentence. */}
            <h2
              id="contact-heading"
              data-anim="element"
              className="ct-hide mt-4 font-display text-5xl italic leading-[0.95] text-text sm:text-6xl lg:text-7xl"
            >
              {contact.headingLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
            <p
              data-anim="element"
              className="ct-hide mt-7 max-w-md text-base leading-relaxed tracking-[0.02em] text-muted"
            >
              {contact.body}
            </p>

            <div data-anim="element" className="ct-hide mt-10">
              <span className="block h-px w-12 bg-champagne/40" aria-hidden="true" />
              <a
                href={`mailto:${BRAND.email}`}
                className="mt-5 inline-block font-display text-lg italic text-text transition-colors duration-300 hover:text-champagne sm:text-xl"
              >
                {BRAND.email}
              </a>
              <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-muted">
                {PROPERTY.place.name} · {PROPERTY.place.detail}
              </p>
            </div>

            {/* Social accounts. */}
            <ul
              data-anim="element"
              className="ct-hide mt-9 flex list-none flex-wrap gap-3 p-0"
            >
              {BRAND.socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${BRAND.name} on ${social.label}`}
                    title={social.label}
                    className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-text/80 transition-colors duration-300 hover:border-champagne hover:bg-champagne hover:text-bg"
                  >
                    <SocialGlyph icon={social.icon} className="h-[18px] w-[18px]" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: the form panel. */}
          <div data-anim="element" className="ct-hide lg:col-span-6 lg:col-start-7">
            <div className="border border-champagne/20 bg-surface/80 p-7 backdrop-blur-md sm:p-10 lg:p-12">
              {status === 'done' || status === 'handoff' ? (
                <div role="status" className="py-10 text-center">
                  <span
                    aria-hidden="true"
                    className="mx-auto block h-px w-12 bg-champagne/50"
                  />
                  <p className="mt-6 font-display text-2xl italic leading-snug text-text sm:text-3xl">
                    {status === 'handoff' ? contact.handoffMessage : contact.successMessage}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setValues(EMPTY)
                      setStatus('idle')
                    }}
                    className="mt-8 text-[11px] uppercase tracking-[0.25em] text-muted transition-colors duration-300 hover:text-text"
                  >
                    Send another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate={false}>
                  {/* No heading here: the section title beside it already says
                      "Register Your Interest", so a second one only repeats it. */}
                  <p className="text-sm leading-relaxed text-muted">{contact.formNote}</p>

                  {/* First and last sit side by side from the small breakpoint
                      up; the rest run full width. */}
                  <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                    {FIELDS.map((field) => (
                      <div
                        key={field.name}
                        className={`relative ${field.half ? '' : 'sm:col-span-2'}`}
                      >
                        <input
                          id={`contact-${field.name}`}
                          name={field.name}
                          type={field.type}
                          autoComplete={field.autoComplete}
                          required={field.required}
                          maxLength={256}
                          value={values[field.name]}
                          onChange={(event) => setField(field.name, event.target.value)}
                          placeholder={field.label}
                          aria-label={field.label}
                          className="ct-input w-full border-0 border-b border-stroke bg-transparent pb-3 pr-12 pt-8 font-display text-base not-italic uppercase tracking-[0.06em] text-text outline-none transition-colors duration-200 focus:border-champagne/60"
                        />
                        <button
                          type="button"
                          onClick={() => clearField(field.name)}
                          aria-label={`Clear ${field.label}`}
                          className="ct-clear absolute bottom-1 right-0 h-10 w-10 items-center justify-center text-muted transition-colors duration-200 hover:text-text"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.3}
                            strokeLinecap="round"
                            className="h-4 w-4"
                            aria-hidden="true"
                          >
                            <path d="M18 6 6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}

                    {/* Phone: dial code and number are separate controls sharing
                        one underline, so the code is picked rather than typed. */}
                    <div className="flex items-end gap-4 sm:col-span-2">
                      <div>
                        <label
                          htmlFor="contact-dial"
                          className="block pt-8 text-[10px] uppercase tracking-[0.25em] text-muted"
                        >
                          Code
                        </label>
                        <select
                          id="contact-dial"
                          name="dialCode"
                          value={dial}
                          onChange={(event) => setDial(event.target.value)}
                          className="mt-1 w-[6.75rem] cursor-pointer sm:w-[7.5rem] border-0 border-b border-stroke bg-transparent pb-3 font-display text-base not-italic uppercase tracking-[0.06em] text-text outline-none transition-colors duration-200 focus:border-champagne/60"
                        >
                          {DIAL_CODES.map((entry) => (
                            // Dark theme: options are painted by the OS, so the
                            // colours are set explicitly or they inherit white.
                            <option
                              key={entry.iso}
                              value={entry.dial}
                              className="bg-surface text-text"
                            >
                              {entry.iso} {entry.dial}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="relative flex-1">
                        <input
                          id="contact-phone"
                          name="phone"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel-national"
                          maxLength={32}
                          value={values.phone}
                          onChange={(event) => setField('phone', event.target.value)}
                          // Short visible placeholder: the full words are clipped beside the code
                          // select on a narrow phone. aria-label keeps it explicit.
                          placeholder="Phone"
                          aria-label="Phone number"
                          className="ct-input w-full border-0 border-b border-stroke bg-transparent pb-3 pr-12 pt-8 font-display text-base not-italic uppercase tracking-[0.06em] text-text outline-none transition-colors duration-200 focus:border-champagne/60"
                        />
                        <button
                          type="button"
                          onClick={() => clearField('phone')}
                          aria-label="Clear phone number"
                          className="ct-clear absolute bottom-1 right-0 h-10 w-10 items-center justify-center text-muted transition-colors duration-200 hover:text-text"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.3}
                            strokeLinecap="round"
                            className="h-4 w-4"
                            aria-hidden="true"
                          >
                            <path d="M18 6 6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {status === 'error' && (
                    <p
                      role="alert"
                      className="mt-8 border border-champagne/30 bg-champagne/5 p-4 text-sm text-text"
                    >
                      {contact.errorMessage}{' '}
                      <a href={`mailto:${BRAND.email}`} className="underline">
                        {BRAND.email}
                      </a>
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="mt-10 w-full border border-champagne/40 bg-transparent py-4 text-[11px] uppercase tracking-[0.25em] text-text transition-colors duration-300 hover:border-champagne hover:bg-champagne hover:text-bg disabled:cursor-default disabled:opacity-60"
                  >
                    {status === 'sending' ? 'Sending…' : contact.submitLabel}
                  </button>

                  <p className="mt-6 text-[11px] leading-relaxed text-muted">
                    {contact.privacyNote}
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
