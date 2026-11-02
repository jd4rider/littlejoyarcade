#!/usr/bin/env node
/*
 * Little Joy Arcade game scaffolder.
 *
 *   node tools/create-game.mjs star-trail --name "Star Trail"
 *   node tools/create-game.mjs star-trail --name "Star Trail" --out ~/programming
 *
 * Creates a Phaser 4 + Vite + Electron project that already has:
 *   - the drop-in arcade client (sign-in panel, cloud saves)
 *   - a hash-free single-page build that works in Electron and on Pages
 *   - GitHub Pages deployment for <id>.littlejoyarcade.site
 *   - tag-triggered macOS, Windows and Linux installers
 *
 * Nothing is published for you: the generated README lists the git/gh steps,
 * so creating repositories or spending CI minutes stays a human decision.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const arcadeRoot = resolve(here, '..')

function parseArgs(argv) {
  const out = { id: '', name: '', out: resolve(arcadeRoot, '..'), force: false }
  const rest = []
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--name' || arg === '-n') out.name = argv[++i] ?? ''
    else if (arg === '--out' || arg === '-o') out.out = resolve(argv[++i] ?? out.out)
    else if (arg === '--force') out.force = true
    else if (arg === '--help' || arg === '-h') out.help = true
    else rest.push(arg)
  }
  out.id = (rest[0] ?? '').toLowerCase()
  if (!out.name && out.id) out.name = out.id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return out
}

function titleCase(value) {
  return value.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function pascal(value) {
  return value.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase())
}

function anonKey() {
  if (process.env.VITE_SUPABASE_ANON_KEY) return process.env.VITE_SUPABASE_ANON_KEY
  for (const candidate of [join(arcadeRoot, '.env.local'), join(arcadeRoot, '.env')]) {
    if (!existsSync(candidate)) continue
    const match = readFileSync(candidate, 'utf8').match(/^VITE_SUPABASE_ANON_KEY=(.+)$/m)
    if (match) return match[1].trim().replace(/^["']|["']$/g, '')
  }
  return ''
}

const args = parseArgs(process.argv.slice(2))

if (args.help || !args.id) {
  console.log(`Usage: node tools/create-game.mjs <game-id> [--name "Game Name"] [--out DIR] [--force]

  <game-id>   lowercase, hyphens allowed (used for the repo, save key and subdomain)
  --name      display name (default: derived from the id)
  --out       parent directory (default: the folder above this repo)
  --force     write into the target even if it already exists`)
  process.exit(args.help ? 0 : 1)
}

if (!/^[a-z0-9][a-z0-9-]{1,38}$/.test(args.id)) {
  console.error('Game id must be 2-40 characters: lowercase letters, digits and hyphens.')
  process.exit(1)
}

const target = join(args.out, args.id)
if (existsSync(target) && !args.force) {
  console.error(`${target} already exists. Pass --force to write into it anyway.`)
  process.exit(1)
}

const KEY = anonKey()
if (!KEY) {
  console.warn('! VITE_SUPABASE_ANON_KEY not found — the in-game sign-in panel will stay hidden until you add it.')
}

const gameKey = `${args.id}-save-v1`
const className = `${pascal(args.id)}Scene`

function write(relative, contents) {
  const path = join(target, relative)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, contents)
}

write(
  'package.json',
  JSON.stringify(
    {
      name: args.id,
      private: true,
      version: '0.1.0',
      description: `${args.name} — a Little Joy Arcade game.`,
      author: 'jd4rider',
      type: 'module',
      main: 'electron/main.cjs',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        lint: 'oxlint',
        preview: 'vite preview',
        start: 'npm run build && electron .',
        'dist:mac': 'vite build && electron-builder --mac',
        'dist:win': 'vite build && electron-builder --win nsis --x64',
        'dist:linux': 'vite build && electron-builder --linux AppImage',
      },
      dependencies: { phaser: '^4.2.1' },
      devDependencies: {
        electron: '^41.7.1',
        'electron-builder': '^26.18.0',
        oxlint: '^1.89.0',
        vite: '^6.3.5',
      },
      build: {
        appId: `com.jd4rider.${args.id.replace(/-/g, '')}`,
        productName: args.name,
        directories: { output: 'release', buildResources: 'build' },
        files: ['dist/**/*', 'electron/**/*', 'package.json'],
        mac: {
          category: 'public.app-category.puzzle-games',
          icon: 'build/icon.icns',
          artifactName: `${pascal(args.id)}-mac-\${arch}.\${ext}`,
          target: [{ target: 'dmg', arch: ['arm64', 'x64'] }],
        },
        dmg: { title: `${args.name} \${version}` },
        win: {
          icon: 'build/icon-1024.png',
          target: [{ target: 'nsis', arch: ['x64'] }],
        },
        nsis: {
          oneClick: false,
          allowToChangeInstallationDirectory: true,
          artifactName: `${pascal(args.id)}-win-setup.\${ext}`,
        },
        linux: {
          category: 'Game',
          icon: 'build/icon-1024.png',
          artifactName: `${pascal(args.id)}-linux-\${arch}.\${ext}`,
          target: ['AppImage'],
        },
      },
    },
    null,
    2,
  ) + '\n',
)

