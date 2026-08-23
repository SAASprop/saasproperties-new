import { useState } from 'react'
import { BRAND } from './content'
import { PROPERTY } from './property'

/**
 * The enquiry form's behaviour, without any of its markup.
 *
 * The production Contact section carries its own copy of this logic. It is
 * deliberately not refactored to share this module: the brief for the /design
 * route was explicit that nothing architectural may change under the live page,
 * and rewiring a working form's submit path is exactly that. So this exists for
 * the new route, the old one is left alone, and the two can be merged later by
 * pointing Contact at this hook — the behaviour is identical.
 */

export interface EnquiryValues {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export type EnquiryStatus = 'idle' | 'sending' | 'done' | 'handoff' | 'error'

const EMPTY: EnquiryValues = { firstName: '', lastName: '', email: '', phone: '' }

/** Composes a mail draft, used while no form endpoint is configured. */
function mailtoFor(values: EnquiryValues, dial: string): string {
  const body = [
    `Name: ${values.firstName} ${values.lastName}`.trim(),
    `Email: ${values.email}`,
    values.phone ? `Phone: ${dial} ${values.phone}` : null,
    `Property: ${PROPERTY.name}`,
  ]
    .filter(Boolean)
    .join('\n')

  return `mailto:${BRAND.email}?subject=${encodeURIComponent(
    `Enquiry — ${PROPERTY.name}`,
  )}&body=${encodeURIComponent(body)}`
}

export function useEnquiry(dial: string) {
  const [values, setValues] = useState<EnquiryValues>(EMPTY)
  const [status, setStatus] = useState<EnquiryStatus>('idle')

  const setField = (name: keyof EnquiryValues, value: string) =>
    setValues((current) => ({ ...current, [name]: value }))

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('sending')

    const { contact } = PROPERTY

    // No endpoint configured: hand off to the visitor's mail client with the
    // fields already filled in, rather than swallowing the submission.
    if (!contact.endpoint) {
      window.location.href = mailtoFor(values, dial)
      // Deliberately not 'done'. Nothing has been received yet, only drafted —
      // claiming otherwise would tell someone their enquiry is with us while it
      // is still sitting unsent in their mail client.
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

  return { values, status, setField, submit }
}
