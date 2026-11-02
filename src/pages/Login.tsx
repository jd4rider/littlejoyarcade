import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { backendHelp } from '../lib/supabase'

export default function Login() {
  const { configured, sendMagicLink, guestName, setGuestName, user } = useAuth()
  const [email, setEmail] = useState('')
  const [name, setName] = useState(guestName)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setStatus('sending')
    setError(null)
    const result = await sendMagicLink(email)
    if (result.error) {
      setError(result.error)
      setStatus('error')
    } else {
      setStatus('sent')
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-cream sm:text-4xl">Your Little Joy account</h1>
      <p className="mt-2 text-white/60">
        One account for every game. Cloud saves and cross-device progress switch on as games adopt the shared SDK —
        and you never need an account to play.
      </p>

      {user ? (
        <div className="card mt-6 p-5">
          <p className="text-sm text-white/70">
            You are signed in as <strong className="text-cream">{user.email}</strong>.
          </p>
          <Link to="/dashboard" className="btn btn-primary mt-4">
            Go to my arcade
          </Link>
        </div>
      ) : (
        <>
          <form onSubmit={onSubmit} className="card mt-6 space-y-4 p-5">
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
            <button type="submit" disabled={!configured || status === 'sending'} className="btn btn-primary w-full disabled:opacity-40">
              {status === 'sending' ? 'Sending…' : 'Email me a sign-in link'}
            </button>
            <p aria-live="polite" className="text-sm">
              {status === 'sent' ? (
                <span className="text-joy-mint">Check your inbox — the link signs you in on this device.</span>
              ) : null}
              {error ? <span className="text-joy-coral">{error}</span> : null}
            </p>
            <p className="text-xs leading-relaxed text-white/40">
              We send a one-time link instead of storing a password. No passwords means nothing to leak.
            </p>
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
          <button
            type="button"
            onClick={() => setGuestName(name)}
            className="btn btn-ghost text-sm"
          >
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