write(
  'index.html',
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
    <meta name="description" content="${args.name} — play free in your browser or download for macOS, Windows and Linux." />
    <meta name="theme-color" content="#0b1020" />
    <title>${args.name}</title>
    <style>
      html, body { margin: 0; height: 100%; background: #0b1020; overflow: hidden; touch-action: none; }
      #game { width: 100%; height: 100%; }
    </style>
  </head>
  <body>
    <div id="game"></div>
    <script type="module" src="/src/main.js"></script>
    <script src="./arcade-client.js" data-game-id="${args.id}"></script>
  </body>
</html>
`,
)

write('vite.config.js', `import { defineConfig } from 'vite'

// Relative paths work for file:// inside Electron and any GitHub Pages sub-path.
export default defineConfig({ base: './' })
`)

write(
  'src/main.js',
  `import Phaser from 'phaser'

// A deliberately small starter: collect the five sparks, then the game saves
// your best time. The arcade client mirrors the save into the player's account,
// so it follows them to another device with no extra code here.
const SAVE_KEY = '${gameKey}'

function loadSave() {
  try {
    return JSON.parse(localStorage.getItem(SAVE_KEY) || '{}')
  } catch {
    return {}
  }
}

function writeSave(next) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(next))
  } catch {
    /* private mode */
  }
}

class ${className} extends Phaser.Scene {
  constructor() {
    super('game')
    this.collected = 0
    this.sparks = []
    this.startedAt = 0
  }

  create() {
    const { width, height } = this.scale
    this.cameras.main.setBackgroundColor('#0b1020')
    this.add
      .text(width / 2, 34, '${args.name}', { fontFamily: 'system-ui, sans-serif', fontSize: '20px', color: '#f8fafc' })
      .setOrigin(0.5, 0)

    const best = loadSave().best
    this.hud = this.add
      .text(width / 2, 66, best ? 'Best: ' + best.toFixed(1) + 's' : 'Collect 5 sparks', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
        color: '#94a3b8',
      })
      .setOrigin(0.5, 0)

    for (let i = 0; i < 5; i += 1) {
      const spark = this.add.circle(
        Phaser.Math.Between(60, width - 60),
        Phaser.Math.Between(130, height - 70),
        14,
        0xfbbf24,
      )
      spark.setInteractive({ useHandCursor: true })
      spark.once('pointerdown', () => this.collect(spark))
      this.sparks.push(spark)
    }

    this.startedAt = this.time.now
  }

  collect(spark) {
    spark.destroy()
    this.collected += 1
    this.hud.setText(this.collected + ' / 5 sparks')
    if (this.collected < 5) return

    const seconds = (this.time.now - this.startedAt) / 1000
    const save = loadSave()
    if (!save.best || seconds < save.best) save.best = seconds
    save.played = (save.played || 0) + 1
    writeSave(save)
    this.hud.setText('Cleared in ' + seconds.toFixed(1) + 's — best ' + save.best.toFixed(1) + 's')
    this.time.delayedCall(1400, () => this.scene.restart())
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#0b1020',
  scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [${className}],
})
`,
)

write(
  'electron/main.cjs',
  `const { app, BrowserWindow, shell } = require('electron')
