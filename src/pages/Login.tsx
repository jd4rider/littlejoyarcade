import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { backendHelp } from '../lib/supabase'

type Mode = 'signin' | 'create'

export default function Login() {
  const { configured, sendMagicLink, signInWithPassword, signUpWithPassword, guestName, setGuestName, user } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState(guestName)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setNotice(null)
    setBusy(true)
    if (mode === 'create') {
      const result = await signUpWithPassword(email, password)
      setBusy(false)
      if (result.error) {
        setError(result.error)
        return
      }
      if (result.needsConfirmation) {
        setNotice('Account created. Check your inbox to confirm, then sign in.')
        setMode('signin')
        return
      }
      navigate('/dashboard')
      return
    }
    const result = await signInWithPassword(email, password)
    setBusy(false)
    if (result.error) {
      setError(result.error)
      return
    }
    navigate('/dashboard')
  }

  const onMagicLink = async () => {
    setError(null)
    setNotice(null)
    if (!email.trim()) {
      setError('Enter your email first.')
      return
    }
    setBusy(true)
    const result = await sendMagicLink(email)
    setBusy(false)
    if (result.error) setError(result.error)
    else setNotice('Check your inbox — the link signs you in on this device.')
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-cream sm:text-4xl">Your Little Joy account</h1>
      <p className="mt-2 text-white/60">
        One account for every game. Sign in here or from inside any game to carry progress across devices — and you
        never need an account to play.
      </p>

      {user ? (
        <div className="card mt-6 p-5">
          <p className="text-sm text-white/70">
            You are signed in as <strong className="text-cream">{user.email}</strong>.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/dashboard" className="btn btn-primary">
              Go to my arcade
            </Link>
            <Link to="/games" className="btn btn-ghost">
              Browse games
            </Link>
          </div>
        </div>
      ) : (
        <>
          <form onSubmit={onSubmit} className="card mt-6 space-y-4 p-5">
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-ink-900/60 p-1" role="tablist" aria-label="Account mode">
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'signin'}
                onClick={() => {
                  setMode('signin')
                  setError(null)
                  setNotice(null)
                }}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  mode === 'signin' ? 'bg-joy-amber text-ink-950' : 'text-white/60 hover:text-cream'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'create'}
                onClick={() => {
                  setMode('create')
                  setError(null)
                  setNotice(null)
                }}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  mode === 'create' ? 'bg-joy-amber text-ink-950' : 'text-white/60 hover:text-cream'
                }`}
              >
                Create account
              </button>
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/45">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/15 bg-ink-900/60 px-3 py-2.5 text-sm text-cream placeholder:text-white/30 focus:border-joy-amber/60 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/45"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete={mode === 'create' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={mode === 'create' ? 'At least 6 characters' : 'Your password'}
                className="w-full rounded-xl border border-white/15 bg-ink-900/60 px-3 py-2.5 text-sm text-cream placeholder:text-white/30 focus:border-joy-amber/60 focus:outline-none"
              />
            </div>

            <button type="submit" disabled={!configured || busy} className="btn btn-primary w-full disabled:opacity-40">
              {busy ? 'Working…' : mode === 'create' ? 'Create my account' : 'Sign in'}
            </button>

            <p aria-live="polite" className="text-sm">
              {notice ? <span className="text-joy-mint">{notice}</span> : null}
              {error ? <span className="text-joy-coral">{error}</span> : null}
            </p>

            <div className="border-t border-white/10 pt-3 text-center">
              <button
                type="button"
                onClick={onMagicLink}
                disabled={!configured || busy}
                className="text-xs font-semibold text-white/50 underline underline-offset-2 hover:text-cream disabled:opacity-40"
              >
                Email me a one-time sign-in link instead
              </button>
              <p className="mt-2 text-xs leading-relaxed text-white/35">
                Passwords are handled by Supabase Auth; we never store them ourselves. Signed-in progress syncs to your
                account, and you can delete the account at any time.
              </p>
            </div>
          </form>

          {!configured ? (
            <div className="card mt-4 border-joy-amber/30 bg-joy-amber/5 p-4 text-sm leading-relaxed text-joy-amber/90">
              <p className="font-semibold">Accounts are not live on this build yet.</p>
              <p className="mt-1 text-xs text-white/60">{backendHelp}</p>
            </div>
          ) : null}
        </>
      )}

      <section className="card mt-6 p-5">
        <h2 className="text-lg font-bold text-cream">Play as a guest</h2>
        <p className="mt-1 text-sm text-white/55">
          Pick a name for your guest profile. Progress is saved on this device and can be exported any time.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={32}
            placeholder="Guest name"
            aria-label="Guest display name"
            className="min-w-0 flex-1 rounded-xl border border-white/15 bg-ink-900/60 px-3 py-2 text-sm text-cream placeholder:text-white/30 focus:border-joy-amber/60 focus:outline-none"
          />
          <button type="button" onClick={() => setGuestName(name)} className="btn btn-ghost text-sm">
            Use this name
          </button>
        </div>
        <Link to="/games" className="btn btn-primary mt-4 w-full">
          Browse games as a guest
        </Link>
      </section>

      <p className="mt-6 text-xs text-white/35">
        By creating an account you agree to the{' '}
        <Link to="/terms" className="underline">
          terms
        </Link>{' '}
        and{' '}
        <Link to="/privacy" className="underline">
          privacy policy
        </Link>
        .
      </p>
    </div>
  )
}
