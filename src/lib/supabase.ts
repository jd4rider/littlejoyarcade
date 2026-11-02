import { createClient } from '@supabase/supabase-js'

// Public, browser-safe configuration only. The anon key is designed to be
// shipped; row level security is what protects the data.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: 'pkce',
        },
      })
    : null

export const isBackendConfigured = supabase !== null

/**
 * Which social providers are switched on for this Supabase project. The list
 * lives server-side, so the UI can show only buttons that will actually work.
 */
export async function getAuthProviders(): Promise<string[]> {
  if (!url || !anonKey) return []
  try {
    const response = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: anonKey } })
    if (!response.ok) return []
    const data = (await response.json()) as { external?: Record<string, boolean> }
    return Object.entries(data.external ?? {})
      .filter(([, enabled]) => enabled)
      .map(([provider]) => provider)
  } catch {
    return []
  }
}

export const backendHelp =
  'Cloud accounts need VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY at build time. See DEPLOYMENT.md.'
