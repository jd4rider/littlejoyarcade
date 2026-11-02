import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Relative base keeps the build valid on the GitHub Pages project path, on the
// custom domain root, and inside Electron later on. Routing uses hash URLs, so
// no server-side SPA rewrite is required anywhere.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    sourcemap: false,
  },
})
