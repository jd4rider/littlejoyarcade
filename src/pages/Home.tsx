import { Link } from 'react-router-dom'
import { Cover, GameCard, SectionHeading } from '../components/ui'
import { CATEGORIES, GAMES, featuredGames } from '../data/games'

const TOTAL_LEVELS = GAMES.reduce((sum, game) => {
  const count = Number.parseInt(game.levels, 10)
  return sum + (Number.isFinite(count) ? count : 5)
}, 0)

const VALUES = [
  {
    emoji: '🧩',
    title: 'Made by hand',
    body: 'Every level is designed and tested, not endless-generated filler. Most games ship with 24–60 hand-built puzzles.',
  },
  {
    emoji: '🌙',
    title: 'Kind to your evening',
    body: 'No energy timers, no streaks to protect. Play a level, close the tab, come back when you feel like it.',
  },
  {
    emoji: '💾',
    title: 'Your progress stays yours',
    body: 'Saves work offline and live on your device. Sign in to keep them across devices as games adopt cloud saves.',
  },
]

export default function Home() {
  const hero = featuredGames[0] ?? GAMES[0]
  if (!hero) return null
  const shelf = GAMES.slice(0, 4)
  const latest = [...GAMES].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 4)

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6">
      <section className="grid gap-8 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-16">
        <div className="space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/75">
            <span className="h-1.5 w-1.5 rounded-full bg-joy-mint" aria-hidden="true" />
            {GAMES.length} games live · free to play · no install needed
          </p>
          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-cream sm:text-5xl lg:text-6xl">
            Small games.
            <br />
            <span className="bg-gradient-to-r from-joy-amber via-joy-coral to-joy-sky bg-clip-text text-transparent">
              Big little joys.
            </span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
            A cosy arcade of hand-made puzzle and logic games. Turn pipes, sort sand, wire circuits, light a
            coastline — then stop when you like. Nothing here asks for your streak.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link to={`/play/${hero.id}`} className="btn btn-primary px-6 py-3 text-base">
              Play {hero.name} ▶
            </Link>
            <Link to="/games" className="btn btn-ghost px-5 py-3 text-base">
              Browse all {GAMES.length} games
            </Link>
          </div>
          <dl className="grid max-w-lg grid-cols-3 gap-3 pt-2">
            {[
              { label: 'Hand-made levels', value: `${TOTAL_LEVELS}+` },
              { label: 'Games live', value: `${GAMES.length}` },
              { label: 'Ads in gameplay', value: '0' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3">
                <dt className="text-[0.68rem] uppercase tracking-wide text-white/45">{stat.label}</dt>
                <dd className="text-xl font-bold text-cream">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <div className="card overflow-hidden p-3 sm:p-4">
            <Cover game={hero} className="h-56 w-full rounded-2xl sm:h-72" />
            <div className="flex flex-wrap items-center justify-between gap-3 px-2 pt-4">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-joy-amber/80">
                  Featured today
                </p>
                <p className="text-xl font-bold text-cream">{hero.name}</p>
                <p className="text-sm text-white/55">{hero.tagline}</p>
              </div>
              <Link to={`/game/${hero.id}`} className="btn btn-ghost px-4 py-2 text-sm">
                Details
              </Link>
            </div>
          </div>
          <div className="pointer-events-none absolute -inset-2 -z-10 sm:-inset-6 rounded-[2.5rem] bg-gradient-to-br from-joy-amber/20 via-joy-coral/10 to-joy-sky/20 blur-2xl" />
        </div>
      </section>

      <section aria-labelledby="featured-heading" className="pt-4">
        <SectionHeading
          eyebrow="Start here"
          title="Featured games"
          action={{ label: 'See every game', to: '/games' }}
        />
        <h2 id="featured-heading" className="sr-only">
          Featured games
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {shelf.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      <section aria-labelledby="categories-heading" className="pt-12">
        <SectionHeading eyebrow="Find your mood" title="Browse by category" />
        <h2 id="categories-heading" className="sr-only">
          Categories
        </h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => {
            const count = GAMES.filter((game) => game.categories.includes(category)).length
            return (
              <Link
                key={category}
                to={`/games?category=${encodeURIComponent(category)}`}
                className="card card-hover flex items-center gap-2 px-4 py-2 text-sm text-white/75 hover:text-cream"
              >
                {category}
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[0.65rem] text-white/60">{count}</span>
              </Link>
            )
          })}
        </div>
      </section>

      <section aria-labelledby="values-heading" className="pt-12">
        <SectionHeading eyebrow="Why this exists" title="A calmer kind of arcade" />
        <h2 id="values-heading" className="sr-only">
          Why Little Joy Arcade
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {VALUES.map((value) => (
            <div key={value.title} className="card p-5">
              <span aria-hidden="true" className="text-2xl">
                {value.emoji}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-cream">{value.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/60">{value.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="latest-heading" className="pt-12">
        <SectionHeading eyebrow="Freshly polished" title="Latest updates" action={{ label: 'All games', to: '/games' }} />
        <h2 id="latest-heading" className="sr-only">
          Latest updates
        </h2>
        <ul className="card divide-y divide-white/10">
          {latest.map((game) => (
            <li key={game.id}>
              <Link to={`/game/${game.id}`} className="group flex items-center gap-4 p-4 hover:bg-white/[0.03]">
                <Cover game={game} className="h-14 w-14 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-cream">{game.name}</p>
                  <p className="truncate text-sm text-white/50">{game.tagline}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-semibold text-joy-mint">v{game.version}</p>
                  <p className="text-[0.7rem] text-white/40">{game.updated}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
