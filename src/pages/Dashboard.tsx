import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ARCADE_ACHIEVEMENTS } from '../data/achievements'
import { GAMES, gamesById } from '../data/games'
import { arcade, clearActivity, readActivity } from '../lib/arcade'
import { useAuth } from '../lib/auth'
import { Cover } from '../components/ui'

function relative(ts: number): string {
  const diff = Date.now() - ts
  const minutes = Math.round(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.round(hours / 24)
  return days === 1 ? 'yesterday' : `${days} days ago`
}

export default function Dashboard() {
  const { user, displayName, configured, signOut, saveDisplayName, loading } = useAuth()
  const [activity, setActivity] = useState(readActivity)
  const [message, setMessage] = useState<string | null>(null)

  const stats = useMemo(() => {
    const launches = activity.length
    const distinctGames = new Set(activity.map((entry) => entry.gameId)).size
    const distinctDays = new Set(activity.map((entry) => new Date(entry.at).toDateString())).size
    return { launches, distinctGames, distinctDays, gamesCompleted: 0 }
  }, [activity])

  // Unlocking is a side effect on external storage; the badges themselves are
  // derived from the same stats, so no extra state is needed.
  useEffect(() => {
    for (const rule of ARCADE_ACHIEVEMENTS) {
      if (rule.progress(stats) >= rule.target && !arcade.achievements.has(rule.id)) {
        void arcade.achievements.unlock(rule.id)
      }
    }
  }, [stats])

  const recent = useMemo(() => {
    const seen = new Set<string>()
    return activity.filter((entry) => {
      if (seen.has(entry.gameId) || !gamesById.has(entry.gameId)) return false
      seen.add(entry.gameId)
      return true
    })
  }, [activity])

  const exportData = () => {
    const dump: Record<string, unknown> = { exportedAt: new Date().toISOString(), displayName }
    try {
      for (const game of GAMES) {
        const raw = localStorage.getItem(game.saveKey)
        if (raw) dump[game.saveKey] = JSON.parse(raw)
      }
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index)
        if (key?.startsWith('lja:')) {
          const raw = localStorage.getItem(key)
          if (raw) {
            try {
              dump[key] = JSON.parse(raw)
            } catch {
              dump[key] = raw
            }
          }
        }
      }
    } catch {
      setMessage('This browser blocks local storage, so there was nothing to export.')
      return
    }
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `little-joy-arcade-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    setMessage('Your local data was exported as JSON.')
  }

  const clearLocal = () => {
    if (!window.confirm('Delete local progress and play history on this device? This cannot be undone.')) return
    try {
      for (const game of GAMES) localStorage.removeItem(game.saveKey)
      const doomed: string[] = []
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index)
        if (key?.startsWith('lja:')) doomed.push(key)
      }
      for (const key of doomed) localStorage.removeItem(key)
    } catch {
      // ignore
    }
    clearActivity()
    setActivity([])
    setMessage('Local progress cleared. Cloud saves (if any) were not touched.')
  }

  const onSaveName = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = String(new FormData(event.currentTarget).get('displayName') ?? '')
    const { error } = await saveDisplayName(value)
    setMessage(error ? `Could not save: ${error}` : 'Name saved.')
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-joy-amber/85">My arcade</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-cream sm:text-4xl">Hi, {displayName}</h1>
          <p className="mt-1 text-sm text-white/55">
            {user ? 'Signed in — cloud saves sync as each game adopts the SDK.' : 'Playing as a guest. Your progress lives on this device.'}
          </p>
        </div>
        {user ? (
          <button type="button" onClick={() => void signOut()} className="btn btn-ghost">
            Sign out
          </button>
        ) : (
          <Link to="/login" className="btn btn-primary">
            Create a free account
          </Link>
        )}
      </header>

      {message ? (
        <p className="card mb-6 px-4 py-3 text-sm text-joy-mint" role="status">
          {message}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Sessions', value: stats.launches, hint: 'on this device' },
          { label: 'Games tried', value: `${stats.distinctGames}/${GAMES.length}`, hint: 'of the shelf' },
          { label: 'Play days', value: stats.distinctDays, hint: 'nice and casual' },
          { label: 'Ads in gameplay', value: '0', hint: 'always' },
        ].map((stat) => (
          <div key={stat.label} className="card p-4">
            <p className="text-[0.68rem] uppercase tracking-wide text-white/45">{stat.label}</p>
            <p className="mt-1 text-2xl font-extrabold text-cream">{stat.value}</p>
            <p className="text-[0.7rem] text-white/35">{stat.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="space-y-6">
          <div className="card p-5">
            <h2 className="text-lg font-bold text-cream">Recently played</h2>
            {recent.length === 0 ? (
              <div className="mt-3 rounded-2xl border border-dashed border-white/15 p-6 text-center">
                <p className="text-sm text-white/55">Nothing yet — the shelf is waiting.</p>
                <Link to="/games" className="btn btn-primary mt-3 text-sm">
                  Pick a game
                </Link>
              </div>
            ) : (
              <ul className="mt-3 divide-y divide-white/10">
                {recent.slice(0, 6).map((entry) => {
                  const game = gamesById.get(entry.gameId)
                  if (!game) return null
                  return (
                    <li key={entry.gameId} className="flex items-center gap-3 py-3">
                      <Cover game={game} className="h-12 w-12 shrink-0 rounded-xl" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-cream">{game.name}</p>
                        <p className="text-xs text-white/40">{relative(entry.at)}</p>
                      </div>
                      <Link to={`/play/${game.id}`} className="btn btn-ghost px-3 py-1.5 text-xs">
                        Play
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-cream">Arcade achievements</h2>
              <span className="pill">
                {ARCADE_ACHIEVEMENTS.filter((rule) => rule.progress(stats) >= rule.target).length}/
                {ARCADE_ACHIEVEMENTS.length}
              </span>
            </div>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {ARCADE_ACHIEVEMENTS.map((rule) => {
                const done = rule.progress(stats)
                const earned = done >= rule.target
                const percent = Math.min(100, Math.round((done / rule.target) * 100))
                return (
                  <li
                    key={rule.id}
                    className={`rounded-2xl border p-3 ${
                      earned ? 'border-joy-amber/40 bg-joy-amber/10' : 'border-white/10 bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span aria-hidden="true" className={earned ? 'text-xl' : 'text-xl opacity-40'}>
                        {rule.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-semibold ${earned ? 'text-joy-amber' : 'text-white/80'}`}>
                          {rule.name}
                        </p>
                        <p className="text-xs text-white/45">{rule.description}</p>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div
                            className={`h-full rounded-full ${earned ? 'bg-joy-amber' : 'bg-joy-sky'}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
            <p className="mt-3 text-xs text-white/35">
              Computed from your real play sessions. Game-specific achievements unlock through the Little Joy SDK
              once a game is wired for cloud saves.
            </p>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="card p-5">
            <h2 className="text-lg font-bold text-cream">Account</h2>
            <form onSubmit={onSaveName} className="mt-3 space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wide text-white/45" htmlFor="display-name">
                Display name
              </label>
              <input
                key={displayName}
                id="display-name"
                name="displayName"
                defaultValue={displayName}
                maxLength={32}
                placeholder="Guest"
                className="w-full rounded-xl border border-white/15 bg-ink-900/60 px-3 py-2 text-sm text-cream placeholder:text-white/30 focus:border-joy-amber/60 focus:outline-none"
              />
              <button type="submit" className="btn btn-ghost w-full text-sm">
                Save name
              </button>
            </form>
            <dl className="mt-4 space-y-2 border-t border-white/10 pt-3 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-white/45">Account</dt>
                <dd className="font-medium text-cream">{loading ? '…' : user ? user.email : 'Guest'}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-white/45">Cloud saves</dt>
                <dd className="font-medium text-cream">{configured ? 'Available' : 'Not configured'}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-white/45">Ad-free</dt>
                <dd className="font-medium text-cream">
                  {arcade.entitlements.has('arcade.ad_free') ? 'Active' : '—'}
                </dd>
              </div>
            </dl>
            {!configured ? (
              <p className="mt-3 rounded-xl bg-white/5 p-3 text-xs leading-relaxed text-white/45">
                Accounts, cloud saves and purchases switch on once this build has Supabase credentials. Guest play
                always works.
              </p>
            ) : null}
          </section>

          <section className="card p-5">
            <h2 className="text-lg font-bold text-cream">Your data</h2>
            <p className="mt-1 text-xs leading-relaxed text-white/45">
              Progress is stored on this device. Export a copy, or clear it without touching any cloud save.
            </p>
            <div className="mt-3 space-y-2">
              <button type="button" onClick={exportData} className="btn btn-ghost w-full justify-start text-sm">
                ⬇ Export my data
              </button>
              <button type="button" onClick={clearLocal} className="btn btn-ghost w-full justify-start text-sm">
                🗑 Clear local progress
              </button>
              <Link to="/support" className="btn btn-ghost w-full justify-start text-sm">
                ✉ Request account deletion
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
