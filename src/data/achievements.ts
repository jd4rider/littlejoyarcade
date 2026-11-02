import type { Game } from './games'
import { GAMES } from './games'

export interface AchievementRule {
  id: string
  name: string
  description: string
  emoji: string
  target: number
  progress: (stats: {
    launches: number
    distinctGames: number
    distinctDays: number
    gamesCompleted: number
  }) => number
}

// Arcade-wide achievements, all computed from real local play. Game-specific
// achievements live in the database and are unlocked through the SDK.
export const ARCADE_ACHIEVEMENTS: AchievementRule[] = [
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Launch any Little Joy game.',
    emoji: '🌱',
    target: 1,
    progress: (stats) => stats.launches,
  },
  {
    id: 'sampler',
    name: 'Sampler',
    description: 'Play three different games.',
    emoji: '🍬',
    target: 3,
    progress: (stats) => stats.distinctGames,
  },
  {
    id: 'completionist',
    name: 'Full Shelf',
    description: 'Try every game in the arcade.',
    emoji: '📚',
    target: GAMES.length,
    progress: (stats) => stats.distinctGames,
  },
  {
    id: 'regular',
    name: 'Regular',
    description: 'Play on five different days.',
    emoji: '📅',
    target: 5,
    progress: (stats) => stats.distinctDays,
  },
  {
    id: 'one-more-go',
    name: 'One More Go',
    description: 'Start 25 sessions.',
    emoji: '🔁',
    target: 25,
    progress: (stats) => stats.launches,
  },
]

export function completionistTarget(games: Game[]): number {
  return games.length
}
