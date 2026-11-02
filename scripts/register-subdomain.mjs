#!/usr/bin/env node
/*
 * Register (or repair) a game subdomain with one command.
 *
 *   GODADDY_PAT=gd_pat_... node scripts/register-subdomain.mjs star-trail \
 *     --target jd4rider.github.io
 *
 *   GODADDY_PAT=gd_pat_... node scripts/register-subdomain.mjs star-trail \
 *     --target star-trail-lja.web.app --repo jd4rider/star-trail
 *
 * What it does, idempotently:
 *   1. Writes a CNAME `<game>.littlejoyarcade.site` at GoDaddy, preserving every
 *      other record in the zone.
 *   2. Optionally claims the hostname on the game's GitHub Pages site.
 *   3. Prints the DNS answer so you can confirm propagation.
 *
 * The GoDaddy token is read from the environment and never written to disk.
 * Docs: docs/SDK.md#subdomain-automation
 */
import { lookup } from 'node:dns/promises'
import { execFileSync } from 'node:child_process'

const args = process.argv.slice(2)
const game = args.find((arg) => !arg.startsWith('--'))
const flag = (name, fallback) => {
  const index = args.indexOf(`--${name}`)
  return index === -1 ? fallback : args[index + 1]
}

const DOMAIN = flag('domain', 'littlejoyarcade.site')
const TARGET = flag('target', 'jd4rider.github.io')
const REPO = flag('repo', '')
const TTL = Number(flag('ttl', '600'))
const TOKEN = process.env.GODADDY_PAT
const CONFIRM = flag('confirm', '') === 'true' || process.env.CONFIRM === 'yes'

if (!game || !/^[a-z0-9][a-z0-9-]{1,38}$/.test(game)) {
  console.error('Usage: GODADDY_PAT=... node scripts/register-subdomain.mjs <game-id> [--target host] [--repo owner/name]')
  process.exit(1)
}
if (!TOKEN) {
  console.error('Set GODADDY_PAT to a GoDaddy personal access token (with DNS edit scope).')
  process.exit(1)
}

const host = `${game}.${DOMAIN}`
const api = `https://api.godaddy.com/v1/domains/${DOMAIN}`
const headers = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: 'application/json',
  'Content-Type': 'application/json',
}

if (!CONFIRM) {
  console.log(`Would point ${host} -> ${TARGET} (ttl ${TTL}).`)
  console.log('Re-run with CONFIRM=yes (or --confirm true) to apply.')
  process.exit(0)
}

const response = await fetch(`${api}/records/CNAME/${encodeURIComponent(game)}`, {
  method: 'PUT',
  headers,
  body: JSON.stringify([{ data: TARGET, ttl: TTL }]),
})
if (!response.ok) {
  console.error(`GoDaddy rejected the record: HTTP ${response.status} ${await response.text()}`)
  process.exit(1)
}
console.log(`GoDaddy: ${host} -> ${TARGET}`)

if (REPO) {
  try {
    execFileSync(
      'gh',
      ['api', '-X', 'PUT', `repos/${REPO}/pages`, '-f', `cname=${host}`],
      { stdio: 'inherit' },
    )
    console.log(`GitHub Pages: ${REPO} claims ${host}`)
  } catch {
    console.warn(`GitHub Pages: could not set the custom domain for ${REPO} (is Pages enabled?)`)
  }
}

for (let attempt = 1; attempt <= 6; attempt += 1) {
  try {
    const records = await lookup(host, { family: 4 })
    if (records?.address) {
      console.log(`DNS: ${host} -> ${records.address}`)
      break
    }
  } catch {
    console.log(`DNS: waiting for ${host} (attempt ${attempt}/6)`)
  }
  await new Promise((resolve) => setTimeout(resolve, 10000))
}
