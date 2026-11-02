import { createArcade, createSupabaseCloud } from '@littlejoyarcade/sdk'
import { supabase } from './supabase'

// Portal-level arcade client. It records launches and local achievements, and
// automatically speaks to Supabase once the build has backend credentials.
export const arcade = createArcade({
  gameId: 'arcade',
  schemaVersion: 1,
  cloud: supabase ? createSupabaseCloud(supabase) : null,
})

const ACTIVITY_KEY = 'lja:activity:v1'
const MAX_ACTIVITY = 40

export interface ActivityEntry {
  gameId: string
  at: number
}

export function readActivity(): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (entry): entry is ActivityEntry =>
        typeof entry === 'object' &&
        entry !== null &&
        typeof (entry as ActivityEntry).gameId === 'string' &&
        typeof (entry as ActivityEntry).at === 'number',
    )
  } catch {
    return []
  }
}

export function recordLaunch(gameId: string): void {
  const entry: ActivityEntry = { gameId, at: Date.now() }
  const next = [entry, ...readActivity()].slice(0, MAX_ACTIVITY)
  try {
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(next))
  } catch {
    // storage blocked: the session still plays fine
  }
  arcade.analytics.track('game_launch', { gameId })
  arcade.analytics.track('session_start', { gameId })
}

export function clearActivity(): void {
  try {
    localStorage.removeItem(ACTIVITY_KEY)
  } catch {
    // ignore
  }
}
