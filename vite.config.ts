import { copyFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Emit 404.html alongside index.html.
 *
 * This site is a single page with client-side routes (/design, /design-2), and
 * GitHub Pages is a static file host with no rewrite rule: asked for /design it
 * looks for a file at that path, finds nothing, and serves its own 404. The dev
 * server never shows this because it falls back to index.html for unknown paths
 * by itself, so deep links work locally and break only once deployed.
 *
 * Pages does serve a 404.html of ours when one exists, for any unmatched path.
 * Making it a byte-for-byte copy of index.html means the app boots, React Router
 * reads the URL it was actually asked for, and the right route renders — no
 * redirect, no flash of the wrong page, and nothing for a future route to
 * remember to register.
 *
 * The response still carries a 404 status, which is invisible to a visitor but
 * does mean a crawler will not index those two routes. That is the right trade
 * while they are internal comparisons; a route meant to be found would want
 * either real prerendering or a host that can rewrite.
 */
function spaFallback(): Plugin {
  let outDir = 'dist'

  return {
    name: 'spa-404-fallback',
    apply: 'build',
    configResolved(config) {
      // Absolute, and taken from the resolved config rather than assumed, so an
      // --outDir on the command line is still honoured.
      outDir = config.build.outDir
    },
    closeBundle() {
      const index = join(outDir, 'index.html')
      if (!existsSync(index)) return
      copyFileSync(index, join(outDir, '404.html'))
    },
  }
}

/**
 * Where the site is served from.
 *
 * The site is a root-level site: it runs at `/` in development and at `/` on any
 * real domain, which is what every asset URL is now built against.
 *
 * The one deployment that cannot use `/` is a GitHub Pages *project* site, which
 * is served from `https://<user>.github.io/<repo>/` — there, every emitted URL
 * has to carry the repo name or the page loads blank. That is a property of the
 * host, not of the code, so it comes in as an environment variable and the
 * workflow sets it. Nothing else in the codebase names a base path: components
 * read `import.meta.env.BASE_URL` (see `asset()` in lib/property) and Vite
 * rewrites the root-relative URLs in index.html, so both cases follow from this
 * one value.
 *
 *   VITE_BASE=/saasproperties-new/ npm run build   # GitHub Pages project site
 *   npm run build                                  # any root-level host
 */
const base = process.env.VITE_BASE || '/'

export default defineConfig({
  base,
  plugins: [react(), spaFallback()],

  build: {
    // The browsers this actually targets all support modern syntax, and
    // transpiling below that only adds bytes and helper functions to ship.
    target: 'es2020',

    // Vite's default is 4 kB, which inlined most of the country flags into the
    // JS as base64. Base64 is a third larger than the bytes it encodes and it
    // lands in the render-blocking bundle rather than in a file the browser can
    // fetch lazily and cache on its own. 1 kB keeps that for genuinely tiny
    // assets only.
    assetsInlineLimit: 1024,

    rollupOptions: {
      output: {
        /**
         * Split the three libraries out of the app chunk.
         *
         * They change far less often than the page does, so on a repeat visit
         * or a redeploy the browser can keep them: editing a section no longer
         * invalidates React and GSAP along with it. They also download in
         * parallel rather than as one long single-file transfer.
         *
         * Written as a function because Vite 8 bundles with Rolldown, whose
         * `manualChunks` takes a module id rather than Rollup's object map.
         */
        manualChunks: (id: string) => {
          if (!id.includes('node_modules')) return null
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react'
          if (/[\\/]node_modules[\\/]gsap[\\/]/.test(id)) return 'gsap'
          // framer-motion is deliberately not named here. Giving it a chunk of
          // its own made it a chunk of the entry, which Vite then emitted a
          // modulepreload for — so 130 kB was fetched at the highest priority on
          // every first load even though nothing above the fold uses it any
          // more. Left alone, it lands inside the one chunk that does.
          return null
        },
      },
    },
  },
})
