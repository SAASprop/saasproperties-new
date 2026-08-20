import type { ReactNode } from 'react'
import type { FeatureIcon } from '../lib/property'

/**
 * Thin-line glyphs for the amenity cards, drawn rather than imported: an icon
 * font or sprite would be another request and another dependency for twelve
 * shapes. Every one is stroke-only on a 24x24 grid with no fills, so it inherits
 * its colour from the card via `currentColor` and stays crisp at any size.
 */
const PATHS: Record<FeatureIcon, ReactNode> = {
  // Film strip.
  cinema: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="1.5" />
      <path d="M7 5.5v13M17 5.5v13" />
      <path d="M4.6 8.5h.1M4.6 12h.1M4.6 15.5h.1M19.3 8.5h.1M19.3 12h.1M19.3 15.5h.1" />
    </>
  ),
  // Dumbbell.
  gym: (
    <>
      <path d="M4 9.5v5M7 7.5v9M17 7.5v9M20 9.5v5" />
      <path d="M7 12h10" />
    </>
  ),
  // Water.
  pool: (
    <>
      <path d="M2.5 8.5q2.75-2 5.5 0t5.5 0 5.5 0" />
      <path d="M2.5 13q2.75-2 5.5 0t5.5 0 5.5 0" />
      <path d="M2.5 17.5q2.75-2 5.5 0t5.5 0 5.5 0" />
    </>
  ),
  // Service bell.
  concierge: (
    <>
      <path d="M3.5 18h17" />
      <path d="M6 18a6 6 0 0 1 12 0" />
      <path d="M12 8V6.5" />
      <circle cx="12" cy="5" r="1.1" />
    </>
  ),
  // Bay marked P.
  parking: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
      <path d="M9.75 16.5v-9h3a2.75 2.75 0 0 1 0 5.5h-3" />
    </>
  ),
  // Sofa.
  lounge: (
    <>
      <rect x="3" y="11.5" width="18" height="6" rx="1.5" />
      <path d="M6 11.5V9a2.5 2.5 0 0 1 2.5-2.5h7A2.5 2.5 0 0 1 18 9v2.5" />
      <path d="M6 17.5V19M18 17.5V19" />
    </>
  ),
  // Connected systems.
  smart: (
    <>
      <path d="M4.5 11.5a9.5 9.5 0 0 1 15 0" />
      <path d="M8 15a5.5 5.5 0 0 1 8 0" />
      <circle cx="12" cy="18.5" r="1.1" />
    </>
  ),
  // Bolt.
  ev: <path d="M13.5 3 7 12.5h4L10.5 21 17 11.5h-4z" />,
  // Rising steam.
  sauna: (
    <>
      <path d="M3.5 20.5h17" />
      <path d="M8 17c0-2 1.75-2.4 1.75-4.4S8 10.2 8 8" />
      <path d="M12 17c0-2 1.75-2.4 1.75-4.4S12 10.2 12 8" />
      <path d="M16 17c0-2 1.75-2.4 1.75-4.4S16 10.2 16 8" />
    </>
  ),
  // Flame.
  bbq: (
    <path d="M12 21c3 0 5.5-2.2 5.5-5 0-3.6-3.5-5-3.5-9 0 0-2.5 1.5-2.5 4.5 0 1.4-.9 1.9-1.4 1.9S9 12.7 9 11.4C7.9 12.8 6.5 14.3 6.5 16c0 2.8 2.5 5 5.5 5z" />
  ),
  // Shield with a lens.
  security: (
    <>
      <path d="M12 3 19 6v6c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6z" />
      <circle cx="12" cy="11" r="2.1" />
    </>
  ),
  // Kite.
  play: (
    <>
      <path d="M12 3l6.5 6.5L12 19 5.5 9.5z" />
      <path d="M5.5 9.5h13M12 3v16" />
      <path d="M12 19q1.5 1.5 0 3" />
    </>
  ),

  // --- Location highlights ---

  // Cross in a circle.
  wellness: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  // Aircraft.
  airport: (
    <>
      <path d="M12 2.5c.9 0 1.5 1 1.5 2.3v4.4l6.5 3.9v2l-6.5-2v3.9l2.4 1.7v1.4L12 19.4l-3.9.7v-1.4l2.4-1.7v-3.9l-6.5 2v-2l6.5-3.9V4.8c0-1.3.6-2.3 1.5-2.3z" />
    </>
  ),
  // Open book.
  education: (
    <>
      <path d="M12 7.5v12" />
      <path d="M12 7.5C10.3 6.2 7.9 5.5 4.5 5.5v12c3.4 0 5.8.7 7.5 2 1.7-1.3 4.1-2 7.5-2v-12c-3.4 0-5.8.7-7.5 2z" />
    </>
  ),
  // Ticket.
  entertainment: (
    <>
      <path d="M3 8.5V6.5h18v2a2 2 0 0 0 0 7v2H3v-2a2 2 0 0 0 0-7z" />
      <path d="M12 8v8" strokeDasharray="1.5 2" />
    </>
  ),
  // Shopping bag.
  shopping: (
    <>
      <path d="M5 8h14l-1.1 12.5H6.1z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </>
  ),
  // Palm.
  leisure: (
    <>
      <path d="M12 20.5V10" />
      <path d="M12 10c-2.5-2.5-5.5-2.8-7.5-1 1.4-3.4 4.7-4.4 7.5-2.2" />
      <path d="M12 10c2.5-2.5 5.5-2.8 7.5-1-1.4-3.4-4.7-4.4-7.5-2.2" />
      <path d="M9 20.5h6" />
    </>
  ),
}

export function FeatureGlyph({
  icon,
  className,
}: {
  icon: FeatureIcon
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.1}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[icon]}
    </svg>
  )
}
