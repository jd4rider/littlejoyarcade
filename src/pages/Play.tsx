import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { gamesById } from '../data/games'
import { recordLaunch } from '../lib/arcade'
import { resolvePlayUrl, type PlayRoute } from '../lib/playUrl'
import NotFound from './NotFound'

export default function Play() {
  const { id } = useParams()
  const game = id ? gamesById.get(id) : undefined
  const shell = useRef<HTMLDivElement>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [route, setRoute] = useState<PlayRoute | null>(null)

  useEffect(() => {
    if (!game) return
    recordLaunch(game.id)
  }, [game])

  // Prefer the game's subdomain, but never leave the player pointed at a host
  // that cannot complete a TLS handshake: resolvePlayUrl probes it once and
  // returns the github.io build when the probe fails.
  useEffect(() => {
    if (!game) return
    let cancelled = false
    setRoute(null)
    void resolvePlayUrl(game).then((next) => {
      if (!cancelled) setRoute(next)
    })
    return () => {
      cancelled = true
    }
  }, [game])

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  if (!game) return <NotFound />

  const currentUrl = route?.url ?? game.playUrl

  const fallBack = () => {
    if (route?.source === 'subdomain') setRoute({ url: game.playUrl, source: 'canonical' })
  }

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await shell.current?.requestFullscreen()
    } catch {
      // Fullscreen can be blocked by the browser or an embedding iframe.
    }
  }

  return (
    <div ref={shell} className="flex h-dvh flex-col bg-ink-950">
      <header className="flex items-center justify-between gap-3 border-b border-white/10 bg-ink-900/90 px-3 py-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link to={`/game/${game.id}`} className="btn btn-ghost px-3 py-1.5 text-xs">
            ← Back
          </Link>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-cream">{game.name}</p>
            <p className="truncate text-[0.7rem] text-white/40">
              {game.runtime} · v{game.version}
              {route?.source === 'subdomain' ? ' · littlejoyarcade.site' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href={currentUrl} target="_blank" rel="noreferrer" className="btn btn-ghost px-3 py-1.5 text-xs">
            <span className="hidden sm:inline">Open in new tab</span>
            <span className="sm:hidden" aria-hidden="true">
              ↗
            </span>
          </a>
          <button type="button" onClick={toggleFullscreen} className="btn btn-ghost px-3 py-1.5 text-xs">
            {fullscreen ? 'Exit full screen' : 'Full screen'}
          </button>
        </div>
      </header>

      <div className="relative flex-1 overflow-hidden bg-black">
        {route ? (
          <iframe
            key={currentUrl}
            src={currentUrl}
            title={`${game.name} game`}
            className="h-full w-full border-0"
            allow="autoplay; fullscreen; gamepad; accelerometer; gyroscope"
            // Same trusted publisher, so scripts and storage are allowed; no
            // top-level navigation and no popups beyond the game's own links.
            sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-orientation-lock"
            referrerPolicy="strict-origin-when-cross-origin"
            onError={fallBack}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-white/50">Loading {game.name}…</div>
        )}
      </div>

      <p className="border-t border-white/10 bg-ink-900/90 px-4 py-2 text-center text-[0.7rem] text-white/35">
        If the game does not load, use “Open in new tab”. Progress in this game is saved on this device.{' '}
        <Link to={`/game/${game.id}`} className="font-semibold text-white/55 underline underline-offset-2 hover:text-cream">
          Rate this game
        </Link>
      </p>
    </div>
  )
}
