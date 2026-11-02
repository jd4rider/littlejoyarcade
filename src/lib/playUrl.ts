import type { Game } from '../data/games'

// Which host a game is played from. The subdomain is preferred because it is
// the friendlier URL, but it only works once GitHub has issued its certificate;
// otherwise the same build is served from the canonical github.io path.
export interface PlayRoute {
  url: string
  source: 'subdomain' | 'canonical'
}

const PROBE_TIMEOUT_MS = 2500
const CACHE_TTL_MS = 10 * 60 * 1000
const CACHE_PREFIX = 'lja:play-route:'

function readCache(gameId: string): PlayRoute | null {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + gameId)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { route: PlayRoute; at: number }
    if (!parsed?.route?.url || Date.now() - parsed.at > CACHE_TTL_MS) return null
    return parsed.route
  } catch {
    return null
  }
}

function writeCache(gameId: string, route: PlayRoute): void {
  try {
    sessionStorage.setItem(CACHE_PREFIX + gameId, JSON.stringify({ route, at: Date.now() }))
  } catch {
    // Private mode or a blocked storage partition: probing still works, it just
    // happens on every launch.
  }
}

/** True when the URL answers at the transport level (any HTTP status counts). */
export async function probeReachable(url: string, timeoutMs = PROBE_TIMEOUT_MS): Promise<boolean> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    // `no-cors` keeps this a simple request: an opaque response still proves the
    // host resolved and completed a TLS handshake. A missing certificate, a DNS
    // failure or a timeout rejects instead.
    await fetch(url, { mode: 'no-cors', cache: 'no-store', signal: controller.signal })
    return true
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

export async function resolvePlayUrl(game: Game): Promise<PlayRoute> {
  const canonical: PlayRoute = { url: game.playUrl, source: 'canonical' }
  if (!game.preferredPlayUrl) return canonical

  const cached = readCache(game.id)
  if (cached) return cached

  const reachable = await probeReachable(game.preferredPlayUrl)
  const route: PlayRoute = reachable
    ? { url: game.preferredPlayUrl, source: 'subdomain' }
    : canonical
  writeCache(game.id, route)
  return route
}
