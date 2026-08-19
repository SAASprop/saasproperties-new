# SAAS Properties — Preview Site

Static marketing preview for a luxury real estate developer. Dark editorial theme,
scroll-scrubbed cinematic video, GSAP parallax.

Built to the spec in [prompt.md](prompt.md).

## Stack

Vite · React 19 · TypeScript (strict) · Tailwind CSS · GSAP · Framer Motion · hls.js · React Router

## Local development

```bash
npm install
npm run dev      # http://localhost:5173/claude-preview/
npm run build    # tsc -b && vite build  → dist/
npm run preview  # serve the production build
npm run lint     # oxlint
```

The dev URL includes `/claude-preview/` because `base` in
[vite.config.ts](vite.config.ts) matches the GitHub Pages repo name.

## Deployment

Pushing to `main` triggers
[.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml), which
builds and publishes `dist/` to GitHub Pages.

One-time setup: **Settings → Pages → Source = GitHub Actions**.

The repo must be named `claude-preview` — the Vite `base` is hardcoded to it. If
the repo is renamed, update `base` in `vite.config.ts` to match.

## Editing content

Every string, image URL and video URL lives in
[src/lib/content.ts](src/lib/content.ts). Components contain no hardcoded copy,
so text and asset changes are a one-file edit.

### Placeholder assets

Entries marked `TODO(asset)` in `content.ts` are stand-ins and should be replaced:

| Constant | Needs |
| --- | --- |
| `SCRUB_VIDEO.desktop` | Scrub-encoded MP4, 1920×1080 |
| `SCRUB_VIDEO.mobile` | Same footage at 1080×1920 with letterbox bars (the current placeholder is landscape) |
| `HERO_VIDEO.hls` / `.mp4Desktop` / `.mp4Mobile` | Mux HLS manifest + MP4 renditions |
| `KUULA_TOUR.shareUrl` / `.embedUrl` | The SAAS Kuula post or collection |
| `PROJECTS` / `JOURNAL` / `EXPLORATIONS` images | Real photography (currently Unsplash) |

Scroll-scrub video must be encoded for seeking, or the playhead will stutter:

```bash
ffmpeg -i input.mov -c:v libx264 -profile:v high -g 25 -keyint_min 25 \
  -sc_threshold 0 -vf scale=1920:1080 -an -movflags +faststart out.mp4
```

For the mobile variant, letterbox to portrait with the same settings:

```bash
-vf "scale=1080:-2,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black"
```

## Architecture notes

- **Motion libraries are kept apart by purpose.** GSAP owns ScrollTrigger
  scrubs and parallax; Framer Motion owns `AnimatePresence` and `whileInView`
  reveals. No component uses both — `Explorations` (GSAP) and `Lightbox`
  (Framer Motion) are split for exactly this reason.
- **Colours are HSL variables** in [src/index.css](src/index.css), mapped to
  Tailwind tokens (`bg`, `surface`, `text`, `muted`, `stroke`, `accent`) in
  [tailwind.config.js](tailwind.config.js). Don't use arbitrary values for
  brand colours.
- **The scroll-scrub video never plays.** Scroll position sets `currentTime`,
  eased toward the target at 0.08 per frame, skipping frames while a seek is
  already in flight.
- **Reduced motion is respected** throughout — GSAP effects bail out and the
  loader skips straight to its finished state.
