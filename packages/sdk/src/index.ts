import { createArcade } from './client'
import type { Arcade } from './client'
import type { ArcadeOptions, Json, ProgressEnvelope } from './types'

export { createArcade }
export type { Arcade }
export { createStorage, isEnvelope, mergeEnvelopes } from './local'
export { createSupabaseCloud } from './supabase'
export type { CloudAdapter, Product, ProgressEnvelope, ArcadeUser, ArcadeEvent, SyncStatus, Json } from './types'

/** Small helper for games that only need "load my save, save my save". */
export function createProgressStore<T extends Json>(arcade: Arcade) {
  return {
    load: () => arcade.progress.load<T>(),
    save: (data: T) => arcade.progress.save<T>(data),
    clear: () => arcade.progress.clear(),
    envelope: (): ProgressEnvelope | null => arcade.envelope(),
  }
}

export type { ArcadeOptions }
