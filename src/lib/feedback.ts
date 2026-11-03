import { arcade } from './arcade'
import { supabase } from './supabase'

export const FEEDBACK_MAX_COMMENT = 2000
export const FEEDBACK_MAX_NAME = 32

export interface FeedbackSummary {
  gameId: string
  ratings: number
  average: number
}

export interface FeedbackRecord {
  id: string
  gameId: string
  rating: number
  comment: string | null
  playerName: string | null
  gameVersion: string | null
  createdAt: string
}

export interface LocalFeedback {
  rating: number
  comment: string
  at: number
}

const localKey = (gameId: string) => `lja:feedback:v1:${gameId}`

/** Ratings are whole stars, 1..5. Anything else means "not rated yet". */
export function clampRating(value: number): number {
  if (!Number.isFinite(value)) return 0
  const rounded = Math.round(value)
  return rounded < 1 || rounded > 5 ? 0 : rounded
}

export function normalizeComment(value: string): string | null {
  const clean = value.replace(/\r\n/g, '\n').trim().slice(0, FEEDBACK_MAX_COMMENT)
  return clean.length > 0 ? clean : null
}

export function normalizeName(value: string): string | null {
  const clean = value.replace(/\s+/g, ' ').trim().slice(0, FEEDBACK_MAX_NAME)
  return clean.length > 0 ? clean : null
}

/**
 * The browser remembers what this device already said, so the form can open
 * filled in rather than inviting an accidental duplicate. It is a convenience
 * only: the database is the source of truth.
 */
export function readLocalFeedback(gameId: string): LocalFeedback | null {
  try {
    const raw = localStorage.getItem(localKey(gameId))
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return null
    const entry = parsed as LocalFeedback
    const rating = clampRating(entry.rating)
    if (!rating) return null
    return {
      rating,
      comment: typeof entry.comment === 'string' ? entry.comment : '',
      at: typeof entry.at === 'number' ? entry.at : Date.now(),
    }
  } catch {
    return null
  }
}

function saveLocalFeedback(gameId: string, rating: number, comment: string): void {
  const entry: LocalFeedback = { rating, comment, at: Date.now() }
  try {
    localStorage.setItem(localKey(gameId), JSON.stringify(entry))
  } catch {
    // Storage blocked: the submission itself still went through.
  }
}

export async function submitFeedback(input: {
  gameId: string
  rating: number
  comment: string
  name: string
  version: string
  userId: string | null
}): Promise<{ error: string | null }> {
  const rating = clampRating(input.rating)
  if (!rating) return { error: 'Pick a star rating first.' }

  const comment = normalizeComment(input.comment)
  const playerName = normalizeName(input.name)
  const gameVersion = input.version.trim().slice(0, 24) || null

  if (!supabase) {
    return {
      error:
        'Feedback is not connected in this build. Email or open an issue and it will reach the same place.',
    }
  }

  if (input.userId) {
    // Update the existing row instead of adding a second rating; the partial
    // unique index on (game_id, user_id) makes a duplicate impossible anyway.
    const existing = await supabase
      .from('game_feedback')
      .select('id')
      .eq('game_id', input.gameId)
      .eq('user_id', input.userId)
      .maybeSingle()

    if (existing.error) return { error: existing.error.message }

    const result = existing.data
      ? await supabase
          .from('game_feedback')
          .update({ rating, comment, player_name: playerName, game_version: gameVersion })
          .eq('id', existing.data.id)
      : await supabase.from('game_feedback').insert({
          game_id: input.gameId,
          user_id: input.userId,
          rating,
          comment,
          player_name: playerName,
          game_version: gameVersion,
          source: 'portal',
        })

    if (result.error) return { error: result.error.message }
  } else {
    const { error } = await supabase.from('game_feedback').insert({
      game_id: input.gameId,
      user_id: null,
      rating,
      comment,
      player_name: playerName,
      game_version: gameVersion,
      source: 'portal',
    })
    if (error) return { error: error.message }
  }

  saveLocalFeedback(input.gameId, rating, comment ?? '')
  arcade.analytics.track('game_feedback', { gameId: input.gameId, rating })
  return { error: null }
}

/** Public average for every game, in one round trip. */
export async function loadFeedbackSummaries(): Promise<Map<string, FeedbackSummary>> {
  const summaries = new Map<string, FeedbackSummary>()
  if (!supabase) return summaries

  const { data, error } = await supabase.rpc('game_feedback_summary')
  if (error || !Array.isArray(data)) return summaries

  for (const row of data as { game_id?: unknown; ratings?: unknown; average?: unknown }[]) {
    const gameId = typeof row.game_id === 'string' ? row.game_id : ''
    const ratings = Number(row.ratings)
    const average = Number(row.average)
    if (!gameId || !Number.isFinite(ratings) || !Number.isFinite(average)) continue
    summaries.set(gameId, { gameId, ratings, average })
  }
  return summaries
}

/** Owner-only inbox. Row level security rejects this for anyone else. */
export async function loadFeedbackInbox(
  limit = 200,
): Promise<{ entries: FeedbackRecord[]; error: string | null }> {
  if (!supabase) return { entries: [], error: null }

  const { data, error } = await supabase
    .from('game_feedback')
    .select('id,game_id,rating,comment,player_name,game_version,created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return { entries: [], error: error.message }

  const entries = (data ?? []).map((row) => ({
    id: String(row.id),
    gameId: String(row.game_id),
    rating: clampRating(Number(row.rating)),
    comment: typeof row.comment === 'string' ? row.comment : null,
    playerName: typeof row.player_name === 'string' ? row.player_name : null,
    gameVersion: typeof row.game_version === 'string' ? row.game_version : null,
    createdAt: String(row.created_at ?? ''),
  }))

  return { entries, error: null }
}
