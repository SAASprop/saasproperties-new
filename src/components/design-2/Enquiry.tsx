import { Fragment, useState } from 'react'
import { BRAND } from '../../lib/content'
import { PROPERTY } from '../../lib/property'
import { useEnquiry } from '../../lib/enquiry'

const { contact } = PROPERTY

const FIELDS = [
  { name: 'firstName', label: 'First name', type: 'text', autoComplete: 'given-name', half: true },
  { name: 'lastName', label: 'Last name', type: 'text', autoComplete: 'family-name', half: true },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email', half: false },
  { name: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel', half: true },
] as const

const DIAL_CODES = ['+971', '+966', '+974', '+973', '+968', '+965', '+44', '+1'] as const

/**
 * The enquiry.
 *
 * Behaviour is the production form's, through `useEnquiry`: same fields, same
 * dial codes, same endpoint, and the same honest handling when no endpoint is
 * configured — the fields go to the visitor's mail client and the status says
 * drafted, not sent. Only the framing differs.
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
    <section className="d2-section" id="d2-enquiry">
      <div className="d2-wrap">
        <div className="d2-enquiry">
          <div>
            <p className="d2-kicker">Private enquiry</p>
            <h2
              className="d2-head d2-hide"
              data-k="lines"
              style={{ marginTop: '1.5rem', maxWidth: '16ch' }}
            >
              Speak with a <em>specialist</em>
            </h2>

            <p
              className="d2-lede d2-hide"
              data-k="rise"
              style={{ marginTop: '2rem', maxWidth: '34ch' }}
            >
              {contact.body}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2.5rem' }}>
              <div className="d2-hero-cell" style={{ alignItems: 'flex-start' }}>
                <span className="d2-label">Direct</span>
                <a
                  href={`mailto:${BRAND.email}`}
                  className="d2-value"
                  style={{ textDecoration: 'none' }}
                >
                  {BRAND.email}
                </a>
              </div>
              <div className="d2-hero-cell" style={{ alignItems: 'flex-start' }}>
                <span className="d2-label">Residence</span>
                <span className="d2-value">
                  {PROPERTY.name} · {PROPERTY.place.detail}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="d2-hide" data-k="rise">
            <p className="d2-fine" style={{ marginTop: 0 }}>
              {contact.formNote}
            </p>

            <div className="d2-form-grid">
              {FIELDS.map((field) => (
                <Fragment key={field.name}>
                  {/* The dial code takes the half beside Phone. */}
                  {field.name === 'phone' && (
                    <label className="d2-field">
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
                      <span className="d2-field-tag" style={{ top: '0.2rem' }}>
                        Code
                      </span>
                    </label>
                  )}

                  <label className="d2-field" data-span={field.half ? undefined : 'full'}>
                    <input
                      name={field.name}
                      type={field.type}
                      autoComplete={field.autoComplete}
                      required={field.name !== 'phone'}
                      maxLength={256}
                      value={values[field.name]}
                      onChange={(event) => setField(field.name, event.target.value)}
                      // A space, not empty: :placeholder-shown is what tells the
                      // floating tag whether the field has content.
                      placeholder=" "
                    />
                    <span className="d2-field-tag">{field.label}</span>
                  </label>
                </Fragment>
              ))}
            </div>

            <button type="submit" className="d2-send" disabled={status === 'sending'}>
              <span>{status === 'sending' ? 'Sending' : 'Request a private viewing'}</span>
              <span aria-hidden="true">&#8594;</span>
            </button>

            {message && (
              <p className="d2-status" role="status">
                {message}
              </p>
            )}

            <p className="d2-fine">{contact.privacyNote}</p>
          </form>
        </div>
      </div>
    </section>
  )
}
