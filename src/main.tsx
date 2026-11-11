import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import { AuthProvider } from './lib/auth'
import { GAMES, replaceCatalog } from './data/games'
import type { Game } from './data/games'
import { supabase } from './lib/supabase'
import './index.css'

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root element')

declare global {
  interface Window {
    __ljaBooted?: boolean
    __ljaBoot?: { done: () => void; failed: () => void }
  }
}

/**
 * The database is the source of truth for the catalogue. The bundled catalogue
 * is only a fallback: it keeps the site working offline or if Supabase is down.
 */
async function loadCatalog(): Promise<void> {
  if (!supabase) return
  try {
    const query = supabase.from('games').select('manifest').eq('status', 'live').order('sort_order')
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500))
    const result = await Promise.race([query, timeout])
    if (!result || result.error) return
    const games = (result.data ?? [])
      .map((row) => row.manifest as Game | null)
      .filter((game): game is Game => Boolean(game && game.id && game.playUrl))
    // The bundled catalogue is the fallback for games that are live but not yet
    // seeded in the database, so a newly shipped game still appears on the
    // shelf without a service-role publish step.
    const bundled = [...GAMES]
    const known = new Set(games.map((game) => game.id))
    replaceCatalog([...games, ...bundled.filter((game) => !known.has(game.id))])
  } catch {
    // Static catalogue stays in place.
  }
}

void loadCatalog().finally(() => {
  createRoot(root).render(
    <StrictMode>
      <ErrorBoundary>
        <HashRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </HashRouter>
      </ErrorBoundary>
    </StrictMode>,
  )
  // Tells the inline shell in index.html that the app painted, so it can drop
  // the loading note and stop watching for a stale bundle. Waiting a frame
  // keeps the note up until React's first commit is actually on screen.
  requestAnimationFrame(() => window.__ljaBoot?.done())
})
