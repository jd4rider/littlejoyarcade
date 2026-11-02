import type { SupabaseClient } from '@supabase/supabase-js'
import type { ArcadeUser, CloudAdapter, Product, ProgressEnvelope } from './types'

interface ProfileRow {
  display_name: string | null
}

function mapUser(user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }): ArcadeUser {
  return {
    id: user.id,
    email: user.email ?? null,
    displayName:
      typeof user.user_metadata?.display_name === 'string' ? (user.user_metadata.display_name as string) : null,
  }
}

/**
 * Supabase adapter. Every table it touches is protected by row level security:
 * a client can only ever read and write rows it owns, and entitlements are
 * read-only here because only the service role may grant them.
 */
export function createSupabaseCloud(client: SupabaseClient): CloudAdapter {
  return {
    async getUser() {
      const { data, error } = await client.auth.getUser()
      if (error || !data.user) return null
      return mapUser(data.user)
    },

    async signOut() {
      await client.auth.signOut()
    },

    onAuthChange(listener) {
      const { data } = client.auth.onAuthStateChange((_event, session) => {
        listener(session?.user ? mapUser(session.user) : null)
      })
      return () => data.subscription.unsubscribe()
    },

    async loadProgress(gameId, userId) {
      const { data, error } = await client
        .from('game_progress')
        .select('schema_version,data,updated_at,device_id')
        .eq('game_id', gameId)
        .eq('user_id', userId)
        .maybeSingle()
      if (error) throw error
      if (!data) return null
      return {
        schema: data.schema_version as number,
        data: data.data as ProgressEnvelope['data'],
        updatedAt: Date.parse(data.updated_at as string),
        deviceId: (data.device_id as string) ?? 'cloud',
      }
    },

    async saveProgress(gameId, userId, envelope) {
      const { error } = await client.from('game_progress').upsert(
        {
          user_id: userId,
          game_id: gameId,
          schema_version: envelope.schema,
          data: envelope.data,
          device_id: envelope.deviceId,
          updated_at: new Date(envelope.updatedAt).toISOString(),
        },
        { onConflict: 'user_id,game_id' },
      )
      if (error) throw error
    },

    async loadAchievements(userId, gameId) {
      const { data, error } = await client
        .from('player_achievements')
        .select('achievement_id, achievements!inner(game_id)')
        .eq('user_id', userId)
        .eq('achievements.game_id', gameId)
      if (error) throw error
      return (data ?? []).map((row) => row.achievement_id as string)
    },

    async unlockAchievement(userId, achievementId) {
      const { error } = await client
        .from('player_achievements')
        .upsert({ user_id: userId, achievement_id: achievementId }, { onConflict: 'user_id,achievement_id' })
      if (error && error.code !== '23505') throw error
    },

    async loadEntitlements(userId) {
      const { data, error } = await client
        .from('entitlements')
        .select('entitlement_slug')
        .eq('user_id', userId)
        .is('revoked_at', null)
      if (error) throw error
      return (data ?? []).map((row) => row.entitlement_slug as string)
    },

    async listProducts() {
      const { data, error } = await client
        .from('products')
        .select('id,slug,name,description,price_cents,currency,entitlement,kind')
        .eq('active', true)
        .order('price_cents')
      if (error) throw error
      return (data ?? []).map(
        (row): Product => ({
          id: row.id as string,
          slug: row.slug as string,
          name: row.name as string,
          description: (row.description as string) ?? null,
          priceCents: row.price_cents as number,
          currency: row.currency as string,
          entitlement: row.entitlement as string,
          kind: row.kind as Product['kind'],
        }),
      )
    },
  }
}

/** Optional helper: read the signed-in user's profile row. */
export async function loadProfile(client: SupabaseClient, userId: string): Promise<ProfileRow | null> {
  const { data, error } = await client.from('profiles').select('display_name').eq('id', userId).maybeSingle()
  if (error) return null
  return data as ProfileRow | null
}
