// Copies the generated release data (src/data/releases.json) into public.games
// so the database-driven catalogue and the bundled one never disagree.
//
//   set -a && . ./.secrets/supabase.env && set +a && node scripts/push-versions-to-db.cjs
const { lookup } = require('node:dns/promises')
const { Client } = require('pg')
const releases = require('../src/data/releases.json')

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
  for (const [id, info] of Object.entries(releases)) {
    await client.query(
      `update public.games
          set version = $2,
              updated_at = now(),
              downloads = $3::jsonb,
              manifest = jsonb_set(jsonb_set(coalesce(manifest, '{}'::jsonb), '{version}', to_jsonb($2::text)), '{downloads}', $3::jsonb)
        where id = $1`,
      [id, info.version, JSON.stringify(info.downloads)],
    )
  }
  const rows = await client.query('select id, version from public.games order by sort_order')
  console.table(rows.rows)
  await client.end()
})().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
