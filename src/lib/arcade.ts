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
  /** Most recent launch, in epoch milliseconds. */
  at: number
  /** Launches of this game, so "sessions" survives a merge across devices. */
  plays: number
}

/**
 * Reads the device history, collapsing the old one-row-per-launch format into
 * one row per game. Older builds stored each launch separately, so the count is
 * recovered on the first read and written back as the compact form.
 */
export function readActivity(): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const byGame = new Map<string, ActivityEntry>()
    for (const value of parsed) {
      if (typeof value !== 'object' || value === null) continue
      const entry = value as Partial<ActivityEntry>
      if (typeof entry.gameId !== 'string' || typeof entry.at !== 'number' || !Number.isFinite(entry.at)) continue
      const plays =
        typeof entry.plays === 'number' && Number.isFinite(entry.plays) && entry.plays >= 1 ? Math.floor(entry.plays) : 1
      const existing = byGame.get(entry.gameId)
      if (existing) {
        existing.plays += plays
        existing.at = Math.max(existing.at, entry.at)
      } else {
        byGame.set(entry.gameId, { gameId: entry.gameId, at: entry.at, plays })
      }
    }
    return [...byGame.values()].sort((a, b) => b.at - a.at).slice(0, MAX_ACTIVITY)
  } catch {
    return []
  }
}

function writeActivity(entries: ActivityEntry[]): void {
  try {
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(entries.slice(0, MAX_ACTIVITY)))
  } catch {
    // storage blocked: the session still plays fine
  }
}

export function recordLaunch(gameId: string): void {
  const at = Date.now()
  const previous = readActivity()
  const existing = previous.find((entry) => entry.gameId === gameId)
  const entry: ActivityEntry = { gameId, at, plays: (existing?.plays ?? 0) + 1 }
  const next = [entry, ...previous.filter((item) => item.gameId !== gameId)].slice(0, MAX_ACTIVITY)
  writeActivity(next)
  arcade.analytics.track('game_launch', { gameId })
  arcade.analytics.track('session_start', { gameId })
  // Signed-out players just keep the local row; the RPC fails harmlessly then.
  if (supabase) void supabase.rpc('record_game_launch', { p_game_id: gameId })
}

/**
 * Merges the device shelf with the account's shelf. Both sides keep the newest
 * timestamp and the highest launch count per game, so signing in on a second
 * device brings its missing games across without losing what the first device
 * already had. Falls back to the device copy when offline or before the
 * migration has been applied.
 */
export async function syncActivity(): Promise<ActivityEntry[]> {
  const local = readActivity()
  if (!supabase) return local

  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user?.id
  if (!userId) return local

  const { data, error } = await supabase
    .from('game_activity')
    .select('game_id,last_played_at,play_count')
    .eq('user_id', userId)
    .returns<Array<{ game_id: string; last_played_at: string; play_count: number }>>()
  if (error) return local

  const remoteIds = new Set<string>()
  const merged = new Map(local.map((entry) => [entry.gameId, { ...entry }]))
  for (const row of data ?? []) {
    if (typeof row.game_id !== 'string') continue
    const at = Date.parse(row.last_played_at)
    if (!Number.isFinite(at)) continue
    remoteIds.add(row.game_id)
    const plays = Number.isFinite(row.play_count) ? Math.max(1, Math.floor(row.play_count)) : 1
    const existing = merged.get(row.game_id)
    if (existing) {
      existing.at = Math.max(existing.at, at)
      existing.plays = Math.max(existing.plays, plays)
    } else {
      merged.set(row.game_id, { gameId: row.game_id, at, plays })
    }
  }

  const next = [...merged.values()].sort((a, b) => b.at - a.at).slice(0, MAX_ACTIVITY)
  writeActivity(next)

  // First sign-in on a device that already played as a guest: upload the games
  // the account has never seen. Existing rows are left to the launch RPC.
  const missing = next.filter((entry) => !remoteIds.has(entry.gameId))
  if (missing.length > 0) {
    void supabase.from('game_activity').upsert(
      missing.map((entry) => ({
        user_id: userId,
        game_id: entry.gameId,
        last_played_at: new Date(entry.at).toISOString(),
        play_count: entry.plays,
      })),
      { onConflict: 'user_id,game_id' },
    )
  }

  return next
}

export function clearActivity(): void {
  try {
    localStorage.removeItem(ACTIVITY_KEY)
  } catch {
    // ignore
  }
}
