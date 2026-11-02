import { createStorage, isEnvelope, mergeEnvelopes, randomId, readJson, resolveDeviceId, writeJson } from './local'
import type {
  AchievementDefinition,
  ArcadeEvent,
  ArcadeOptions,
  ArcadeUser,
  CloudAdapter,
  Json,
  PlatformInfo,
  Product,
  ProgressEnvelope,
  StorageLike,
  SyncStatus,
} from './types'

export interface Arcade {
  readonly gameId: string
  initialize(): Promise<ArcadeUser | null>
  auth: {
    getUser(): ArcadeUser | null
    refresh(): Promise<ArcadeUser | null>
    signOut(): Promise<void>
    onChange(listener: (user: ArcadeUser | null) => void): () => void
  }
  progress: {
    load<T = Json>(): T | null
    save<T = Json>(data: T): Promise<void>
    sync(): Promise<SyncStatus>
    status(): SyncStatus
    clear(): void
  }
  achievements: {
    unlock(slug: string): Promise<boolean>
    has(slug: string): boolean
    list(): string[]
    sync(): Promise<string[]>
  }
  entitlements: {
    has(slug: string): boolean
    list(): string[]
    refresh(): Promise<string[]>
    /** True when no ad-free entitlement covers this game. */
    adsAllowed(): boolean
  }
  store: {
    getProducts(): Promise<Product[]>
  }
  analytics: {
    track(name: string, props?: Record<string, string | number | boolean>): void
    events(): ArcadeEvent[]
    flush(): Promise<void>
  }
  platform: PlatformInfo
  /** For adapters that need the raw envelope (Phaser/Electron bridges). */
  envelope(): ProgressEnvelope | null
}

const key = (gameId: string, part: string) => `lja:${gameId}:${part}`

function detectPlatform(online: () => boolean): PlatformInfo {
  const nav = typeof navigator === 'undefined' ? null : navigator
  const ua = nav?.userAgent ?? ''
  const runtime: PlatformInfo['runtime'] = /Electron/i.test(ua)
    ? 'electron'
    : 'Capacitor' in (globalThis as Record<string, unknown>)
      ? 'capacitor'
      : typeof window === 'undefined'
        ? 'unknown'
        : 'browser'
  return {
    runtime,
    online: online(),
    touch: typeof window !== 'undefined' && 'ontouchstart' in window,
  }
}

/**
 * Creates an arcade client for one game. Nothing here throws when offline:
 * local progress always works, and cloud calls degrade to a queued save.
 */
