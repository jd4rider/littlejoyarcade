import type { ProgressEnvelope, StorageLike } from './types'

/** localStorage when it works, an in-memory map otherwise (private mode, Node). */
export function createStorage(): StorageLike {
  try {
    if (typeof localStorage !== 'undefined') {
      const probe = '__lja_probe__'
      localStorage.setItem(probe, '1')
      localStorage.removeItem(probe)
      return localStorage
    }
  } catch {
    // fall through to memory storage
  }
  const map = new Map<string, string>()
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, value),
    removeItem: (key) => void map.delete(key),
  }
}

export function readJson<T>(storage: StorageLike, key: string): T | null {
  try {
    const raw = storage.getItem(key)
    return raw === null ? null : (JSON.parse(raw) as T)
  } catch {
    return null
  }
}

export function writeJson(storage: StorageLike, key: string, value: unknown): void {
  try {
    storage.setItem(key, JSON.stringify(value))
  } catch {
    // Quota or a locked-down browser: progress stays in memory for this session.
  }
}

export function isEnvelope<T>(value: unknown): value is ProgressEnvelope<T> {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.schema === 'number' &&
    typeof candidate.updatedAt === 'number' &&
    Number.isFinite(candidate.updatedAt) &&
    typeof candidate.deviceId === 'string' &&
    'data' in candidate
  )
}

/**
 * Newest envelope wins. Ties go to the cloud copy so a single device cannot
 * flip-flop forever, and a local save made after the cloud copy always wins.
 */
export function mergeEnvelopes<T>(
  local: ProgressEnvelope<T> | null,
  cloud: ProgressEnvelope<T> | null,
): { envelope: ProgressEnvelope<T> | null; source: 'local' | 'cloud' | 'none' } {
  if (local && !cloud) return { envelope: local, source: 'local' }
  if (cloud && !local) return { envelope: cloud, source: 'cloud' }
  if (!local || !cloud) return { envelope: null, source: 'none' }
  if (local.updatedAt > cloud.updatedAt) return { envelope: local, source: 'local' }
  return { envelope: cloud, source: 'cloud' }
}

/** Stable per-browser id; a random fallback keeps private mode working. */
export function resolveDeviceId(storage: StorageLike, randomId: () => string): string {
  try {
    const existing = storage.getItem('lja:device-id')
    if (existing) return existing
    const id = randomId()
    storage.setItem('lja:device-id', id)
    return id
  } catch {
    // Storage can be blocked entirely; a per-session id is still fine.
    return randomId()
  }
}

export function randomId(): string {
  const cryptoApi = globalThis.crypto
  if (cryptoApi?.randomUUID) return cryptoApi.randomUUID()
  return `dev_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
}
