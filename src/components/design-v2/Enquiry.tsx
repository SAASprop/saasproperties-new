import { Fragment, useState } from 'react'
import { BRAND } from '../../lib/content'
import { PROPERTY } from '../../lib/property'
import { useEnquiry } from '../../lib/enquiry'

const { contact } = PROPERTY

/**
 * Field order and widths. Phone is half-width so the dial code can sit beside
 * it rather than under it — a full-width select above a full-width number reads
 * as two unrelated questions, and it is the one arrangement in this form that
 * would make someone stop and think.
 */
const FIELDS = [
  { name: 'firstName', label: 'First name', type: 'text', autoComplete: 'given-name', half: true },
  { name: 'lastName', label: 'Last name', type: 'text', autoComplete: 'family-name', half: true },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email', half: false },
  { name: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel', half: true },
] as const

/** The same dial codes the production form offers. */
const DIAL_CODES = ['+971', '+966', '+974', '+973', '+968', '+965', '+44', '+1'] as const

/**
 * The enquiry, framed as a private approach rather than a form to fill in.
 *
 * Everything functional is the production behaviour, reached through
 * `useEnquiry`: the same fields, the same dial codes, the same endpoint, and the
 * same honest handling when no endpoint is configured — the fields are handed to
 * the visitor's mail client and the status says drafted, not sent.
 *
 * What changed is the framing. The labels float rather than sitting above the
 * inputs, the rules are hairlines, and the action names what it does instead of
 * saying Submit.
 */
export function Enquiry() {
  const [dial, setDial] = useState<string>(DIAL_CODES[0])
  const { values, status, setField, submit } = useEnquiry(dial)

  const message =
    status === 'done'
      ? contact.successMessage
      : status === 'handoff'
        ? contact.handoffMessage
        : status === 'error'
          ? contact.errorMessage
          : null

  return (
    <section className="dv2-section" data-ground="char" id="dv2-enquiry">
      <div className="dv2-frame">
        <div className="dv2-rail">
          <span className="dv2-num">06</span>
          <span className="dv2-rail-tick dv2-hide" data-dv2="rule" />
        </div>

        <div className="dv2-enquiry">
          <div>
            <p className="dv2-eyebrow">Private enquiry</p>
            <h2 className="dv2-title dv2-hide" data-dv2="mask" style={{ marginTop: '1.25rem' }}>
              <span className="dv2-line">
                <span data-dv2-line>Speak with a</span>
              </span>
              <span className="dv2-line">
                <span data-dv2-line className="dv2-accent">
                  property specialist
                </span>
              </span>
            </h2>

            <p className="dv2-body dv2-hide" data-dv2="rise" style={{ marginTop: '2rem', maxWidth: '34ch' }}>
              {contact.body}
            </p>

            <div className="dv2-meta-cell" style={{ marginTop: '2.5rem' }}>
              <span className="dv2-meta-label">Direct</span>
              <a
                href={`mailto:${BRAND.email}`}
                className="dv2-meta-value"
                style={{ textDecoration: 'none' }}
              >
                {BRAND.email}
              </a>
            </div>

            <div className="dv2-meta-cell" style={{ marginTop: '1.75rem' }}>
              <span className="dv2-meta-label">Residence</span>
              <span className="dv2-meta-value">
                {PROPERTY.name} · {PROPERTY.place.name}
              </span>
            </div>
          </div>

          <form onSubmit={submit} className="dv2-hide" data-dv2="rise">
            <p className="dv2-note" style={{ marginTop: 0 }}>
              {contact.formNote}
            </p>

            <div className="dv2-form-grid">
              {FIELDS.map((field) => (
                <Fragment key={field.name}>
                  {/* The dial code takes the half beside Phone, so it has to be
                      emitted just before it rather than appended after the
                      loop. */}
                  {field.name === 'phone' && (
                    <label className="dv2-field">
                      <select
                        value={dial}
                        onChange={(event) => setDial(event.target.value)}
                        aria-label="Country code"
                      >
                        {DIAL_CODES.map((code) => (
                          <option key={code} value={code}>
                            {code}
                          </option>
                        ))}
                      </select>
                      <span className="dv2-field-label" style={{ top: '0.25rem' }}>
                        Country code
                      </span>
                    </label>
                  )}

                <label
                  className="dv2-field"
                  data-span={field.half ? undefined : 'full'}
                >
                  <input
                    name={field.name}
                    type={field.type}
                    autoComplete={field.autoComplete}
                    required={field.name !== 'phone'}
                    maxLength={256}
                    value={values[field.name]}
                    onChange={(event) => setField(field.name, event.target.value)}
                    // A space, not an empty string: :placeholder-shown is what
                    // tells the floating label whether the field is empty, and
                    // an input with no placeholder never matches it.
                    placeholder=" "
                  />
                  <span className="dv2-field-label">{field.label}</span>
                </label>
                </Fragment>
              ))}
            </div>

            <button type="submit" className="dv2-submit" disabled={status === 'sending'}>
              <span>
                {status === 'sending' ? 'Sending' : 'Request private consultation'}
              </span>
              <span aria-hidden="true">→</span>
            </button>

            {message && (
              <p className="dv2-status" role="status">
                {message}
              </p>
            )}

            <p className="dv2-note">{contact.privacyNote}</p>
          </form>
        </div>
      </div>
    </section>
  )
}
