/**
 * Single source of truth for every string, URL and data row on the site.
 * Components must import from here rather than hardcoding copy in JSX.
 *
 * PLACEHOLDER assets are marked with `TODO(asset)` — swapping them is a
 * one-file edit; no component changes are needed.
 */

export const BRAND = {
  name: 'SAAS',
  logoInitials: 'SP',
  eyebrow: 'Luxury Development',
  tagline: 'Landmarks for a generation that expects more.',
  email: 'enquiries@saasproperties.com',
  socials: [
    { label: 'Twitter', href: 'https://twitter.com' },
    { label: 'LinkedIn', href: 'https://linkedin.com' },
    { label: 'Instagram', href: 'https://instagram.com' },
    { label: 'YouTube', href: 'https://youtube.com' },
  ],
} as const

/** Looping hero background video — HLS with MP4 fallbacks. */
export const HERO_VIDEO = {
  // TODO(asset): replace with the Mux HLS playback URL.
  hls: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  // TODO(asset): replace with the Mux MP4 renditions.
  mp4Desktop: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4',
  mp4Mobile: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4',
  poster:
    'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format,compress&w=1920&q=60',
} as const

/**
 * Scroll-scrubbed flagship video. Must be encoded for seeking:
 * H.264 High, 1-second keyframe interval (-g 25), +faststart, no audio.
 * Mobile is the same footage re-encoded to 1080x1920 with letterbox bars.
 */
export const SCRUB_VIDEO = {
  // TODO(asset): replace with the imgix.video scrub-encoded MP4 (1920x1080).
  desktop: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4',
  // TODO(asset): replace with the 9:16 letterboxed re-encode (1080x1920). This
  // placeholder is landscape, so the portrait framing is not represented yet.
  mobile: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4',
  poster:
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format,compress&w=1920&q=60',
} as const

export const LOADER = {
  label: 'SAAS Properties',
  words: ['Luxury', 'Develop', 'Inspire'],
  durationMs: 2600,
  completeDelayMs: 600,
  wordIntervalMs: 700,
} as const

export const ROLES = ['Developer', 'Innovator', 'Landmark'] as const

export const NAV_LINKS = [
  { label: 'Flagship', id: 'flagship' },
  { label: 'Works', id: 'works' },
  { label: 'Tour', id: 'tour' },
  { label: 'Journal', id: 'journal' },
  { label: 'Gallery', id: 'explorations' },
] as const

export const SCROLL_STORY = {
  eyebrow: 'Flagship Development',
  title: 'The Ridge Residences',
  subtitle: 'Ninety-two residences carved into the escarpment.',
  scrollHint: 'Scroll to Explore',
  locations: [
    { name: 'Jumeirah Bay', detail: 'Dubai, UAE' },
    { name: 'Latitude 25.2°N', detail: 'Waterfront parcel' },
  ],
  travelTimes: [
    { label: 'Airport', value: '18 min' },
    { label: 'Downtown', value: '12 min' },
    { label: 'Marina', value: '25 min' },
  ],
} as const

export const SELECTED_WORKS = {
  eyebrow: 'Portfolio',
  title: 'Selected Works',
  cta: 'View Project',
} as const

export const PROJECTS = [
  {
    title: 'The Ridge Residences',
    description: [
      'Ninety-two residences terraced into a limestone escarpment, each oriented to hold the water line in view from every principal room.',
      'The structural frame steps back on every third floor, turning the roof of one home into the garden of the next.',
    ],
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format,compress&w=1600&q=70',
  },
  {
    title: 'Meridian House',
    description: [
      'A single-family commission on a narrow coastal lot, resolved as three stacked pavilions connected by an open-air stair.',
      'Board-formed concrete and unfinished brass patina together in the salt air, so the building darkens as the garden matures.',
    ],
    image:
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format,compress&w=1600&q=70',
  },
  {
    title: 'Foundry Quarter',
    description: [
      'Adaptive reuse of a 1930s casting works into forty loft residences, a courtyard market and a rooftop reservoir garden.',
      'The original travelling crane was retained and re-rigged as the armature for the courtyard lighting.',
    ],
    image:
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format,compress&w=1600&q=70',
  },
  {
    title: 'Aperture Tower',
    description: [
      'A forty-two storey residential tower whose facade rotates two degrees per floor, opening a different aperture to the sea at every level.',
      'Delivered eleven months ahead of programme through off-site bathroom and facade modules.',
    ],
    image:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format,compress&w=1600&q=70',
  },
] as const

export const KUULA_TOUR = {
  eyebrow: 'Immersive',
  title: 'Walk the Penthouse',
  subtitle:
    'A 360° capture of the north penthouse, photographed before handover styling.',
  cta: 'Open full experience',
  // TODO(asset): replace both with the SAAS Kuula post or collection URLs.
  // A collection swaps `/share/<id>` for `/share/collection/<id>`.
  shareUrl: 'https://kuula.co/share/NB8bM',
  embedUrl: 'https://kuula.co/share/NB8bM?logo=1&info=1&fs=1&vr=0&thumbs=1',
} as const

export const JOURNAL_SECTION = {
  eyebrow: 'Journal',
  title: 'Notes from the Studio',
} as const

export const JOURNAL = [
  {
    title: 'Why we stopped drawing balconies',
    readTime: '6 min read',
    date: 'March 2026',
    image:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format,compress&w=900&q=70',
  },
  {
    title: 'Concrete that gets better wet',
    readTime: '4 min read',
    date: 'February 2026',
    image:
      'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format,compress&w=900&q=70',
  },
  {
    title: 'The case for the narrow lot',
    readTime: '9 min read',
    date: 'January 2026',
    image:
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format,compress&w=900&q=70',
  },
  {
    title: 'What a reservoir garden costs',
    readTime: '7 min read',
    date: 'December 2025',
    image:
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format,compress&w=900&q=70',
  },
] as const

export const EXPLORATIONS_SECTION = {
  eyebrow: 'Studio',
  title: 'Visual playground',
  subtitle: 'Studies, models and details that never made the brochure.',
  cta: 'All Projects',
} as const

export const EXPLORATIONS = [
  {
    title: 'Escarpment study, 1:200',
    image:
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format,compress&w=1000&q=70',
  },
  {
    title: 'Brass handrail detail',
    image:
      'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format,compress&w=1000&q=70',
  },
  {
    title: 'Courtyard shading test',
    image:
      'https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?auto=format,compress&w=1000&q=70',
  },
  {
    title: 'Board-formed sample panel',
    image:
      'https://images.unsplash.com/photo-1494203484021-3c454daf695d?auto=format,compress&w=1000&q=70',
  },
  {
    title: 'Reservoir garden section',
    image:
      'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format,compress&w=1000&q=70',
  },
  {
    title: 'Facade rotation mock-up',
    image:
      'https://images.unsplash.com/photo-1470723710355-95304d8aece4?auto=format,compress&w=1000&q=70',
  },
] as const

export const STATS_SECTION = {
  eyebrow: 'By the numbers',
} as const

export const STATS = [
  { value: '1.4M', label: 'Square feet delivered', period: 'Since 2011' },
  { value: '38', label: 'Completed developments' },
  { value: '£2.1B', label: 'Gross development value', period: 'Current book' },
] as const

export const FOOTER = {
  eyebrow: 'Enquiries',
  heading: 'Start a conversation',
  backToTop: 'Back to top',
  copyright: `© ${new Date().getFullYear()} SAAS Properties LLC. All rights reserved.`,
} as const

export const ENQUIRE = {
  label: 'Enquire',
  targetId: 'contact',
} as const
