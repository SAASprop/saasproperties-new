/**
 * Single source of truth for every string, URL and data row on the site.
 * Components must import from here rather than hardcoding copy in JSX.
 *
 * PLACEHOLDER assets are marked with `TODO(asset)` — swapping them is a
 * one-file edit; no component changes are needed.
 */

export const BRAND = {
  name: "SAAS",
  logoInitials: "SP",
  eyebrow: "Luxury Development",
  tagline: "Landmarks for a generation that expects more.",
  email: "enquiries@saasproperties.com",
  // TODO(copy): every href below is the bare platform domain, not a SAAS
  // Properties profile. Swap in the real account URLs before launch.
  socials: [
    { label: "Instagram", href: "https://instagram.com", icon: "instagram" },
    { label: "LinkedIn", href: "https://linkedin.com", icon: "linkedin" },
    { label: "Facebook", href: "https://facebook.com", icon: "facebook" },
    { label: "YouTube", href: "https://youtube.com", icon: "youtube" },
    { label: "TikTok", href: "https://tiktok.com", icon: "tiktok" },
  ],
  // TODO(copy): placeholder number — swap in the real sales line. Both entries
  // read from this, so it only has to be changed once.
  phone: {
    display: "+971 2 123 4567",
    // E.164, digits only after the +, which is what tel: and wa.me both want.
    e164: "97121234567",
  },
} as const;

/**
 * Scroll-scrubbed flagship video. Must be encoded for seeking:
 * H.264 High, 1-second keyframe interval (-g 25), +faststart, no audio.
 * Mobile is the same footage re-encoded to 1080x1920 with letterbox bars.
 */
export const SCRUB_VIDEO = {
  // TODO(asset): replace with the imgix.video scrub-encoded MP4 (1920x1080).
  desktop:
    "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4",
  // TODO(asset): replace with the 9:16 letterboxed re-encode (1080x1920). This
  // placeholder is landscape, so the portrait framing is not represented yet.
  mobile:
    "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4",
  poster:
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format,compress&w=1920&q=60",
} as const;

export const LOADER = {
  label: "SAAS Properties",
  words: ["Luxury", "Develop", "Inspire"],
  durationMs: 2600,
  completeDelayMs: 600,
  wordIntervalMs: 700,
} as const;

/**
 * The single-property page outline. Only `overview` (the hero) and `contact`
 * exist so far — the rest are the sections still to be built, and each `id` is
 * the anchor its section must carry. Links to a section that does not exist yet
 * are inert rather than broken: the observer skips missing nodes and the click
 * handler no-ops.
 */
export const NAV_LINKS = [
  { label: "Overview", id: "overview" },
  { label: "Features", id: "features" },
  { label: "Gallery", id: "gallery" },
  { label: "Floor Plans", id: "floor-plan" },
  { label: "Location", id: "location" },
] as const;

export const SCROLL_STORY = {
  eyebrow: "Flagship Development",
  title: "The Ridge Residences",
  subtitle: "Ninety-two residences carved into the escarpment.",
  scrollHint: "Scroll to Explore",
  locations: [
    { name: "Jumeirah Bay", detail: "Dubai, UAE" },
    { name: "Latitude 25.2°N", detail: "Waterfront parcel" },
  ],
  travelTimes: [
    { label: "Airport", value: "18 min" },
    { label: "Downtown", value: "12 min" },
    { label: "Marina", value: "25 min" },
  ],
} as const;

export const FOOTER = {
  eyebrow: "Enquiries",
  heading: "Start a conversation",
  backToTop: "Back to top",
  copyright: `© ${new Date().getFullYear()} SAAS Properties LLC. All rights reserved.`,
} as const;

export const ENQUIRE = {
  label: "Contact Us",
  targetId: "contact",
} as const;
