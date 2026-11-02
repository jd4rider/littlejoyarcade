import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Relative base keeps the build valid on a GitHub Pages project path, on a
// Cloudflare Pages root domain, and inside Electron later on. Routing uses
// hash URLs, so no server-side SPA rewrite is required anywhere.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    sourcemap: false,
  },
})
