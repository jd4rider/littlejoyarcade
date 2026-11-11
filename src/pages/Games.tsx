import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { GameCard } from '../components/ui'
import { CATEGORIES, GAMES } from '../data/games'
import { useFavorites } from '../lib/favorites'

type Sort = 'featured' | 'newest' | 'alphabetical'

export default function Games() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const category = params.get('category') ?? ''
  const sort = (params.get('sort') as Sort | null) ?? 'featured'
  const onlyFavorites = params.get('favorites') === '1'
  const { favorites } = useFavorites()
  const favoriteSet = useMemo(() => new Set(favorites), [favorites])

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return GAMES.filter((game) => {
      const matchesCategory = !category || game.categories.includes(category as never)
      const matchesFavorites = !onlyFavorites || favoriteSet.has(game.id)
      const matchesQuery =
        !needle ||
        `${game.name} ${game.tagline} ${game.description} ${game.categories.join(' ')}`
          .toLowerCase()
          .includes(needle)
      return matchesCategory && matchesFavorites && matchesQuery
    }).sort((a, b) => {
      if (sort === 'newest') return b.updated.localeCompare(a.updated)
      if (sort === 'alphabetical') return a.name.localeCompare(b.name)
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured))
    })
  }, [category, favoriteSet, onlyFavorites, query, sort])

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-6">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-joy-amber/85">The shelf</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-cream sm:text-4xl">All games</h1>
        <p className="mt-2 max-w-2xl text-white/60">
          {GAMES.length} games, all playable in the browser. Desktop installers are linked on the games that have them.
        </p>
      </header>

      <div className="card mb-6 space-y-4 p-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/45">Search</span>
          <input
            type="search"
            value={query}
            onChange={(event) => update('q', event.target.value)}
            placeholder="Try “pipes”, “relaxing”, “nonogram”…"
            className="w-full rounded-full border border-white/15 bg-ink-900/60 px-4 py-2.5 text-sm text-cream placeholder:text-white/35 focus:border-joy-amber/60 focus:outline-none"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => update('category', '')}
            aria-pressed={category === ''}
            className={`pill transition ${category === '' ? 'border-joy-amber/70 bg-joy-amber/15 text-joy-amber' : 'hover:bg-white/10'}`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => update('favorites', onlyFavorites ? '' : '1')}
            aria-pressed={onlyFavorites}
            className={`pill transition ${
              onlyFavorites ? 'border-joy-coral/70 bg-joy-coral/15 text-joy-coral' : 'hover:bg-white/10'
            }`}
          >
            <span aria-hidden="true">♥</span> Favorites{favorites.length > 0 ? ` (${favorites.length})` : ''}
          </button>
          {CATEGORIES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => update('category', option === category ? '' : option)}
              aria-pressed={category === option}
              className={`pill transition ${
                category === option ? 'border-joy-amber/70 bg-joy-amber/15 text-joy-amber' : 'hover:bg-white/10'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
          <p className="text-sm text-white/50" role="status">
            {results.length} game{results.length === 1 ? '' : 's'}
          </p>
          <label className="flex items-center gap-2 text-sm text-white/50">
            Sort
            <select
              value={sort}
              onChange={(event) => update('sort', event.target.value)}
              className="rounded-full border border-white/15 bg-ink-900/80 px-3 py-1.5 text-sm text-cream focus:border-joy-amber/60 focus:outline-none"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="alphabetical">A–Z</option>
            </select>
          </label>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-2xl" aria-hidden="true">
            🔍
          </p>
          <h2 className="mt-2 text-lg font-semibold text-cream">
            {onlyFavorites ? 'No favorites yet' : 'Nothing on that shelf'}
          </h2>
          <p className="mt-1 text-sm text-white/55">
            {onlyFavorites
              ? 'Tap the heart on any game to keep it here.'
              : 'Try a different word, or clear the filters.'}
          </p>
          <button type="button" onClick={() => setParams(new URLSearchParams())} className="btn btn-ghost mt-4">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  )
}
