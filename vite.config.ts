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

// GitHub Pages serves the site from https://<user>.github.io/<repo>/, so every
// emitted asset URL must be prefixed with the repo name. Keep this in step with
// the repository name or the deployed page loads blank.
export default defineConfig({
  base: '/saasproperties-new/',
  plugins: [react(), spaFallback()],
})
