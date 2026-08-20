# Overview

Build a static React single-page application as a marketing preview site for a luxury real estate developer (SAAS). The site should feel like a high-end editorial product — dark theme, cinematic video, smooth scroll animations — not a typical property listing site.
1
Deploy to GitHub Pages via GitHub Actions on every push to `main`. No PR process needed.

**Stack:**

- Vite + React 19 + TypeScript (strict mode)
- Tailwind CSS for styling
- GSAP for scroll-driven animations and timelines
- Framer Motion for component enter/exit transitions
- `hls.js` for adaptive video streaming
- `react-router-dom` for routing (single route, but needed for base path)

---

## Architecture decisions

- All copy, URLs, and project data live in a single `src/lib/content.ts` file. Components import from there — no hardcoded strings in JSX.
- Vite base URL is `/claude-preview/` (the GitHub Pages repo name). All asset paths must be relative to this base.
- TypeScript strict mode on: `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly: true`. Do not use `const enum`.
- Theme colors are HSL CSS variables in `src/index.css`, mapped to Tailwind tokens in `tailwind.config.js`. Never use arbitrary Tailwind values for brand colors.
- GSAP and Framer Motion are intentionally both present but kept separated by purpose — do not mix them in the same component.

---

## Page structure (top to bottom)

The single page (`src/pages/Index.tsx`) renders these sections in order:

1. **LoadingScreen** — fullscreen overlay, fades out before the rest appears
2. **Navbar** — fixed, outside the loading gate
3. **ScrollStory** — hero/flagship section with scroll-scrubbed video
4. **SelectedWorks** — project cards grid
5. **VirtualTour** — embedded 360° iframe (Kuula)
6. **Journal** — editorial article cards
7. **Explorations** — parallax image gallery with lightbox
8. **Stats** — key brand numbers
9. **ContactFooter** — email, socials, copyright

---

## Section-by-section requirements

### LoadingScreen

- Fullscreen dark overlay (`z-[9999]`)
- Animated word rotation (e.g. "Luxury / Develop / Inspire") in large italic serif
- Numeric counter 000 → 100 in bottom-right, eased with quadratic in-out
- Thin accent-gradient progress bar along the bottom edge
- Fades out after counter hits 100; `onComplete` callback reveals the page
- Respect `prefers-reduced-motion`: skip animation, show static state briefly then dismiss

### Navbar

- Fixed top bar, `z-50`
- **Desktop**: logo floated left (outside the pill), frosted-glass pill in center with nav links + "Enquire ↗" CTA, invisible spacer div on the right for optical balance
- **Mobile**: logo hidden, hamburger button top-right; tapping opens a fullscreen overlay with large italic nav links and an Enquire button
- Active section tracking via `IntersectionObserver` on each section id; highlight the matching nav link
- Pill gets a subtle drop shadow once the user scrolls past 100 px

### ScrollStory (flagship section)

- 600 vh tall section; inner content is `position: sticky, top: 0, height: 100vh`
- Layout: title row at top → video panel (flex-1) → location bar at bottom
- Video is scrubbed frame-by-frame via scroll position — it never plays autonomously
- Use a **separate video source for mobile** (portrait 9:16 with black bars) vs desktop (landscape 16:9); switch at 768 px breakpoint
- Video readiness: listen for `loadedmetadata` OR `canplay` (whichever fires first); call `video.load()` explicitly on mount for mobile
- Scrubbing loop: on scroll, compute `progress = -rect.top / (section.offsetHeight - window.innerHeight)`, map to `video.duration`, lerp `displayTime` toward `targetTime` at factor 0.08 per rAF tick, seek only when not already seeking
- Progress bar: thin 2 px bar at bottom of video, width tracks `displayTime / duration`
- "Scroll to Explore" hint fades out once the user has scrolled 3% into the section
- Location bar (below video): two location labels left, travel-time chips right (responsive — stacks on mobile)
- Framer Motion `AnimatePresence` for the title, scroll hint, and location bar fade-ins

### SelectedWorks

- Section heading with eyebrow text and a thin horizontal rule
- Project cards: full-bleed image, title, multi-paragraph description, "View Project →" link
- Use a simple alternating or grid layout; images from CDN with `auto=format,compress` params
- Data driven from `PROJECTS` array in `content.ts`

### VirtualTour

- Section heading + subtitle
- `<iframe>` embed of a Kuula 360° tour, 16:9 aspect ratio, rounded corners
- "Open full experience ↗" link opens the share URL in a new tab
- Framer Motion fade-in on scroll into view

### Journal

