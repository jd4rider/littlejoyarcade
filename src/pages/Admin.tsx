import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { isBackendConfigured, supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'

interface AdminGame {
  id: string
  name: string
  status: string
  featured: boolean
  version: string
}

interface AdminProduct {
  id: string
  name: string
  entitlement: string
  active: boolean
  price_cents: number
}

export default function Admin() {
  const { user, profile, loading } = useAuth()
  const [games, setGames] = useState<AdminGame[]>([])
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [counts, setCounts] = useState<{ players: number; entitlements: number; sessions: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    if (!supabase) return
    setError(null)
    const [gamesResult, productsResult, players, entitlements, sessions] = await Promise.all([
      supabase.from('games').select('id,name,status,featured,version').order('sort_order'),
      supabase.from('products').select('id,name,entitlement,active,price_cents').order('created_at'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('entitlements').select('id', { count: 'exact', head: true }).is('revoked_at', null),
      supabase.from('game_sessions').select('id', { count: 'exact', head: true }),
    ])
    if (gamesResult.error) setError(gamesResult.error.message)
    setGames((gamesResult.data ?? []) as AdminGame[])
    setProducts((productsResult.data ?? []) as AdminProduct[])
    setCounts({
      players: players.count ?? 0,
      entitlements: entitlements.count ?? 0,
      sessions: sessions.count ?? 0,
    })
  }, [])

  useEffect(() => {
    if (profile?.role === 'admin') void load()
  }, [load, profile])

  const updateGame = async (id: string, patch: Partial<AdminGame>) => {
    if (!supabase) return
    setBusy(true)
    const { error: updateError } = await supabase.from('games').update(patch).eq('id', id)
    if (updateError) setError(updateError.message)
    else setGames((current) => current.map((game) => (game.id === id ? { ...game, ...patch } : game)))
    setBusy(false)
  }

  if (!isBackendConfigured) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-extrabold text-cream">Admin</h1>
        <div className="card mt-4 p-6 text-sm leading-relaxed text-white/60">
          <p className="font-semibold text-cream">The backend is not connected to this build.</p>
          <p className="mt-2">
            The admin area reads and writes real tables, so it stays locked until Supabase credentials are present.
            Set <code className="rounded bg-white/10 px-1">VITE_SUPABASE_URL</code> and{' '}
            <code className="rounded bg-white/10 px-1">VITE_SUPABASE_ANON_KEY</code>, apply the migrations in{' '}
            <code className="rounded bg-white/10 px-1">supabase/migrations</code>, then reload.
          </p>
          <Link to="/dashboard" className="btn btn-ghost mt-4">
            Back to my arcade
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-16 text-white/50">Checking your access…</div>
  }

  if (!user || profile?.role !== 'admin') {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-extrabold text-cream">Admin</h1>
        <div className="card mt-4 p-6 text-sm leading-relaxed text-white/60">
          <p className="font-semibold text-cream">This area is for the owner.</p>
          <p className="mt-2">
            {user
              ? 'Your account does not have the admin role. Access is enforced by row level security, not just by this page.'
              : 'Sign in with the owner account to continue.'}
          </p>
          <Link to={user ? '/dashboard' : '/login'} className="btn btn-primary mt-4">
            {user ? 'Back to my arcade' : 'Sign in'}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-6">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-joy-amber/85">Owner tools</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-cream sm:text-4xl">Arcade admin</h1>
        <p className="mt-1 text-sm text-white/55">Every action here is checked again by Postgres row level security.</p>
      </header>

      {error ? (
        <p className="card mb-5 border-joy-coral/40 bg-joy-coral/10 px-4 py-3 text-sm text-joy-coral" role="alert">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Players', value: counts?.players },
          { label: 'Active entitlements', value: counts?.entitlements },
          { label: 'Game sessions', value: counts?.sessions },
        ].map((stat) => (
          <div key={stat.label} className="card p-4">
            <p className="text-[0.68rem] uppercase tracking-wide text-white/45">{stat.label}</p>
            <p className="mt-1 text-2xl font-extrabold text-cream">{stat.value ?? '—'}</p>
          </div>
        ))}
      </div>

      <section className="card mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-bold text-cream">Games</h2>
          <button type="button" onClick={() => void load()} disabled={busy} className="btn btn-ghost px-3 py-1.5 text-xs">
            Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/40">
              <tr>
                <th className="px-5 py-2 font-medium">Game</th>
                <th className="px-5 py-2 font-medium">Version</th>
                <th className="px-5 py-2 font-medium">Status</th>
                <th className="px-5 py-2 font-medium">Featured</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {games.map((game) => (
                <tr key={game.id}>
                  <td className="px-5 py-3 font-medium text-cream">{game.name}</td>
                  <td className="px-5 py-3 text-white/50">v{game.version}</td>
                  <td className="px-5 py-3">
                    <select
                      value={game.status}
                      onChange={(event) => void updateGame(game.id, { status: event.target.value })}
                      className="rounded-lg border border-white/15 bg-ink-900 px-2 py-1 text-xs text-cream"
                      aria-label={`Status for ${game.name}`}
                    >
                      <option value="live">live</option>
                      <option value="coming-soon">coming-soon</option>
                      <option value="hidden">hidden</option>
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="checkbox"
                      checked={game.featured}
                      onChange={(event) => void updateGame(game.id, { featured: event.target.checked })}
                      aria-label={`Feature ${game.name}`}
                      className="h-4 w-4 accent-joy-amber"
                    />
                  </td>
                </tr>
              ))}
              {games.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-center text-white/45">
                    No rows yet — apply the seed migration in <code>supabase/migrations</code>.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card mt-6 overflow-hidden">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-bold text-cream">Product catalogue</h2>
          <p className="text-xs text-white/45">
            Checkout stays disabled until payment verification is configured. Nothing here charges anyone.
          </p>
        </div>
        <ul className="divide-y divide-white/10 text-sm">
          {products.map((product) => (
            <li key={product.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
              <div>
                <p className="font-medium text-cream">{product.name}</p>
                <p className="text-xs text-white/40">
                  {product.entitlement} · {(product.price_cents / 100).toFixed(2)} USD
                </p>
              </div>
              <span className={`pill ${product.active ? 'border-joy-mint/40 text-joy-mint' : 'opacity-50'}`}>
                {product.active ? 'active' : 'inactive'}
              </span>
            </li>
          ))}
          {products.length === 0 ? <li className="px-5 py-6 text-center text-white/45">No products defined.</li> : null}
        </ul>
      </section>
    </div>
  )
}
