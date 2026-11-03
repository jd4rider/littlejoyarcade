#!/usr/bin/env node
/*
 * Publish a game manifest through the Supabase REST API using a service-role
 * key. This is the path for machines where the Postgres password is not
 * available but the Supabase CLI is signed in:
 *
 *   KEY=$(npx supabase projects api-keys --project-ref <ref> | awk ...)
 *   SUPABASE_SERVICE_ROLE_KEY=$KEY node scripts/publish-game-rest.mjs game.json
 *
 * The row is upserted on the primary key, so re-running is safe.
 */
import { readFile } from 'node:fs/promises'

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://fqovramltegcfiyebyrt.supabase.co'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!key) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required.')
  process.exit(1)
}

const path = process.argv[2]
if (!path) {
  console.error('Usage: SUPABASE_SERVICE_ROLE_KEY=... node scripts/publish-game-rest.mjs path/to/manifest.json')
  process.exit(1)
}

const game = JSON.parse(await readFile(path, 'utf8'))
for (const field of ['id', 'name', 'tagline', 'description', 'playUrl']) {
  if (!game[field]) {
    console.error(`manifest is missing: ${field}`)
    process.exit(1)
  }
}

const row = {
  id: game.id,
  name: game.name,
  description: game.description ?? null,
  status: game.status === 'coming-soon' ? 'coming_soon' : (game.status ?? 'live'),
  featured: Boolean(game.featured),
  version: game.version ?? '0.0.0',
  play_url: game.playUrl,
  site_url: game.siteUrl ?? null,
  repo_url: game.repoUrl ?? null,
  categories: game.categories ?? [],
  tagline: game.tagline ?? null,
  runtime: game.runtime ?? 'Phaser 4',
  cover: game.cover ?? null,
  highlights: game.highlights ?? [],
  how_to_play: game.howToPlay ?? [],
  levels: game.levels ?? null,
  save_key: game.saveKey ?? null,
  downloads: game.downloads ?? [],
  updated_on: game.updated ?? null,
  manifest: game,
}

const response = await fetch(`${SUPABASE_URL}/rest/v1/games?on_conflict=id`, {
  method: 'POST',
  headers: {
    apikey: key,
    authorization: `Bearer ${key}`,
    'content-type': 'application/json',
    prefer: 'resolution=merge-duplicates,return=representation',
  },
  body: JSON.stringify(row),
})

if (!response.ok) {
  console.error(`publish failed: ${response.status} ${await response.text()}`)
  process.exit(1)
}

const written = await response.json()
const saved = Array.isArray(written) ? written[0] : written
console.log(`published ${saved.id} v${saved.version} (${saved.status})`)

const verify = await fetch(
  `${SUPABASE_URL}/rest/v1/games?select=id,name,version,status,play_url,runtime&id=eq.${encodeURIComponent(game.id)}`,
  { headers: { apikey: key, authorization: `Bearer ${key}` } },
)
const rows = await verify.json()
console.log('verified in database:', rows[0] ?? 'NOT FOUND')
if (!rows[0]) process.exit(1)
