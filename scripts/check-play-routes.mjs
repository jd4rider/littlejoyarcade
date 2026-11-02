// Checks every playable game's URLs so a broken host is caught by CI instead of
// by a player staring at a black screen.
//
// A game is playable when its canonical URL answers 2xx. The preferred
// (subdomain) URL is allowed to fail — the portal probes it and falls back to
// the canonical one — but its state is reported so a recovered host is noticed.
//
//   node scripts/check-play-routes.mjs          # human table, exit 1 on breakage
//   node scripts/check-play-routes.mjs --strict # also fail when a subdomain fails
import { readFile } from 'node:fs/promises'

const TIMEOUT_MS = 15000

async function probe(url) {
  const started = Date.now()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      cache: 'no-store',
      signal: controller.signal,
      headers: { 'user-agent': 'littlejoyarcade-play-route-check' },
    })
    return { ok: response.ok, status: response.status, ms: Date.now() - started, finalUrl: response.url }
  } catch (error) {
    return { ok: false, status: 0, ms: Date.now() - started, error: error.name === 'AbortError' ? 'timeout' : String(error.message || error) }
  } finally {
    clearTimeout(timer)
  }
}

function gamesFromSource(source) {
  const games = []
  const blocks = source.split(/\n  \{\n/).slice(1)
  for (const block of blocks) {
    const id = block.match(/^\s*id: '([^']+)'/)?.[1]
    const playUrl = block.match(/^\s*playUrl: '([^']+)'/m)?.[1]
    if (!id || !playUrl) continue
    const preferredPlayUrl = block.match(/^\s*preferredPlayUrl: '([^']+)'/m)?.[1]
    games.push({ id, playUrl, preferredPlayUrl })
  }
  return games
}

const source = await readFile(new URL('../src/data/games.ts', import.meta.url), 'utf8')
const games = gamesFromSource(source)
if (games.length === 0) {
  console.error('No games parsed from src/data/games.ts — the catalogue format changed.')
  process.exit(1)
}

const strict = process.argv.includes('--strict')
const rows = []
for (const game of games) {
  const canonical = await probe(game.playUrl)
  const preferred = game.preferredPlayUrl ? await probe(game.preferredPlayUrl) : null
  rows.push({ game, canonical, preferred })
}

const pad = (value, width) => String(value).padEnd(width)
console.log(pad('game', 18), pad('canonical', 9), pad('ms', 6), pad('subdomain', 10), 'note')
for (const { game, canonical, preferred } of rows) {
  const sub = preferred ? (preferred.ok ? 'ok' : `fail ${preferred.status}`) : '—'
  const note = canonical.ok
    ? preferred && !preferred.ok
      ? 'falls back to canonical'
      : 'ok'
    : `BROKEN ${canonical.error ?? canonical.status}`
  console.log(pad(game.id, 18), pad(canonical.ok ? canonical.status : 'ERR', 9), pad(canonical.ms, 6), pad(sub, 10), note)
}

const broken = rows.filter((row) => !row.canonical.ok)
const subdomainDown = rows.filter((row) => row.preferred && !row.preferred.ok)
console.log(`\n${rows.length - broken.length}/${rows.length} playable · ${subdomainDown.length} using the github.io fallback`)

if (broken.length > 0) {
  console.error(`\nBroken canonical URLs: ${broken.map((row) => row.game.id).join(', ')}`)
  process.exit(1)
}
if (strict && subdomainDown.length > 0) {
  console.error(`\nPreferred subdomains unreachable: ${subdomainDown.map((row) => row.game.id).join(', ')}`)
  process.exit(1)
}
