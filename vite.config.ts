import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves the site from https://<user>.github.io/claude-preview/,
// so every emitted asset URL must be prefixed with the repo name.
export default defineConfig({
  base: '/claude-preview/',
  plugins: [react()],
})
