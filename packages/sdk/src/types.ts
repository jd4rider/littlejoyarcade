// Shared types for the Little Joy Arcade SDK. Everything here is plain data so
// the same SDK can run inside Phaser, React, vanilla pages and Electron.

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json }

/** The slice of the Web Storage API the SDK needs. */
export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem?(key: string): void
}

export interface ArcadeUser {
  id: string
  email: string | null
  displayName: string | null
}

/** A save is always wrapped so format changes and conflicts stay detectable. */
export interface ProgressEnvelope<T = Json> {
  schema: number
  data: T
  /** Epoch milliseconds of the newest write. */
  updatedAt: number
  /** Which install wrote it — used to explain conflicts, never to block them. */
  deviceId: string
}

export type SyncStatus = 'local' | 'syncing' | 'synced' | 'offline' | 'error'

export interface Product {
  id: string
  slug: string
  name: string
  description: string | null
  priceCents: number
  currency: string
  entitlement: string
  kind: 'one_time' | 'bundle'
}

export interface AchievementDefinition {
  id: string
  gameId: string
  name: string
  description: string
}

export interface ArcadeEvent {
  name: string
  props: Record<string, string | number | boolean>
  at: number
}

export interface PlatformInfo {
  runtime: 'browser' | 'electron' | 'capacitor' | 'unknown'
  online: boolean
  touch: boolean
}

/** A backend adapter. Implement this to swap Supabase for anything else. */
export interface CloudAdapter {
  getUser?(): Promise<ArcadeUser | null>
  signOut?(): Promise<void>
  onAuthChange?(listener: (user: ArcadeUser | null) => void): () => void
  loadProgress(gameId: string, userId: string): Promise<ProgressEnvelope | null>
  saveProgress(gameId: string, userId: string, envelope: ProgressEnvelope): Promise<void>
  loadAchievements(userId: string, gameId: string): Promise<string[]>
  unlockAchievement(userId: string, achievementId: string): Promise<void>
  loadEntitlements(userId: string): Promise<string[]>
  listProducts(): Promise<Product[]>
}

export interface ArcadeOptions {
  gameId: string
  /** Bump when the shape of the game's save changes. */
  schemaVersion?: number
  storage?: StorageLike
  cloud?: CloudAdapter | null
  now?: () => number
  randomId?: () => string
  /** Optional transport for analytics. Without one events stay local. */
  analytics?: (events: ArcadeEvent[]) => void | Promise<void>
  online?: () => boolean
  /** Cap on local analytics events; oldest are dropped first. */
  analyticsLimit?: number
}
