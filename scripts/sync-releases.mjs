#!/usr/bin/env node
/*
 * Sync game versions, dates and download links from GitHub releases.
 *
 *   GITHUB_TOKEN=$(gh auth token) npm run sync:releases
 *
 * Writes src/data/releases.json, which src/data/games.ts merges over the
 * hand-written catalogue at load time. This script never edits source code, so
 * a new release cannot damage descriptions, categories or layout.
 *
 * The scheduled workflow (.github/workflows/sync-releases.yml) runs it every six
 * hours; the resulting commit triggers CI and the Pages deploy.
 */
import { readFile, writeFile } from 'node:fs/promises'

const CATALOGUE = new URL('../src/data/games.ts', import.meta.url)
const OUTPUT = new URL('../src/data/releases.json', import.meta.url)
const API = 'https://api.github.com'
const OWNER = process.env.GITHUB_OWNER || 'jd4rider'
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || ''

const DOWNLOADS = [
  { suffix: '-mac-arm64.dmg', label: 'macOS (Apple Silicon)', platform: 'macOS' },
  { suffix: '-mac-x64.dmg', label: 'macOS (Intel)', platform: 'macOS' },
  { suffix: '-win-setup.exe', label: 'Windows installer', platform: 'Windows' },
  { suffix: '-linux-x86_64.AppImage', label: 'Linux AppImage', platform: 'Linux' },
]

function headers() {
  const out = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'littlejoyarcade-release-sync',
  }
  if (token) out.Authorization = `Bearer ${token}`
  return out
}

async function latestRelease(repository) {
  const response = await fetch(`${API}/repos/${OWNER}/${repository}/releases/latest`, { headers: headers() })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`${repository}: HTTP ${response.status} ${response.statusText}`)
  return response.json()
}

function downloadsFor(release) {
  const assets = (release.assets ?? []).filter((asset) => !asset.name.endsWith('.blockmap'))
  const downloads = []
  for (const wanted of DOWNLOADS) {
    const asset = assets.find((candidate) => candidate.name.toLowerCase().endsWith(wanted.suffix))
    if (!asset) continue
    downloads.push({
      label: wanted.label,
      platform: wanted.platform,
      url: asset.browser_download_url,
    })
  }
  return downloads
}

/** Pull `id` and `repoUrl: repo('slug')` pairs out of the catalogue. */
function games(source) {
  const found = []
  const pattern = /    id: '([a-z0-9-]+)',/g
  let match
  while ((match = pattern.exec(source)) !== null) {
    const objectStart = source.lastIndexOf('\n  {', match.index)
    const objectEnd = source.indexOf('\n  },', match.index)
    if (objectStart === -1 || objectEnd === -1) continue
    const block = source.slice(objectStart, objectEnd)
    const repository = block.match(/repoUrl: repo\('([^']+)'\)/)?.[1]
    if (repository) found.push({ id: match[1], repository })
  }
  return found
}

const source = await readFile(CATALOGUE, 'utf8')
const catalogued = games(source)
const existing = JSON.parse(await readFile(OUTPUT, 'utf8').catch(() => '{}'))

const releases = {}
const failures = []

for (const game of catalogued) {
  try {
    const release = await latestRelease(game.repository)
    if (process.env.SYNC_DEBUG) {
      console.log(`${game.id}: ${game.repository} -> ${release ? release.tag_name : 'no published release'}`)
    }
    if (!release) continue
    const version = String(release.tag_name ?? '').replace(/^v/, '')
    if (!/^\d+\.\d+\.\d+/.test(version)) {
      failures.push(`${game.id}: unexpected tag ${release.tag_name}`)
      continue
    }
    releases[game.id] = {
      version,
      updated: String(release.published_at ?? '').slice(0, 10),
      downloads: downloadsFor(release),
    }
  } catch (error) {
    failures.push(error.message)
  }
}

const before = JSON.stringify(existing)
const after = JSON.stringify(releases)
await writeFile(OUTPUT, `${JSON.stringify(releases, null, 2)}\n`)

const changed = catalogued.filter((game) => JSON.stringify(existing[game.id]) !== JSON.stringify(releases[game.id]))
if (before === after) {
  console.log(`Release data already current (${catalogued.length} games checked).`)
} else {
  console.log(`Refreshed ${changed.length} game(s) in src/data/releases.json:`)
  for (const game of changed) {
    const release = releases[game.id]
    console.log(`  ${game.id} -> ${release ? `v${release.version}` : 'removed'}`)
  }
}

if (failures.length > 0) {
  console.warn('\nSkipped:')
  for (const failure of failures) console.warn(`  ${failure}`)
}
