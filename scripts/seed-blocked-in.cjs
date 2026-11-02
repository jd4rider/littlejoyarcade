/*
 * One-off catalogue seed for Blocked In.
 *
 *   source .secrets/supabase.env
 *   NODE_PATH=/tmp/lja-db/node_modules SUPABASE_DB_PASSWORD=... node scripts/seed-blocked-in.cjs
 *
 * Uses the Postgres connection directly because the project has no service-role
 * key on this machine. Migrations are still the source of truth; this exists so
 * the live catalogue matches them without a psql install.
 */
const { Client } = require('pg')

const client = new Client({
  host: 'db.fqovramltegcfiyebyrt.supabase.co',
  port: 5432,
  user: 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
})

const statements = [
  `insert into public.games (id, name, description, status, play_url, site_url, repo_url, categories, version)
   values ('blocked-in', 'Blocked In',
     'A sliding-block puzzle: free the red key block. Spinners, magnets and moving exits.',
     'live', 'https://jd4rider.github.io/blocked-in/play/', 'https://jd4rider.github.io/blocked-in/',
     'https://github.com/jd4rider/blocked-in', array['Puzzle','Logic','Brain Training'], '0.1.0')
   on conflict (id) do update set name = excluded.name, version = excluded.version`,
  `insert into public.achievements (id, game_id, name, description, points) values
     ('blocked-in.first_clear', 'blocked-in', 'Out of the Workshop', 'Clear your first board.', 10),
     ('blocked-in.three_stars', 'blocked-in', 'Clean Slide', 'Finish a board under par.', 15),
     ('blocked-in.completionist', 'blocked-in', 'Master Locksmith', 'Clear every workshop.', 50)
   on conflict (id) do nothing`,
]

async function main() {
  await client.connect()
  for (const sql of statements) await client.query(sql)
  const games = await client.query('select count(*)::int as n from public.games')
  const achievements = await client.query("select count(*)::int as n from public.achievements where game_id = 'blocked-in'")
  console.log(`games: ${games.rows[0].n}, blocked-in achievements: ${achievements.rows[0].n}`)
  await client.end()
}

main().catch((error) => {
  console.error('DB error:', error.message)
  process.exit(1)
})