const path = require('node:path')

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 420,
    minHeight: 480,
    title: '${args.name}',
    backgroundColor: '#0b1020',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
    },
  })

  win.once('ready-to-show', () => win.show())
  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
`,
)

write(
  '.github/workflows/pages.yml',
  `name: Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - id: deployment
        uses: actions/deploy-pages@v4
`,
)

write(
  '.github/workflows/release.yml',
  `name: Release

on:
  push:
    tags: ['v*']
  workflow_dispatch:

permissions:
  contents: write

jobs:
  build:
    strategy:
      fail-fast: false
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]
    runs-on: \${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - name: Build installers
        run: npx electron-builder --publish never
      - uses: softprops/action-gh-release@v2
        with:
          files: |
            release/*.dmg
            release/*.exe
            release/*.AppImage
`,
)

write(
  'README.md',
  `# ${args.name}

A Phaser 4 game for [Little Joy Arcade](https://littlejoyarcade.site), generated by the arcade scaffolder.

## Run it

\`\`\`bash
npm install
npm run dev          # browser at http://localhost:5173
npm start            # Electron
npm run dist:mac     # DMG in release/
\`\`\`

## What is already wired

- **Account + cloud saves:** \`public/arcade-client.js\` adds a sign-in panel and
  mirrors the game's save into the player's Little Joy account. The game itself
  only reads and writes \`localStorage\`, so nothing else changes.
- **Web hosting:** \`.github/workflows/pages.yml\` builds and deploys on every push,
  and \`public/CNAME\` claims **${args.id}.littlejoyarcade.site**.
- **Installers:** \`.github/workflows/release.yml\` builds macOS, Windows and Linux
  artifacts whenever you push a \`v*\` tag.

## Publish it

\`\`\`bash
git init && git add -A && git commit -m "Initial ${args.name}"
gh repo create jd4rider/${args.id} --public --source=. --push
\`\`\`

Then, once Pages has built:

1. Add a GoDaddy CNAME: \`${args.id}\` → \`jd4rider.github.io\`.
2. Set the repo's Pages custom domain to \`${args.id}.littlejoyarcade.site\`.
3. Add the game to \`littlejoyarcade/src/data/games.ts\` and insert a \`games\`
   row (the cloud save needs that foreign key).

## The save contract

This starter stores \`{ best, played }\` under \`${gameKey}\`. Keep it JSON and
bump the key (or add a migration step) if the shape changes badly enough that
old saves cannot be read.
`,
)

write(
  '.gitignore',
  `node_modules/
dist/
release/
.DS_Store
*.log
`,
)

write('public/CNAME', `${args.id}.littlejoyarcade.site\n`)

write(
  'public/favicon.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0b1020"/><circle cx="24" cy="26" r="8" fill="#fbbf24"/><circle cx="42" cy="40" r="8" fill="#22d3ee"/><path d="M24 34v10h18" stroke="#f8fafc" stroke-width="3" fill="none" stroke-linecap="round"/></svg>
`,
)

const clientSource = join(arcadeRoot, 'packages/sdk/desktop/arcade-client.js')
if (existsSync(clientSource)) {
  mkdirSync(join(target, 'public'), { recursive: true })
  writeFileSync(
    join(target, 'public/arcade-client.js'),
    readFileSync(clientSource, 'utf8').replace('__LJA_ANON_KEY__', KEY || '__LJA_ANON_KEY__'),
  )
} else {
  console.warn('! arcade-client.js not found; copy it from the arcade SDK before shipping.')
}

console.log(`\nCreated ${target}`)
console.log(`  game id: ${args.id}  (${args.name})`)
console.log('  next: cd ' + target + ' && npm install && npm run dev')
console.log('  publish steps: see README.md\n')
