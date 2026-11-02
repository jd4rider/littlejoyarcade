import { Link, useParams } from 'react-router-dom'
import { Cover, GameCard } from '../components/ui'
import { gamesById, relatedGames } from '../data/games'
import { recordLaunch } from '../lib/arcade'
import NotFound from './NotFound'

export default function GameDetail() {
  const { id } = useParams()
  const game = id ? gamesById.get(id) : undefined
  if (!game) return <NotFound />

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <Link to="/games" className="text-sm text-white/50 hover:text-cream">
        ← All games
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="card overflow-hidden">
            <Cover game={game} className="h-56 w-full sm:h-72" />
            <div className="space-y-4 p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                {game.categories.map((category) => (
                  <Link
                    key={category}
                    to={`/games?category=${encodeURIComponent(category)}`}
                    className="pill hover:border-joy-amber/50 hover:text-joy-amber"
                  >
                    {category}
                  </Link>
                ))}
                <span className="pill border-joy-mint/30 bg-joy-mint/10 text-joy-mint">v{game.version}</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-cream sm:text-4xl">{game.name}</h1>
              <p className="text-lg text-white/70">{game.tagline}</p>
              <p className="leading-relaxed text-white/60">{game.description}</p>
              <div className="flex flex-wrap gap-3 pt-1">
                <Link to={`/play/${game.id}`} onClick={() => recordLaunch(game.id)} className="btn btn-primary px-6 py-3">
                  Play now ▶
                </Link>
                <a href={game.siteUrl} target="_blank" rel="noreferrer" className="btn btn-ghost px-5 py-3">
                  Game site ↗
                </a>
              </div>
            </div>
          </div>

          <section className="card p-5 sm:p-6" aria-labelledby="highlights-heading">
            <h2 id="highlights-heading" className="text-xl font-bold text-cream">
              What makes it good
            </h2>
            <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-white/65">
              {game.highlights.map((highlight) => (
                <li key={highlight} className="flex gap-2">
                  <span aria-hidden="true" className="text-joy-mint">
                    ✦
                  </span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-5 sm:p-6" aria-labelledby="how-heading">
            <h2 id="how-heading" className="text-xl font-bold text-cream">
              How to play
            </h2>
            <ol className="mt-3 space-y-2.5 text-sm leading-relaxed text-white/65">
              {game.howToPlay.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold text-cream">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="card p-5" aria-labelledby="details-heading">
            <h2 id="details-heading" className="text-sm font-semibold uppercase tracking-[0.16em] text-white/40">
              Details
            </h2>
            <dl className="mt-3 space-y-3 text-sm">
              {[
                ['Engine', game.runtime],
                ['Content', game.levels],
                ['Version', game.version],
                ['Updated', game.updated],
                ['Saves', 'On this device'],
                ['Price', 'Free'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <dt className="text-white/45">{label}</dt>
                  <dd className="text-right font-medium text-cream">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="card p-5" aria-labelledby="downloads-heading">
            <h2 id="downloads-heading" className="text-sm font-semibold uppercase tracking-[0.16em] text-white/40">
              Desktop downloads
            </h2>
            {game.downloads.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {game.downloads.map((download) => (
                  <li key={download.url}>
                    <a href={download.url} className="btn btn-ghost w-full justify-between px-4 py-2.5 text-sm">
                      <span>{download.label}</span>
                      <span aria-hidden="true">↓</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-white/55">
                This one is browser-only for now. The web build is the full game — nothing is held back.
              </p>
            )}
            <a
              href={game.releasesUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-xs font-semibold text-joy-sky hover:underline"
            >
              All releases on GitHub ↗
            </a>
          </section>

          <section className="card p-5" aria-labelledby="platform-heading">
            <h2 id="platform-heading" className="text-sm font-semibold uppercase tracking-[0.16em] text-white/40">
              Platforms
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2 text-xs text-white/70">
              <li className="pill">Browser</li>
              <li className="pill">macOS</li>
              <li className="pill">Windows</li>
              <li className="pill">Linux</li>
              <li className="pill">Touch &amp; mouse</li>
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-white/40">
              Cloud saves and arcade achievements arrive for this game once it is wired to the Little Joy SDK.
            </p>
          </section>

          <section className="card p-5" aria-labelledby="source-heading">
            <h2 id="source-heading" className="text-sm font-semibold uppercase tracking-[0.16em] text-white/40">
              Under the hood
            </h2>
            <a
              href={game.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 block truncate text-sm font-medium text-joy-sky hover:underline"
            >
              {game.repoUrl.replace('https://github.com/', 'github.com/')} ↗
            </a>
            <p className="mt-2 text-xs leading-relaxed text-white/40">
              Save format: <code className="rounded bg-white/10 px-1 py-0.5">{game.saveKey}</code>
            </p>
          </section>
        </aside>
      </div>

      <section className="mt-12" aria-labelledby="related-heading">
        <h2 id="related-heading" className="mb-4 text-2xl font-bold text-cream">
          More like this
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {relatedGames(game).map((related) => (
            <GameCard key={related.id} game={related} />
          ))}
        </div>
      </section>
    </div>
  )
}
