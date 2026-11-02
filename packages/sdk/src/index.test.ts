import { describe, expect, it } from 'vitest'
import { createArcade } from './client'
import { createStorage, mergeEnvelopes } from './local'
import type { CloudAdapter, ProgressEnvelope, StorageLike } from './types'

function memory(): StorageLike & { map: Map<string, string> } {
  const map = new Map<string, string>()
  return {
    map,
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, value),
    removeItem: (key) => void map.delete(key),
  }
}

interface FakeCloud extends CloudAdapter {
  saves: ProgressEnvelope[]
  unlocked: string[]
  failOffline: boolean
  remote: ProgressEnvelope | null
}

function fakeCloud(seed?: ProgressEnvelope, entitlements: string[] = []): FakeCloud {
  const cloud: FakeCloud = {
    saves: [],
    unlocked: [],
    failOffline: false,
    remote: seed ?? null,
    async getUser() {
      if (cloud.failOffline) return null
      return { id: 'u1', email: 'player@example.com', displayName: null }
    },
    async loadProgress() {
      if (cloud.failOffline) throw new Error('offline')
      return cloud.remote
    },
    async saveProgress(_gameId, _userId, envelope) {
      if (cloud.failOffline) throw new Error('offline')
      cloud.saves.push(envelope)
      cloud.remote = envelope
    },
    async loadAchievements() {
      return []
    },
    async unlockAchievement(_userId, id) {
      cloud.unlocked.push(id)
    },
    async loadEntitlements() {
      return entitlements
    },
    async listProducts() {
      return [
        {
          id: 'p1',
          slug: 'ad-free',
          name: 'Ad-free',
          description: null,
          priceCents: 199,
          currency: 'USD',
          entitlement: 'arcade.ad_free',
          kind: 'one_time',
        },
      ]
    },
  }
  return cloud
}

describe('mergeEnvelopes', () => {
  const base = { schema: 1, data: {}, deviceId: 'a' }

  it('takes the newest local save', () => {
    const local = { ...base, updatedAt: 200, deviceId: 'local' }
    const cloud = { ...base, updatedAt: 100, deviceId: 'cloud' }
    expect(mergeEnvelopes(local, cloud).source).toBe('local')
  })

  it('takes the newest cloud save', () => {
    const local = { ...base, updatedAt: 100 }
    const cloud = { ...base, updatedAt: 200 }
    expect(mergeEnvelopes(local, cloud).source).toBe('cloud')
  })

  it('breaks ties in favour of the cloud', () => {
    const local = { ...base, updatedAt: 100 }
    const cloud = { ...base, updatedAt: 100 }
    expect(mergeEnvelopes(local, cloud).source).toBe('cloud')
  })

  it('handles a missing side', () => {
    expect(mergeEnvelopes(null, null).envelope).toBeNull()
    expect(mergeEnvelopes({ ...base, updatedAt: 1 }, null).source).toBe('local')
    expect(mergeEnvelopes(null, { ...base, updatedAt: 1 }).source).toBe('cloud')
  })
})

describe('arcade progress', () => {
  it('round-trips a save without a backend', async () => {
    const storage = memory()
    const arcade = createArcade({ gameId: 'demo', storage, now: () => 10 })
    expect(arcade.progress.load()).toBeNull()
    await arcade.progress.save({ stars: 4 })
    expect(arcade.progress.load()).toEqual({ stars: 4 })
    expect(arcade.progress.status()).toBe('local')
    expect(arcade.envelope()?.updatedAt).toBe(10)
  })

  it('uploads guest progress on the first signed-in sync', async () => {
    const storage = memory()
    const cloud = fakeCloud()

    // Guest plays before signing in.
    const guest = createArcade({ gameId: 'demo', storage, now: () => 50 })
    await guest.progress.save({ level: 3 })

    const signedIn = createArcade({ gameId: 'demo', storage, cloud, now: () => 60, randomId: () => 'device-1' })
    const user = await signedIn.initialize()
    expect(user?.id).toBe('u1')
    expect(cloud.saves.at(-1)?.data).toEqual({ level: 3 })
    expect(signedIn.progress.status()).toBe('synced')
  })

  it('never overwrites a newer cloud save', async () => {
    const storage = memory()
    const cloud = fakeCloud({ schema: 1, data: { level: 12 }, updatedAt: 500, deviceId: 'other-device' })
    const arcade = createArcade({ gameId: 'demo', storage, cloud, now: () => 400, randomId: () => 'device-1' })
    await arcade.initialize()
    expect(arcade.progress.load()).toEqual({ level: 12 })
    expect(cloud.saves).toHaveLength(0)
  })

  it('queues a save while offline and flushes it on sync', async () => {
    const storage = memory()
    const cloud = fakeCloud()
    let online = true
    const arcade = createArcade({
      gameId: 'demo',
      storage,
      cloud,
      now: () => 110,
      online: () => online,
      randomId: () => 'device-1',
    })
    await arcade.initialize()

    online = false
    await arcade.progress.save({ level: 7 })
    expect(arcade.progress.status()).toBe('offline')
    expect(arcade.progress.load()).toEqual({ level: 7 })

    online = true
    await arcade.progress.sync()
    expect(arcade.progress.status()).toBe('synced')
    expect(cloud.saves.at(-1)?.data).toEqual({ level: 7 })
    expect(storage.getItem('lja:demo:pending')).toBeNull()
  })

  it('stays usable when the cloud throws', async () => {
    const cloud = fakeCloud()
    cloud.failOffline = true
    const arcade = createArcade({ gameId: 'demo', storage: memory(), cloud, now: () => 1 })
    expect(await arcade.initialize()).toBeNull()
    await arcade.progress.save({ safe: true })
    expect(arcade.progress.load()).toEqual({ safe: true })
  })

  it('keeps achievements locally and forwards them to the cloud', async () => {
    const storage = memory()
    const cloud = fakeCloud()
    const arcade = createArcade({ gameId: 'demo', storage, cloud, now: () => 1, randomId: () => 'device-1' })
    await arcade.initialize()

    expect(await arcade.achievements.unlock('first_win')).toBe(true)
    expect(await arcade.achievements.unlock('first_win')).toBe(false)
    expect(arcade.achievements.has('first_win')).toBe(true)
    expect(cloud.unlocked).toEqual(['demo.first_win'])
  })

  it('reads entitlements and answers the ad policy', async () => {
    const cloud = fakeCloud(undefined, ['arcade.ad_free'])
    const arcade = createArcade({ gameId: 'demo', storage: memory(), cloud, randomId: () => 'device-1' })
    await arcade.initialize()
    expect(arcade.entitlements.adsAllowed()).toBe(false)
    expect(arcade.entitlements.has('arcade.ad_free')).toBe(true)
  })

  it('caps the local analytics queue', () => {
    const arcade = createArcade({ gameId: 'demo', storage: memory(), analyticsLimit: 2, now: () => 1 })
    arcade.analytics.track('a')
    arcade.analytics.track('b')
    arcade.analytics.track('c')
    expect(arcade.analytics.events().map((event) => event.name)).toEqual(['b', 'c'])
  })

  it('survives a storage that throws', async () => {
    const hostile: StorageLike = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
    }
    const arcade = createArcade({ gameId: 'demo', storage: hostile, now: () => 1 })
    await arcade.progress.save({ ok: true })
    expect(arcade.progress.status()).toBe('local')
  })

  it('falls back to in-memory storage when localStorage is absent', () => {
    const storage = createStorage()
    storage.setItem('k', 'v')
    expect(storage.getItem('k')).toBe('v')
  })
})
