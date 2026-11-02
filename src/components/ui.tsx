import { Link } from 'react-router-dom'
import type { Game } from '../data/games'

export function Cover({ game, className = '' }: { game: Game; className?: string }) {
  return (
    <div
      className={`grid-cover ${className}`}
      style={{ background: `linear-gradient(140deg, ${game.cover.from}, ${game.cover.to})` }}
    >
      <div className="flex h-full w-full items-center justify-center">
        <span aria-hidden="true" className="text-5xl drop-shadow-[0_6px_18px_rgba(0,0,0,0.35)] sm:text-6xl">
          {game.cover.emoji}
        </span>
      </div>
    </div>
  )
}

export function GameCard({ game }: { game: Game }) {
  return (
    <article className="card card-hover group overflow-hidden">
      <Link to={`/game/${game.id}`} className="block">
        <Cover game={game} className="h-40 w-full sm:h-44" />
        <div className="space-y-2 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-semibold tracking-tight text-cream">{game.name}</h3>
            <span className="pill shrink-0">v{game.version}</span>
          </div>
          <p className="text-sm leading-snug text-white/65">{game.tagline}</p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {game.categories.slice(0, 3).map((category) => (
              <span key={category} className="pill border-white/10 bg-white/5 text-[0.68rem]">
                {category}
              </span>
            ))}
          </div>
        </div>
      </Link>
      <div className="flex items-center justify-between gap-2 border-t border-white/10 px-4 pb-4 pt-3 sm:px-5">
        <span className="text-xs text-white/45">{game.levels}</span>
        <Link
          to={`/play/${game.id}`}
          className="btn btn-ghost px-3 py-1.5 text-xs"
          aria-label={`Play ${game.name} now`}
        >
          Play ▶
        </Link>
      </div>
    </article>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string
  title: string
  action?: { label: string; to: string }
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow ? (
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-joy-amber/85">{eyebrow}</p>
        ) : null}
        <h2 className="text-2xl font-bold tracking-tight text-cream sm:text-3xl">{title}</h2>
      </div>
      {action ? (
        <Link to={action.to} className="text-sm font-semibold text-joy-sky underline-offset-4 hover:underline">
          {action.label} →
        </Link>
      ) : null}
    </div>
  )
}
