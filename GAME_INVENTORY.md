# Game inventory

Discovered by scanning the local development folder and the GitHub account, cross-checked against each
game's `package.json`, README and live deployment. Ten games: nine Phaser, one React (Bubble Wrap).

Inventory date: 2 November 2026.

## Summary

| # | Game | Local folder | Repo | Runtime | Web build | Desktop | Live check |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Bubble Wrap | `fun-react-app/` | `jd4rider/bubble-wrap` | React 19 | `bubblewrapgame.online/play/` | macOS, Windows | 200 OK |
| 2 | Pipe Dreams | `pipe-dreams/` | `jd4rider/pipe-dreams` | Phaser 4 | `jd4rider.github.io/pipe-dreams/play/` | buildable, no release | 200 OK |
| 3 | Jewel Match | `jewel-match/` | `jd4rider/jewel-match` | Phaser 4 | `jd4rider.github.io/jewel-match/play/` | buildable, no release | 200 OK |
| 4 | Pixel Stitch | `pixel-stitch/` | `jd4rider/pixel-stitch` | Phaser 4 | `jd4rider.github.io/pixel-stitch/play/` | macOS, Windows, Linux | 200 OK |
| 5 | Sand Sort Studio | `sand-sort-studio/` | `jd4rider/sand-sort-studio` | Phaser 4 | `jd4rider.github.io/sand-sort-studio/play/` | buildable, no release | 200 OK |
| 6 | Lighthouse Keeper | `lighthouse-keeper/` | `jd4rider/lighthouse-keeper` | Phaser 4 | `jd4rider.github.io/lighthouse-keeper/play/` | macOS, Windows, Linux | 200 OK |
| 7 | Laser Logic | `laser-logic/` | `jd4rider/laser-logic` | Phaser 4 | `jd4rider.github.io/laser-logic/play/` | buildable, no release | 200 OK |
| 8 | Circuit Crafter | `circuit-crafter/` | `jd4rider/circuit-crafter` | Phaser 4 | `jd4rider.github.io/circuit-crafter/play/` | macOS, Windows, Linux | 200 OK |
| 9 | Rumble Rally | `rumble-rally/` | `jd4rider/rumble-rally` | Phaser 4 | `jd4rider.github.io/rumble-rally/play/` | buildable, no release | 200 OK |
| 10 | Whisker Grid | `whisker-grid/` | `jd4rider/whisker-grid` | Phaser 4 | `jd4rider.github.io/whisker-grid/play/` | buildable, no release | 200 OK |

Every GitHub-Pages game also has a custom subdomain (`<repo>.littlejoyarcade.site`) configured through GoDaddy
CNAMEs and GitHub Pages custom domains. See the certificate note at the end of this file.

Not in the catalogue: `Bible/`, `Unreal_Udemy/`, `learning-godot/`, `godot-multiplayer/`, `3d-rpg/`,
`iron-outpost-*`, `GamedevTV/`, `test/`, `TEST output/` — course projects, Godot/Unreal work and backups,
not casual browser games. They were left untouched.

## Per-game detail

### 1. Bubble Wrap

- **Description:** a 12 × 9 bubble-wrap sheet with a satisfying pop; Classic mode plus a five-level Journey.
- **Framework:** React 19 + Vite; Electron 41 for desktop.
- **Build/dev:** `npm run dev`, `npm run build`, `npm run build:web` (outputs `docs/play`), `npm run dist:mac`,
  `npm run dist:win`. Hosting is GitHub Pages from `docs/`, so the site and the game live in one repo.
- **Working:** yes — live at <https://bubblewrapgame.online/play/>, desktop installers attached to v0.2.0.
- **Progress:** Journey stars/coins/unlocks. Web uses IndexedDB with a localStorage fallback
  (`bubble-wrap-save-v2`); desktop stores JSON/SQLite-backed state in the Electron user-data folder.
- **Monetization:** AdSense publisher tag `ca-pub-8675744307100993` on the site (awaiting approval); an ad-free
  checkout button is present but disabled until a checkout URL is configured. No ad unit slot ID yet.
- **Desktop/mobile:** both; haptic pops via the Vibration API on supporting phones.
- **Downloads:** <https://github.com/jd4rider/bubble-wrap/releases/tag/v0.2.0> (mac arm64/x64 dmg, Windows NSIS).
  Also a Homebrew cask in `jd4rider/homebrew-bubble-wrap` and a winget manifest PR.
- **Subdomain:** `bubblewrap.littlejoyarcade.site` (currently `bubblewrapgame.online` — kept as-is).

### 2. Pipe Dreams

- **Description:** rotate pipes to guide water from IN to OUT; 60 levels across five worlds plus a 90-second Rush.
- **Framework:** Phaser 4 + Vite + Electron. **Build:** `npm run build`, `dist:mac|win|linux`.
- **Working:** yes. **Progress:** `localStorage` key `pipe-dreams-save-v1` (`unlocked`, `stars`, `bestRush`, `muted`).
- **Monetization:** none. **Desktop/mobile:** responsive Phaser scale manager; desktop packaging configured but no
  tagged release yet. **Downloads:** none published. **Subdomain:** `pipes.littlejoyarcade.site`.

