import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { getAuthProviders, isBackendConfigured, supabase } from './supabase'

const GUEST_KEY = 'lja:guest-name'

export interface Profile {
  displayName: string | null
  role: 'player' | 'admin'
}

interface AuthValue {
  user: User | null
  profile: Profile | null
  loading: boolean
  configured: boolean
  guestName: string
  setGuestName(name: string): void
  displayName: string
  sendMagicLink(email: string): Promise<{ error: string | null }>
  providers: string[]
  signInWithOAuth(provider: string): Promise<{ error: string | null }>
  signInWithPassword(email: string, password: string): Promise<{ error: string | null }>
  signUpWithPassword(
    email: string,
    password: string,
    displayName?: string,
  ): Promise<{ error: string | null; needsConfirmation: boolean }>
  signOut(): Promise<void>
  saveDisplayName(name: string): Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthValue | null>(null)

function readGuestName(): string {
  try {
    return localStorage.getItem(GUEST_KEY) ?? ''
  } catch {
    return ''
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(isBackendConfigured)
  const [guestName, setGuestNameState] = useState(readGuestName)
  const [providers, setProviders] = useState<string[]>([])

  useEffect(() => {
    let alive = true
    void getAuthProviders().then((list) => {
      if (alive) setProviders(list.filter((provider) => provider !== 'email'))
    })
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    let alive = true

    void supabase.auth.getSession().then(({ data }) => {
      if (!alive) return
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      alive = false
      data.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!supabase || !user) {
      setProfile(null)
      return
    }
    let alive = true
    void supabase
      .from('profiles')
      .select('display_name,role')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!alive) return
        if (data) {
          setProfile({
            displayName: (data.display_name as string | null) ?? null,
            role: data.role === 'admin' ? 'admin' : 'player',
          })
        } else {
          // The signup trigger normally creates this row; fall back gracefully.
          setProfile({ displayName: (user.user_metadata?.display_name as string) ?? null, role: 'player' })
        }
      })
    return () => {
      alive = false
    }
  }, [user])

  const setGuestName = useCallback((name: string) => {
    const clean = name.trim().slice(0, 32)
    setGuestNameState(clean)
    try {
      if (clean) localStorage.setItem(GUEST_KEY, clean)
      else localStorage.removeItem(GUEST_KEY)
    } catch {
      // ignore
    }
  }, [])

  const sendMagicLink = useCallback(async (email: string) => {
    if (!supabase) return { error: 'Cloud accounts are not configured for this build yet.' }
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}${window.location.pathname}`,
        shouldCreateUser: true,
      },
    })
    return { error: error?.message ?? null }
  }, [])

  const signInWithOAuth = useCallback(async (provider: string) => {
    if (!supabase) return { error: 'Cloud accounts are not configured for this build yet.' }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider as Parameters<typeof supabase.auth.signInWithOAuth>[0]['provider'],
      options: {
        // Return to whatever origin the player started on; every game subdomain
        // and the portal are listed in the Supabase redirect allow-list.
        redirectTo: `${window.location.origin}${window.location.pathname}`,
      },
    })
    return { error: error?.message ?? null }
  }, [])

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'Cloud accounts are not configured for this build yet.' }
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    return { error: error?.message ?? null }
  }, [])

  const signUpWithPassword = useCallback(
    async (email: string, password: string, displayName?: string) => {
      if (!supabase) return { error: 'Cloud accounts are not configured for this build yet.', needsConfirmation: false }
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          // Kept for the profile trigger and future confirmation emails.
          data: displayName ? { display_name: displayName.trim().slice(0, 32) } : undefined,
          emailRedirectTo: `${window.location.origin}${window.location.pathname}`,
        },
      })
      if (error) return { error: error.message, needsConfirmation: false }
      return { error: null, needsConfirmation: !data.session }
    },
    [],
  )

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut()
  }, [])

  const saveDisplayName = useCallback(
    async (name: string) => {
      const clean = name.trim().slice(0, 32)
      if (!supabase || !user) {
        setGuestName(clean)
        return { error: null }
      }
      const { error } = await supabase.from('profiles').upsert({ id: user.id, display_name: clean })
      if (!error) setProfile((current) => ({ displayName: clean, role: current?.role ?? 'player' }))
      return { error: error?.message ?? null }
    },
    [setGuestName, user],
  )

  const value = useMemo<AuthValue>(
    () => ({
      user,
      profile,
      loading,
      configured: isBackendConfigured,
      guestName,
      setGuestName,
      displayName: profile?.displayName || guestName || user?.email?.split('@')[0] || 'Guest',
      sendMagicLink,
      providers,
      signInWithOAuth,
      signInWithPassword,
      signUpWithPassword,
      signOut,
      saveDisplayName,
    }),
    [
      guestName,
      loading,
      profile,
      saveDisplayName,
      sendMagicLink,
      providers,
      signInWithOAuth,
      signInWithPassword,
      signUpWithPassword,
      setGuestName,
      signOut,
      user,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>')
  return value
}