- 2×2 (or 4-column on desktop) card grid
- Each card: image placeholder or thumbnail, read time, date, article title
- Minimal editorial styling — small caps labels, serif italic title
- Data from `JOURNAL` array in `content.ts`

### Explorations

- Two-column parallax gallery; col 1 scrolls slightly upward, col 2 slightly downward (GSAP ScrollTrigger scrub)
- Cards are square, slightly rotated alternating ±2–3 °, rounded corners
- Clicking a card opens a fullscreen lightbox (Framer Motion scale + fade); ESC closes it
- Center of the section has pinned heading text ("Visual playground") that stays visible during the scroll
- "All Projects →" CTA inside the pinned content

### Stats

- Three stats displayed horizontally: `value` large, `label` small, optional `period` badge
- Subtle entrance animation (Framer Motion whileInView)
- Data from `STATS` array in `content.ts`

### ContactFooter

- Brand email as a large display link
- Social links row (Twitter, LinkedIn, Instagram, YouTube)
- Copyright line and a "Back to top" scroll button

---

## Video delivery

Two separate pipelines — keep them separate:

**Hero video** (if used as a looping background):

- HLS adaptive streaming via Mux; `hls.js` for non-native HLS browsers
- MP4 fallback for browsers that support it natively
- Encapsulate in a `useHlsVideo(ref, { hls, mp4Desktop, mp4Mobile })` hook
- Switch to mobile src at ≤768 px

**Scroll-scrub video** (ScrollStory):

- Plain MP4 from a video CDN (e.g. imgix.video)
- Must be encoded for seeking: H.264 High, 1920×1080, 1-second keyframe interval (`-g 25`), two-pass at ≤80 MB, `-movflags +faststart`, no audio
- For mobile: re-encode as 1080×1920 (9:16) with black letterbox bars, same encoding params
- Use the `/encode-scrub-video-mobile` Claude Code skill for this FFmpeg workflow

---

## Design system

### Colors (dark theme only)

```css
--bg: 0 0% 4%; /* near-black page background */
--surface: 0 0% 8%; /* card / navbar backgrounds */
--text: 0 0% 96%; /* primary text */
--muted: 0 0% 53%; /* secondary labels, captions */
--stroke: 0 0% 12%; /* borders and dividers */
--accent: 0 0% 96%; /* same as text; gradient uses specific hex values */
```

### Accent gradient

```css
/* Use these two hex values — not arbitrary stops */
background: linear-gradient(90deg, #89aacc 0%, #4e85bf 100%);
```

Apply as:

- `.accent-gradient` — background fill (progress bars, loading bar)
- `.accent-gradient-text` — gradient text via `background-clip: text`
- `.gradient-border-ring` — pseudo-element halo that appears on hover around pill buttons

### Typography

- Display / editorial: a serif italic (`font-display`) — use for large headings, the brand name, section titles
- Body: a clean sans-serif (`font-body`) — set as default on `<body>`
- Labels and eyebrows: `uppercase tracking-[0.3em]` at `text-[10px]` or `text-xs`

### Motion rules

- **GSAP**: ScrollTrigger scrubs, parallax, timeline entrance sequences
- **Framer Motion**: `AnimatePresence` fades, `whileInView` reveals, layout transitions
- Never use GSAP inside a component that already uses Framer Motion layout animations, and vice versa
- Always guard GSAP `useEffect`s with `prefers-reduced-motion` check; skip animations if true
- Clean up: return `ctx.revert()` from every GSAP context, cancel rAF IDs, disconnect IntersectionObservers

---

## Deployment

```yaml
# .github/workflows/deploy-pages.yml
# Trigger: push to main
# Steps: checkout → setup Node → npm ci → npm run build → upload artifact → deploy to Pages
```

GitHub Pages settings: source = GitHub Actions. No custom domain needed for preview.

---

## Content file structure

`src/lib/content.ts` exports named constants only — no default export:

```ts
export const BRAND = { name, logoInitials, eyebrow, tagline, email, socials }
export const HERO_VIDEO = { hls, mp4Desktop, mp4Mobile, poster }
export const LOADER = { label, words, durationMs, completeDelayMs, wordIntervalMs }
export const ROLES = ["Developer", "Innovator", "Landmark"] as const
export const PROJECTS = [{ title, description, image }]
export const JOURNAL = [{ title, readTime, date, image }]
export const STATS = [{ value, label, period? }]
export const KUULA_TOUR = { title, subtitle, shareUrl, embedUrl }
export const EXPLORATIONS = [{ title, image }]
```

---

## Commit style

- Commit directly to `main` — no PR process
- Short imperative subject line, no body needed for small changes
- Do **not** add `Co-Authored-By` trailers
