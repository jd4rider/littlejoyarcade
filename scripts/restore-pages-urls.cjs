// Restores catalogue play/site URLs to GitHub Pages (the games' real home).
const { lookup } = require('node:dns/promises')
const { Client } = require('pg')

const IDS = [
  'jewel-match',
  'pipe-dreams',
  'pixel-stitch',
  'sand-sort-studio',
  'lighthouse-keeper',
  'laser-logic',
  'circuit-crafter',
  'rumble-rally',
  'whisker-grid',
  'blocked-in',
]

;(async () => {
  const { address } = await lookup('aws-0-us-west-1.pooler.supabase.com', { family: 4 })
  const client = new Client({
    host: address,
    port: 5432,
    user: 'postgres.fqovramltegcfiyebyrt',
    password: process.env.SUPABASE_DB_PASSWORD,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
  })
  await client.connect()

  const apply = async (id, play, site) => {
    await client.query(
      `update public.games
          set play_url = $2,
              site_url = $3,
              manifest = jsonb_set(jsonb_set(coalesce(manifest, '{}'::jsonb), '{playUrl}', to_jsonb($2::text)), '{siteUrl}', to_jsonb($3::text)),
              updated_at = now()
        where id = $1`,
      [id, play, site],
    )
  }

  for (const id of IDS) {
    await apply(id, `https://jd4rider.github.io/${id}/play/`, `https://jd4rider.github.io/${id}/`)
  }
  await apply('bubblewrap', 'https://bubblewrapgame.online/play/', 'https://bubblewrapgame.online/')

  const rows = await client.query('select id, play_url from public.games order by sort_order')
  console.table(rows.rows)
  await client.end()
})().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
