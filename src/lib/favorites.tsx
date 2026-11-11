import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from './auth'
import { supabase } from './supabase'

// Favorites are local-first: the device always has the shelf, and a signed-in
// account is the shared copy. If the account is unreachable (offline, or the
// migration has not been applied yet) the device copy keeps working and the
// change is queued for the next successful load.
const GUEST_KEY = 'lja:favorites:v1'
const GUEST_MARKER_KEY = 'lja:favorites:guest:v1'
const PENDING_KEY = 'lja:favorites:pending:v1'
const MAX_FAVORITES = 200
const GAME_ID = /^[a-z0-9-]{2,40}$/

interface Pending {
  add: string[]
  remove: string[]
}

function cleanIds(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((id): id is string => typeof id === 'string' && GAME_ID.test(id)).slice(0, MAX_FAVORITES)
}

function readLocalFavorites(): string[] {
  try {
    const raw = localStorage.getItem(GUEST_KEY)
    return raw ? cleanIds(JSON.parse(raw)) : []
  } catch {
    return []
  }
}

function writeLocalFavorites(ids: string[]): void {
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(ids))
  } catch {
    // storage blocked: favoriting still works for this page view
  }
}

function markGuestPicks(): void {
  try {
    localStorage.setItem(GUEST_MARKER_KEY, '1')
  } catch {
    // ignore
  }
}

function readGuestPicks(): string[] {
  try {
    return localStorage.getItem(GUEST_MARKER_KEY) === '1' ? readLocalFavorites() : []
  } catch {
    return []
  }
}

function clearGuestPicks(): void {
  try {
    localStorage.removeItem(GUEST_MARKER_KEY)
  } catch {
    // ignore
  }
}

function readPending(): Pending {
  try {
    const raw = localStorage.getItem(PENDING_KEY)
    if (!raw) return { add: [], remove: [] }
    const parsed = JSON.parse(raw) as Partial<Pending>
    return { add: cleanIds(parsed.add), remove: cleanIds(parsed.remove) }
  } catch {
    return { add: [], remove: [] }
  }
}

function writePending(pending: Pending): void {
  try {
    if (pending.add.length === 0 && pending.remove.length === 0) localStorage.removeItem(PENDING_KEY)
    else localStorage.setItem(PENDING_KEY, JSON.stringify(pending))
  } catch {
    // ignore
  }
}

function recordPending(gameId: string, kind: 'add' | 'remove'): void {
  const pending = readPending()
  const next: Pending = {
    add: pending.add.filter((id) => id !== gameId),
    remove: pending.remove.filter((id) => id !== gameId),
  }
  next[kind].push(gameId)
  writePending(next)
}

function clearPending(gameId: string, kind: 'add' | 'remove'): void {
  const pending = readPending()
  const next: Pending = {
    add: pending.add.filter((id) => !(kind === 'add' && id === gameId)),
    remove: pending.remove.filter((id) => !(kind === 'remove' && id === gameId)),
  }
  if (next.add.length !== pending.add.length || next.remove.length !== pending.remove.length) writePending(next)
}

function messageFrom(error: { code?: string; message?: string } | null): string | null {
  if (!error) return null
  // A project that has not run the favorites migration yet answers PGRST205;
  // treat that the same as offline rather than as a player-facing failure.
  if (error.code === 'PGRST205' || error.code === '42P01') return null
  return 'Could not reach your account just now, so this stays on the device.'
}

interface FavoritesValue {
  /** Most recently added first. */
  favorites: string[]
  ready: boolean
  isFavorite(gameId: string): boolean
  toggle(gameId: string): Promise<void>
  error: string | null
}

const FavoritesContext = createContext<FavoritesValue | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<string[]>(readLocalFavorites)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    const local = readLocalFavorites()

    if (!supabase || !user) {
      setFavorites(local)
      setError(null)
      setReady(true)
      return () => {
        alive = false
      }
    }

    setReady(false)
    void (async () => {
      const pending = readPending()
      const guestPicks = readGuestPicks()
      const { data, error: readError } = await supabase
        .from('game_favorites')
        .select('game_id,created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .returns<Array<{ game_id: string; created_at: string }>>()
      if (!alive) return

      if (readError) {
        setFavorites(local)
        setError(messageFrom(readError))
        setReady(true)
        return
      }

      const remote = (data ?? []).map((row) => row.game_id).filter((id) => GAME_ID.test(id))
      const add = [...new Set([...guestPicks, ...pending.add])].filter(
        (id) => !remote.includes(id) && !pending.remove.includes(id),
      )
      const remove = [...new Set(pending.remove)].filter((id) => remote.includes(id))

      if (remove.length > 0) {
        await supabase.from('game_favorites').delete().eq('user_id', user.id).in('game_id', remove)
      }
      if (add.length > 0) {
        await supabase
          .from('game_favorites')
          .upsert(
            add.map((gameId) => ({ user_id: user.id, game_id: gameId })),
            { onConflict: 'user_id,game_id', ignoreDuplicates: true },
          )
      }
      if (!alive) return

      const next = [...add, ...remote.filter((id) => !remove.includes(id) && !add.includes(id))]
      writeLocalFavorites(next)
      clearGuestPicks()
      writePending({ add: [], remove: [] })
      setFavorites(next)
      setError(null)
      setReady(true)
    })()

    return () => {
      alive = false
    }
  }, [user])

  const toggle = useCallback(
    async (gameId: string) => {
      const wasFavorite = favorites.includes(gameId)
      const next = wasFavorite ? favorites.filter((id) => id !== gameId) : [gameId, ...favorites]
      setFavorites(next)
      setError(null)
      writeLocalFavorites(next)

      if (!supabase || !user) {
        markGuestPicks()
        return
      }

      const { error: writeError } = wasFavorite
        ? await supabase.from('game_favorites').delete().eq('user_id', user.id).eq('game_id', gameId)
        : await supabase
            .from('game_favorites')
            .upsert({ user_id: user.id, game_id: gameId }, { onConflict: 'user_id,game_id', ignoreDuplicates: true })

      if (writeError) {
        recordPending(gameId, wasFavorite ? 'remove' : 'add')
        setError(messageFrom(writeError))
      } else {
        clearPending(gameId, wasFavorite ? 'remove' : 'add')
      }
    },
    [favorites, user],
  )

  const value = useMemo<FavoritesValue>(
    () => ({
      favorites,
      ready,
      isFavorite: (gameId: string) => favorites.includes(gameId),
      toggle,
      error,
    }),
    [error, favorites, ready, toggle],
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites(): FavoritesValue {
  const value = useContext(FavoritesContext)
  if (!value) throw new Error('useFavorites must be used inside <FavoritesProvider>')
  return value
}
