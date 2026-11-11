import { Link } from 'react-router-dom'
import type { CSSProperties } from 'react'
import type { Game } from '../data/games'

type CoverMotion = 'rocket' | 'cat' | 'bubble' | 'zap' | 'beam' | 'wobble' | 'spin' | 'sparkle'

// Each cover gets a small idle scene that comes alive on hover. The glyph is
// the only per-game art we have, so it decides the motion and particle colour.
const MOTIONS: Array<[string, CoverMotion]> = [
  ['🚀', 'rocket'],
  ['🐱', 'cat'],
  ['🐈', 'cat'],
  ['🫧', 'bubble'],
  ['⚡', 'zap'],
  ['💥', 'zap'],
  ['🗼', 'beam'],
  ['🔴', 'beam'],
  ['🔷', 'beam'],
  ['🔮', 'beam'],
  ['🍉', 'wobble'],
  ['🧶', 'wobble'],
  ['🔧', 'wobble'],
  ['🧩', 'wobble'],
  ['🚗', 'wobble'],
  ['🚌', 'wobble'],
  ['🚧', 'wobble'],
  ['🏃', 'wobble'],
  ['🏰', 'wobble'],
  ['🌀', 'spin'],
  ['⚙️', 'spin'],
  ['🧱', 'spin'],
]

function motionFor(emoji: string): CoverMotion {
  return MOTIONS.find(([glyph]) => emoji.includes(glyph))?.[1] ?? 'sparkle'
}

/** Stable pseudo-random numbers, so a card animates the same way every visit. */
function seededRandom(seed: string): () => number {
  let hash = 2166136261
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return () => {
    hash = Math.imul(hash ^ (hash >>> 15), 2246822507)
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909)
    hash ^= hash >>> 16
    return (hash >>> 0) / 4294967296
  }
}

function coverParticles(game: Game, motion: CoverMotion) {
  const random = seededRandom(`${game.id}:${motion}`)
  const rises = motion === 'cat' || motion === 'bubble' || motion === 'wobble'

  return Array.from({ length: 12 }, (_, index) => {
    const angle = (index / 12) * Math.PI * 2 + random() * 0.6
    let dx = Math.cos(angle) * (16 + random() * 20)
    let dy = Math.sin(angle) * (16 + random() * 20)

    if (motion === 'rocket') {
      // Exhaust: a narrow plume firing straight down.
      dx = (random() - 0.5) * 22
      dy = 30 + random() * 34
    } else if (rises) {
      dx = (random() - 0.5) * 46
      dy = -(22 + random() * 30)
    }

    return {
      key: index,
      style: {
        '--dx': `${dx.toFixed(1)}cqmin`,
        '--dy': `${dy.toFixed(1)}cqmin`,
        '--szm': (0.65 + random() * 1.05).toFixed(2),
        animationDelay: `-${Math.round(random() * 1200)}ms`,
      } as CSSProperties,
    }
  })
}

export function Cover({ game, className = '' }: { game: Game; className?: string }) {
  const motion = motionFor(game.cover.emoji)

  return (
    <div
      className={`grid-cover cover-scene cover-scene--${motion} ${className}`}
      data-motion={motion}
      style={{ background: `linear-gradient(140deg, ${game.cover.from}, ${game.cover.to})` }}
    >
      <span aria-hidden="true" className="cover-glow" />
      {motion === 'rocket' ? <span aria-hidden="true" className="cover-jet" /> : null}
      <span aria-hidden="true" className="cover-particles">
        {coverParticles(game, motion).map((particle) => (
          <i key={particle.key} className="cp" style={particle.style} />
        ))}
      </span>
      <div className="cover-stage">
        <span aria-hidden="true" className="cover-emoji">
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