export function createArcade(options: ArcadeOptions): Arcade {
  const gameId = options.gameId
  const schema = options.schemaVersion ?? 1
  const storage: StorageLike = options.storage ?? createStorage()
  const now = options.now ?? (() => Date.now())
  const cloud: CloudAdapter | null = options.cloud ?? null
  const analyticsLimit = options.analyticsLimit ?? 100
  const isOnline = options.online ?? (() => (typeof navigator === 'undefined' ? true : navigator.onLine !== false))
  const deviceId = resolveDeviceId(storage, options.randomId ?? randomId)

  let user: ArcadeUser | null = null
  let status: SyncStatus = 'local'
  let products: Product[] = []
  const listeners = new Set<(user: ArcadeUser | null) => void>()

  let achievements = new Set<string>(readJson<string[]>(storage, key(gameId, 'achievements')) ?? [])
  let entitlements = new Set<string>(readJson<string[]>(storage, 'lja:entitlements') ?? [])
  let events: ArcadeEvent[] = readJson<ArcadeEvent[]>(storage, 'lja:analytics') ?? []

  const emitUser = (next: ArcadeUser | null) => {
    user = next
    for (const listener of listeners) listener(next)
  }

  const readLocal = (): ProgressEnvelope | null => {
    const value = readJson<unknown>(storage, key(gameId, 'progress'))
    return isEnvelope<Json>(value) ? value : null
  }

  const writeLocal = (envelope: ProgressEnvelope) => {
    writeJson(storage, key(gameId, 'progress'), envelope)
  }

  const queuePending = (envelope: ProgressEnvelope) => {
    writeJson(storage, key(gameId, 'pending'), envelope)
  }

  const pending = (): ProgressEnvelope | null => {
    const value = readJson<unknown>(storage, key(gameId, 'pending'))
    return isEnvelope<Json>(value) ? value : null
  }

  const clearPending = () => storage.removeItem?.(key(gameId, 'pending'))

  const requireUser = (): { user: ArcadeUser; cloud: CloudAdapter } | null => {
    if (!cloud || !user) return null
    return { user, cloud }
  }

  const saveAchievements = () => writeJson(storage, key(gameId, 'achievements'), [...achievements])
  const saveEntitlements = () => writeJson(storage, 'lja:entitlements', [...entitlements])

  const fullAchievementId = (slug: string) => (slug.includes('.') ? slug : `${gameId}.${slug}`)

  const pushAnalytics = () => {
    writeJson(storage, 'lja:analytics', events)
  }

  const client: Arcade = {
    gameId,

    async initialize() {
      if (!cloud) return null
      try {
        const signedIn = cloud.getUser ? await cloud.getUser() : null
        emitUser(signedIn)
        if (cloud.onAuthChange) {
          cloud.onAuthChange((next) => {
            emitUser(next)
          })
        }
        if (signedIn) await client.progress.sync()
        return signedIn
      } catch {
        status = 'offline'
        return null
      }
    },

    auth: {
      getUser: () => user,
      async refresh() {
        if (!cloud?.getUser) return user
        try {
          emitUser(await cloud.getUser())
        } catch {
          status = 'offline'
        }
        return user
      },
      async signOut() {
        if (cloud?.signOut) {
          try {
            await cloud.signOut()
          } catch {
            // signing out locally still matters
          }
        }
        emitUser(null)
        status = 'local'
      },
      onChange(listener) {
        listeners.add(listener)
        return () => listeners.delete(listener)
      },
    },

    progress: {
      load<T = Json>() {
        const envelope = readLocal()
        return envelope ? (envelope.data as T) : null
      },

      async save<T = Json>(data: T) {
        const envelope: ProgressEnvelope = {
          schema,
          data: data as Json,
          updatedAt: now(),
          deviceId,
        }
        writeLocal(envelope)

        const session = requireUser()
        if (!session) {
          status = 'local'
          return
        }
        if (!isOnline()) {
          queuePending(envelope)
          status = 'offline'
          return
        }
        status = 'syncing'
        try {
          await session.cloud.saveProgress(gameId, session.user.id, envelope)
          clearPending()
          status = 'synced'
        } catch {
          queuePending(envelope)
          status = 'error'
        }
      },

      async sync() {
        const session = requireUser()
        if (!session) {
          status = 'local'
          return status
        }
        status = 'syncing'
        try {
          const local = readLocal()
          const remote = await session.cloud.loadProgress(gameId, session.user.id)
          const { envelope, source } = mergeEnvelopes(local, remote)

          if (envelope && source === 'cloud') {
            writeLocal(envelope)
            clearPending()
          } else if (envelope && source === 'local') {
            // Guest or offline progress becomes the cloud save. This only ever
            // happens when the cloud copy is missing or older.
            await session.cloud.saveProgress(gameId, session.user.id, envelope)
            clearPending()
          }

          const queued = pending()
          if (queued && (!envelope || queued.updatedAt > envelope.updatedAt)) {
            await session.cloud.saveProgress(gameId, session.user.id, queued)
            writeLocal(queued)
            clearPending()
          }

          const remoteAchievements = await session.cloud.loadAchievements(session.user.id, gameId)
          const merged = new Set([...achievements, ...remoteAchievements])
          const localOnly = [...merged].filter((id) => !remoteAchievements.includes(id))
          achievements = merged
          saveAchievements()
          for (const id of localOnly) {
            await session.cloud.unlockAchievement(session.user.id, id)
          }

          await client.entitlements.refresh()
          status = 'synced'
        } catch {
          status = 'offline'
        }
        return status
      },

      status: () => status,

      clear() {
        storage.removeItem?.(key(gameId, 'progress'))
        clearPending()
      },
    },

    achievements: {
      async unlock(slug) {
        const id = fullAchievementId(slug)
        const isNew = !achievements.has(id)
        if (!isNew) return false
        achievements.add(id)
        saveAchievements()
        const session = requireUser()
        if (session) {
          try {
            await session.cloud.unlockAchievement(session.user.id, id)
          } catch {
            // Kept locally and re-sent by progress.sync().
          }
        }
        return isNew
      },

      has(slug) {
        return achievements.has(fullAchievementId(slug))
      },

      list: () => [...achievements],

      async sync() {
        const session = requireUser()
        if (!session) return [...achievements]
        try {
          const remote = await session.cloud.loadAchievements(session.user.id, gameId)
          achievements = new Set([...achievements, ...remote])
          saveAchievements()
        } catch {
          // offline: local list is still valid
        }
        return [...achievements]
      },
    },

    entitlements: {
      has(slug) {
        return entitlements.has(slug)
      },

      list: () => [...entitlements],

      async refresh() {
        const session = requireUser()
        if (!session) return [...entitlements]
        try {
          entitlements = new Set(await session.cloud.loadEntitlements(session.user.id))
          saveEntitlements()
        } catch {
          // cached entitlements stay in effect
        }
        return [...entitlements]
      },

      adsAllowed() {
        return !entitlements.has('arcade.ad_free') && !entitlements.has(`${gameId}.ad_free`)
      },
    },

    store: {
      async getProducts() {
        if (!cloud) return []
        if (products.length > 0) return products
        try {
          products = await cloud.listProducts()
        } catch {
          products = []
        }
        return products
      },
    },

    analytics: {
      track(name, props = {}) {
        events.push({ name, props, at: now() })
        if (events.length > analyticsLimit) events = events.slice(-analyticsLimit)
        pushAnalytics()
      },

      events: () => [...events],

      async flush() {
        if (!options.analytics || events.length === 0) return
        const batch = [...events]
        try {
          await options.analytics(batch)
          events = events.filter((event) => !batch.includes(event))
          pushAnalytics()
        } catch {
          // keep them queued for the next flush
        }
      },
    },

    platform: detectPlatform(isOnline),

    envelope: () => readLocal(),
  }

  return client
}

export type { AchievementDefinition }
