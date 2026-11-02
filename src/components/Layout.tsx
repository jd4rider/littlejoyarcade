import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/auth'

function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-joy-amber via-joy-coral to-joy-sky text-lg shadow-lg shadow-amber-500/20"
      >
        🎪
      </span>
      <span className="leading-none">
        <span className="block text-[0.95rem] font-extrabold tracking-tight text-cream">Little Joy</span>
        <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-joy-amber/80">
          Arcade
        </span>
      </span>
    </span>
  )
}

const navLink = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3 py-1.5 text-sm font-medium transition ${
    isActive ? 'bg-white/12 text-cream' : 'text-white/60 hover:bg-white/5 hover:text-cream'
  }`

export default function Layout() {
  const { user, loading } = useAuth()

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-joy-amber focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-ink-900"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-900/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <NavLink to="/" className="shrink-0" aria-label="Little Joy Arcade home">
            <Logo />
          </NavLink>

          <nav aria-label="Main" className="hidden items-center gap-1 sm:flex">
            <NavLink to="/" end className={navLink}>
              Home
            </NavLink>
            <NavLink to="/games" className={navLink}>
              Games
            </NavLink>
            <NavLink to="/dashboard" className={navLink}>
              My arcade
            </NavLink>
          </nav>

          <div className="flex items-center gap-2">
            {loading ? (
              <span className="h-8 w-24 animate-pulse rounded-full bg-white/10" />
            ) : user ? (
              <NavLink to="/dashboard" className="btn btn-ghost px-3 py-2 text-xs">
                <span aria-hidden="true">👤</span>
                <span className="hidden sm:inline">Account</span>
              </NavLink>
            ) : (
              <NavLink to="/login" className="btn btn-primary px-4 py-2 text-xs sm:text-sm">
                Sign in
              </NavLink>
            )}
          </div>
        </div>
        <nav aria-label="Mobile" className="flex items-center gap-1 overflow-x-auto px-4 pb-2 sm:hidden">
          <NavLink to="/" end className={navLink}>
            Home
          </NavLink>
          <NavLink to="/games" className={navLink}>
            Games
          </NavLink>
          <NavLink to="/dashboard" className={navLink}>
            My arcade
          </NavLink>
        </nav>
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-16 border-t border-white/10 bg-ink-950/40">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-3">
            <Logo />
            <p className="max-w-sm text-sm leading-relaxed text-white/55">
              A small, carefully made collection of puzzle and logic games. Free in your browser, with desktop
              builds for macOS, Windows and Linux where they exist.
            </p>
          </div>
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/40">Explore</h2>
            <ul className="space-y-2 text-sm text-white/65">
              <li>
                <NavLink to="/games" className="hover:text-cream">
                  All games
                </NavLink>
              </li>
              <li>
                <NavLink to="/dashboard" className="hover:text-cream">
                  My arcade
                </NavLink>
              </li>
              <li>
                <a href="https://github.com/jd4rider" className="hover:text-cream" target="_blank" rel="noreferrer">
                  Source on GitHub
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/40">The fine print</h2>
            <ul className="space-y-2 text-sm text-white/65">
              <li>
                <NavLink to="/privacy" className="hover:text-cream">
                  Privacy
                </NavLink>
              </li>
              <li>
                <NavLink to="/terms" className="hover:text-cream">
                  Terms
                </NavLink>
              </li>
              <li>
                <NavLink to="/support" className="hover:text-cream">
                  Support
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 border-t border-white/10 px-4 py-5 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} Little Joy Arcade. Games made by hand, no dark patterns.</p>
          <p>
            Built with{' '}
            <a
              href="https://freebuff.com"
              className="font-semibold text-white/60 hover:text-cream"
              target="_blank"
              rel="noreferrer"
            >
              Freebuff
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
