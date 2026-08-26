import type { ReactNode } from 'react'

/**
 * Social marks, kept separate from FeatureGlyph: those are amenity pictograms
 * this project invented, these are other companies' logos, and mixing them in
 * one union would let an amenity be given a TikTok icon.
 *
 * Drawn as thin-line outlines to sit with the rest of the icon set, rather than
 * pulling in a brand-icon package for five shapes.
 */
export type SocialIcon =
  | 'instagram'
  | 'linkedin'
  | 'facebook'
  | 'youtube'
  | 'tiktok'
  // Not accounts, but they sit in the same row and want the same drawing style.
  | 'phone'
  | 'whatsapp'

const PATHS: Record<SocialIcon, ReactNode> = {
  phone: (
    <path d="M6.3 3.4h2.1l1.1 2.8-1.5 1.1a8.4 8.4 0 0 0 4.7 4.7l1.1-1.5 2.8 1.1v2.1a1.9 1.9 0 0 1-2.1 1.9A11.6 11.6 0 0 1 4.4 5.5 1.9 1.9 0 0 1 6.3 3.4z" />
  ),
  whatsapp: (
    <>
      {/* The speech bubble with the tail at the lower left, which is what makes
          the mark read as WhatsApp rather than as a generic chat icon. */}
      <path d="M12 3.6a8.4 8.4 0 0 1 6.9 13.2l.8 3.2-3.3-.9A8.4 8.4 0 1 1 12 3.6z" />
      <path d="M9.3 8.2c.4 1.9 1.4 3.3 2.8 4.3.9.6 1.9 1 2.6 1.1" />
    </>
  ),
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.75" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="16.9" cy="7.1" r="0.95" fill="currentColor" stroke="none" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
      <path d="M8 10.6v5.9" />
      <circle cx="8" cy="7.9" r="0.9" fill="currentColor" stroke="none" />
      <path d="M11.9 16.5v-5.9" />
      <path d="M11.9 13.4a2.8 2.8 0 0 1 5.6 0v3.1" />
    </>
  ),
  facebook: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M14.6 8.3h-1.4a2 2 0 0 0-2 2v10.1" />
      <path d="M9.3 13.3h4.5" />
    </>
  ),
  youtube: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="3.5" />
      <path d="M10.4 9.6 15.6 12l-5.2 2.4z" />
    </>
  ),
  tiktok: (
    <>
      <path d="M14.3 3.5v10.3a3.65 3.65 0 1 1-3.65-3.65c.35 0 .69.05 1.01.15" />
      <path d="M14.3 3.5a4.7 4.7 0 0 0 4.4 4.4" />
    </>
  ),
}

export function SocialGlyph({
  icon,
  className,
}: {
  icon: SocialIcon
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
