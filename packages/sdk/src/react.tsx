import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Arcade } from './client'
import type { ArcadeUser, Json, SyncStatus } from './types'

const ArcadeContext = createContext<Arcade | null>(null)

export function ArcadeProvider({ arcade, children }: { arcade: Arcade; children: ReactNode }) {
  const [user, setUser] = useState<ArcadeUser | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let alive = true
    const off = arcade.auth.onChange((next) => {
      if (alive) setUser(next)
    })
    arcade
      .initialize()
      .then((next) => {
        if (alive) setUser(next)
      })
      .finally(() => {
        if (alive) setReady(true)
      })
    return () => {
      alive = false
      off()
    }
  }, [arcade])

  return createElement(ArcadeContext.Provider, { value: arcade }, createElement(UserContext.Provider, { value: { user, ready } }, children))
}

const UserContext = createContext<{ user: ArcadeUser | null; ready: boolean }>({ user: null, ready: false })

export function useArcade(): Arcade {
  const arcade = useContext(ArcadeContext)
  if (!arcade) throw new Error('useArcade must be used inside <ArcadeProvider>')
  return arcade
}

export function useArcadeUser() {
  return useContext(UserContext)
}

/** Loads a game's save once and exposes a debounced saver. */
export function useArcadeProgress<T extends Json>(initial: T, delay = 250) {
  const arcade = useArcade()
  const [data, setData] = useState<T>(() => arcade.progress.load<T>() ?? initial)
  const [status, setStatus] = useState<SyncStatus>(arcade.progress.status())
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  const persist = useCallback(
    (next: T) => {
      setData(next)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        void arcade.progress.save(next).then(() => setStatus(arcade.progress.status()))
      }, delay)
    },
    [arcade, delay],
  )

  const saveNow = useCallback(
    async (next: T) => {
      if (timer.current) clearTimeout(timer.current)
      setData(next)
      await arcade.progress.save(next)
      setStatus(arcade.progress.status())
    },
    [arcade],
  )

  return useMemo(() => ({ data, save: persist, saveNow, status }), [data, persist, saveNow, status])
}

export function useEntitlement(slug: string): boolean {
  const arcade = useArcade()
  const [granted, setGranted] = useState(() => arcade.entitlements.has(slug))
  useEffect(() => {
    let alive = true
    void arcade.entitlements.refresh().then(() => {
      if (alive) setGranted(arcade.entitlements.has(slug))
    })
    return () => {
      alive = false
    }
  }, [arcade, slug])
  return granted
}