### 3. Jewel Match

- **Description:** match-3 with line gems, bombs, stars and rainbows; Journey (48 levels, six regions), Classic,
  Timed Blitz and Zen; five power-ups.
- **Framework:** Phaser 4 + Vite + Electron. **Progress:** `jewel-match-save-v2`.
- **Working:** yes (freeze-on-level-complete fixed in v0.3.1). **Monetization:** none.
- **Downloads:** none published. **Subdomain:** `jewels.littlejoyarcade.site`.

### 4. Pixel Stitch

- **Description:** nonogram with 24 starter pictures across four packs, verified solvable by line logic, plus a
  paint-and-share editor with `PS1…` share codes.
- **Framework:** Phaser 4 + Vite + Electron. **Progress:** `pixel-stitch-save-v1` (solved puzzles, saved designs).
- **Working:** yes. **Monetization:** none. **Desktop:** macOS/Windows/Linux builds attached to v0.1.0.
- **Downloads:** <https://github.com/jd4rider/pixel-stitch/releases/tag/v0.1.0>.
- **Subdomain:** `pixelstitch.littlejoyarcade.site`.

### 5. Sand Sort Studio

- **Description:** water-sort-style sand pouring; 60 levels across five worlds, twin flasks, padlocked flasks,
  colour-changing chameleon sand, plus a 120-second Rush.
- **Framework:** Phaser 4 + Vite + Electron. **Progress:** `sand-sort-save-v1`.
- **Working:** yes (ghost-sand fix in v0.1.1). **Monetization:** none. **Downloads:** none published.
- **Subdomain:** `sandsort.littlejoyarcade.site`.

### 6. Lighthouse Keeper

- **Description:** rotate lighthouses, flip mirrors and tint lenses to light coloured buoys while keeping
  forbidden reefs dark; 24 stations over four coasts.
- **Framework:** Phaser 4 + Vite + Electron. **Progress:** `lighthouse-keeper-save-v1`.
- **Working:** yes. **Monetization:** none. **Desktop:** macOS/Windows/Linux builds at v0.1.0.
- **Subdomain:** `lighthouse.littlejoyarcade.site`.

### 7. Laser Logic

- **Description:** steer laser beams with mirrors, colour filters, splitters and prisms; 60 Journey levels plus
  a 120-second Rush.
- **Framework:** Phaser 4 + Vite + Electron. **Progress:** `laser-logic-save-v1`.
- **Working:** yes. **Monetization:** none. **Downloads:** none published.
- **Subdomain:** `lasers.littlejoyarcade.site`.

### 8. Circuit Crafter

- **Description:** a real fixed-point circuit simulation behind 24 puzzle boards — batteries, rotatable wires,
  switches, AND/OR gates, pulsing timers, light sensors, lamps and fuses.
- **Framework:** Phaser 4 + Vite + Electron. **Progress:** `circuit-crafter-save-v1`.
- **Working:** yes; levels are re-simulated in the test suite. **Monetization:** none.
- **Desktop:** macOS/Windows/Linux builds attached to v0.1.0.
- **Subdomain:** `circuitcrafter.littlejoyarcade.site`.

### 9. Rumble Rally

- **Description:** a physics driving puzzle. Roll over ramps, gaps and crates to the flag; the same controls
drive on the ground and tilt in the air.
- **Framework:** Phaser 4 + Vite + Electron. **Progress:** `localStorage` key `rumblerally-save-v1`.
- **Content:** 200 seeded courses across five worlds, three stars each, keyboard and touch controls.
- **Working:** yes. **Monetization:** none. **Downloads:** none published yet.
- **Subdomain:** `rumble-rally.littlejoyarcade.site`.

### 10. Whisker Grid

- **Description:** a cat logic puzzle — exactly one cat per colour region, row and column, and no two cats may
touch (diagonals count).
- **Framework:** Phaser 4 + Vite + Electron. **Progress:** `localStorage` key `whiskergrid-save-v1`.
- **Content:** 1000 seeded Journey levels (4–9 colours), Rush mode, Hint/Reveal/Mouse power-ups, drag marking.
- **Working:** yes. **Monetization:** none. **Downloads:** none published yet.
- **Subdomain:** `whisker-grid.littlejoyarcade.site`.

## Subdomain status

DNS CNAMEs and GitHub Pages custom domains are configured for all nine Pages-hosted games. GitHub serves the
`*.github.io` certificate until it finishes issuing per-domain certificates, so HTTP works immediately and HTTPS
works once GitHub completes provisioning (`https_enforced` is still false). Bubble Wrap keeps
`bubblewrapgame.online`; GitHub Pages allows only one custom domain per site.

## What was preserved

No game repository was modified, rebuilt or redeployed as part of building the portal. Every game keeps its
own deployment, save keys and desktop pipeline. The portal links to the existing live builds, so nothing in
this project can break a game that is already published.
