#!/usr/bin/env node
/*
 * Publish or update a game in the Little Joy Arcade catalogue.
 *
 *   SUPABASE_DB_PASSWORD=... node scripts/publish-game.mjs path/to/game.json
 *   SUPABASE_DB_PASSWORD=... node scripts/publish-game.mjs --list
 *
 * The manifest is the same object the portal uses in src/data/games.ts:
 *
 *   {
 *     "id": "star-trail",
 *     "name": "Star Trail",
 *     "tagline": "Collect the sparks.",
 *     "description": "...",
 *     "categories": ["Puzzle", "Logic"],
 *     "runtime": "Phaser 4",
 *     "version": "0.1.0",
 *     "status": "live",
 *     "featured": false,
 *     "playUrl": "https://star-trail-lja.web.app/",
 *     "siteUrl": "https://star-trail-lja.web.app/",
 *     "repoUrl": "https://github.com/jd4rider/star-trail",
 *     "downloads": [],
 *     "cover": { "from": "#38bdf8", "to": "#0c4a6e", "emoji": "✨" },
 *     "highlights": ["..."],
 *     "howToPlay": ["..."],
 *     "levels": "20 levels",
 *     "saveKey": "star-trail-save-v1"
 *   }
 *
 * This is the server-side publishing path: it uses the Postgres connection and
 * therefore satisfies the admin-only RLS policy. A signed-in admin can also
 * write the same row from the browser through `@littlejoyarcade/sdk/admin`.
 */
import { readFile } from 'node:fs/promises'
import { lookup } from 'node:dns/promises'
import { Client } from 'pg'

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

const REQUIRED = ['id', 'name', 'tagline', 'description', 'playUrl']

function toRow(game) {
  return {
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
    downloads: JSON.stringify(game.downloads ?? []),
    updated_on: game.updated ?? null,
    manifest: JSON.stringify(game),
  }
}

const SQL = `
insert into public.games
  (id, name, description, status, featured, version, play_url, site_url, repo_url, categories,
   tagline, runtime, cover, highlights, how_to_play, levels, save_key, downloads, updated_on, manifest)
values
  ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18::jsonb,$19,$20::jsonb)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  status = excluded.status,
  featured = excluded.featured,
  version = excluded.version,
  play_url = excluded.play_url,
  site_url = excluded.site_url,
  repo_url = excluded.repo_url,
  categories = excluded.categories,
  tagline = excluded.tagline,
  runtime = excluded.runtime,
  cover = excluded.cover,
  highlights = excluded.highlights,
  how_to_play = excluded.how_to_play,
  levels = excluded.levels,
  save_key = excluded.save_key,
  downloads = excluded.downloads,
  updated_on = excluded.updated_on,
  manifest = excluded.manifest,
  updated_at = now()
`

async function main() {
  const client = await createClient()
  await client.connect()
  const argument = process.argv[2]

  if (!argument || argument === '--list') {
    const rows = await client.query(
      'select id, name, version, status, updated_on from public.games order by sort_order, name',
    )
    for (const row of rows.rows) {
      console.log(`${row.id.padEnd(20)} v${String(row.version).padEnd(8)} ${row.status} ${row.updated_on ?? ''}`)
    }
    await client.end()
    return
  }

  const manifest = JSON.parse(await readFile(argument, 'utf8'))
  const missing = REQUIRED.filter((key) => !manifest[key])
  if (missing.length > 0) throw new Error(`manifest is missing: ${missing.join(', ')}`)
  if (!/^[a-z0-9-]{2,40}$/.test(manifest.id)) throw new Error('id must be lowercase letters, digits and hyphens')

  const row = toRow(manifest)
  await client.query('begin')
  await client.query(SQL, [
    row.id, row.name, row.description, row.status, row.featured, row.version, row.play_url, row.site_url,
    row.repo_url, row.categories, row.tagline, row.runtime, row.cover, row.highlights, row.how_to_play,
    row.levels, row.save_key, row.downloads, row.updated_on, row.manifest,
  ])
  await client.query('commit')
  console.log(`published ${row.id} v${row.version} (${row.status})`)

  const verify = await client.query('select id, name, version, jsonb_array_length(downloads::jsonb) as links from public.games where id = $1', [row.id])
  console.log(verify.rows[0])
  await client.end()
}

main().catch(async (error) => {
  console.error('publish failed:', error.message)
  try {
    await client.query('rollback')
    await client.end()
  } catch {
    /* already closed */
  }
  process.exit(1)
})
