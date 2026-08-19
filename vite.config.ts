import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves the site from https://<user>.github.io/<repo>/, so every
// emitted asset URL must be prefixed with the repo name. Keep this in step with
// the repository name or the deployed page loads blank.
export default defineConfig({
  base: '/saasproperties-new/',
  plugins: [react()],
})
