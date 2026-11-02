#!/usr/bin/env node
/*
 * Seed the database catalogue from the TypeScript catalogue.
 *
 *   SUPABASE_DB_PASSWORD=... node scripts/seed-catalog.mjs
 *
 * This is a bridge, not the normal path: it lets an existing hand-written
 * catalogue become database-driven in one step. After this, publish games with
 * `scripts/publish-game.mjs` or the admin UI/SDK and the portal reads the rows.
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { lookup } from 'node:dns/promises'
import { Client } from 'pg'

const outDir = mkdtempSync(join(tmpdir(), 'lja-catalog-'))
const bundle = join(outDir, 'catalog.mjs')

execFileSync(
  'npx',
  ['esbuild', 'src/data/games.ts', '--bundle', '--format=esm', '--platform=node', `--outfile=${bundle}`],
  { stdio: 'inherit' },
)

const { GAMES } = await import(pathToFileURL(bundle).href)

async function createClient() {
  const { address } = await lookup(process.env.SUPABASE_DB_HOST || 'aws-0-us-west-1.pooler.supabase.com', { family: 4 })
  return new Client({
    host: address,
  host: process.env.SUPABASE_DB_HOST || 'aws-0-us-west-1.pooler.supabase.com',
  port: 5432,
  user: process.env.SUPABASE_DB_USER || 'postgres.fqovramltegcfiyebyrt',
  password: process.env.SUPABASE_DB_PASSWORD,
  database: 'postgres',
    ssl: { rejectUnauthorized: false },
  })
}

const SQL = `
insert into public.games
  (id, name, description, status, featured, version, play_url, site_url, repo_url, categories,
   tagline, runtime, cover, highlights, how_to_play, levels, save_key, downloads, updated_on, manifest, sort_order)
values
  ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb,$14,$15,$16,$17,$18::jsonb,$19,$20::jsonb,$21)
on conflict (id) do update set
  name = excluded.name, description = excluded.description, status = excluded.status,
  featured = excluded.featured, version = excluded.version, play_url = excluded.play_url,
  site_url = excluded.site_url, repo_url = excluded.repo_url, categories = excluded.categories,
  tagline = excluded.tagline, runtime = excluded.runtime, cover = excluded.cover,
  highlights = excluded.highlights, how_to_play = excluded.how_to_play, levels = excluded.levels,
  save_key = excluded.save_key, downloads = excluded.downloads, updated_on = excluded.updated_on,
  manifest = excluded.manifest, sort_order = excluded.sort_order, updated_at = now()
`

const client = await createClient()
await client.connect()
try {
  await client.query('begin')
  for (const [index, game] of GAMES.entries()) {
    await client.query(SQL, [
      game.id,
      game.name,
      game.description ?? null,
      game.status === 'coming-soon' ? 'coming_soon' : (game.status ?? 'live'),
      Boolean(game.featured),
      game.version ?? '0.0.0',
      game.playUrl,
      game.siteUrl ?? null,
      game.repoUrl ?? null,
      game.categories ?? [],
      game.tagline ?? null,
      game.runtime ?? 'Phaser 4',
      JSON.stringify(game.cover ?? null),
      game.highlights ?? [],
      game.howToPlay ?? [],
      game.levels ?? null,
      game.saveKey ?? null,
      JSON.stringify(game.downloads ?? []),
      game.updated ?? null,
      JSON.stringify(game),
      index,
    ])
  }
  await client.query('commit')
  const rows = await client.query("select count(*)::int as n, count(manifest)::int as with_manifest from public.games")
  console.log(`seeded ${rows.rows[0].n} games (${rows.rows[0].with_manifest} with manifests)`)
  const sample = await client.query("select id, name, version, jsonb_array_length(downloads) as links from public.games order by sort_order limit 3")
  console.table(sample.rows)
} catch (error) {
  await client.query('rollback')
  console.error('seed failed:', error.message)
  process.exitCode = 1
} finally {
  await client.end()
}
