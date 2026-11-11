import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { gamesById } from '../data/games'
import { recordLaunch } from '../lib/arcade'
import { resolvePlayUrl, type PlayRoute } from '../lib/playUrl'
import { supabase } from '../lib/supabase'
import NotFound from './NotFound'

export default function Play() {
  const { id } = useParams()
  const game = id ? gamesById.get(id) : undefined
  const shell = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLIFrameElement>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [immersive, setImmersive] = useState(false)
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

  // The portal and the games do not share an origin, so the only way a player
  // who signed in here is also signed in inside a game is a targeted
  // postMessage. The game's arcade client checks our origin before trusting it.
  const postSession = useCallback(async () => {
    if (!route || !supabase) return
    let origin: string
    try {
      origin = new URL(route.url).origin
    } catch {
      return
    }
    const { data } = await supabase.auth.getSession()
    frame.current?.contentWindow?.postMessage({ type: 'lja:session', session: data.session ?? null }, origin)
  }, [route])

  useEffect(() => {
    if (!route || !supabase) return
    const client = supabase
    let origin: string
    try {
      origin = new URL(route.url).origin
    } catch {
      return
    }
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== origin) return
      const payload = event.data as
        | { type?: string; session?: { access_token?: string; refresh_token?: string } | null }
        | null
      if (!payload) return
      if (payload.type === 'lja:ready') {
        void postSession()
        return
      }
      if (payload.type !== 'lja:auth') return
      // The game signed in or out on its own; mirror it here so the header and
      // every other game agree on who is playing.
      const session = payload.session
      if (session?.access_token && session.refresh_token) {
        void client.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        })
      } else {
        void client.auth.signOut()
      }
    }
    window.addEventListener('message', onMessage)
    const { data } = client.auth.onAuthStateChange(() => {
      void postSession()
    })
    return () => {
      window.removeEventListener('message', onMessage)
      data.subscription.unsubscribe()
    }
  }, [postSession, route])

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  if (!game) return <NotFound />

  const currentUrl = route?.url ?? game.playUrl
  // Version-stamped so a shipped fix is fetched instead of a cached game shell
  // (GitHub Pages serves HTML with a ten minute cache).
  const framedUrl = `${currentUrl}${currentUrl.includes('?') ? '&' : '?'}v=${encodeURIComponent(game.version)}`

  const fallBack = () => {
    if (route?.source === 'subdomain') setRoute({ url: game.playUrl, source: 'canonical' })
  }

  const toggleFullscreen = async () => {
    if (immersive) {
      setImmersive(false)
      return
    }
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
        return
      }
      if (shell.current?.requestFullscreen) {
        await shell.current.requestFullscreen()
        return
      }
    } catch {
      // Mobile Safari and some embedded browsers refuse element fullscreen.
    }
    // Fall back to a viewport-filling shell and hide the portal chrome.
    setImmersive(true)
  }

  const chromeHidden = immersive || fullscreen

  return (
    <div
      ref={shell}
      className={`flex h-dvh flex-col bg-ink-950 ${immersive ? 'fixed inset-0 z-[100] h-screen' : ''}`}
    >
      {!chromeHidden && (
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
          <a href={framedUrl} target="_blank" rel="noreferrer" className="btn btn-ghost px-3 py-1.5 text-xs">
            <span className="hidden sm:inline">Open in new tab</span>
            <span className="sm:hidden" aria-hidden="true">
              ↗
            </span>
          </a>
          <button type="button" onClick={toggleFullscreen} className="btn btn-ghost px-3 py-1.5 text-xs">
            {chromeHidden ? 'Exit full screen' : 'Full screen'}
          </button>
        </div>
      </header>
      )}

      <div className="relative flex-1 overflow-hidden bg-black">
        {chromeHidden && (
          <button
            type="button"
            onClick={toggleFullscreen}
            className="absolute right-2 top-2 z-20 rounded-full border border-white/25 bg-ink-950/75 px-3 py-2 text-xs font-semibold text-cream backdrop-blur"
          >
            Exit full screen
          </button>
        )}
        {route ? (
          <iframe
            ref={frame}
            key={framedUrl}
            src={framedUrl}
            title={`${game.name} game`}
            onLoad={() => void postSession()}
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

      {!chromeHidden && (
      <p className="border-t border-white/10 bg-ink-900/90 px-4 py-2 text-center text-[0.7rem] text-white/35">
        If the game does not load, use “Open in new tab”. Progress in this game is saved on this device.{' '}
        <Link to={`/game/${game.id}`} className="font-semibold text-white/55 underline underline-offset-2 hover:text-cream">
          Rate this game
        </Link>
      </p>
      )}
    </div>
  )
}
