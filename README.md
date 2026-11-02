# Little Joy Arcade

A small, polished home for hand-made casual games — plus the shared SDK, database schema and deployment
tooling that lets the collection grow without rebuilding the platform each time.

- **Portal:** <https://jd4rider.github.io/littlejoyarcade/>
- **Custom domain target:** <https://littlejoyarcade.site> (DNS records pending — see `DNS_CONFIGURATION.md`)
- **Games in the catalogue:** 8 (Bubble Wrap, Pipe Dreams, Jewel Match, Pixel Stitch, Sand Sort Studio,
  Lighthouse Keeper, Laser Logic, Circuit Crafter)

## What is here

| Path | What it is |
| --- | --- |
| `src/` | The portal: React 19 + TypeScript + Vite + Tailwind CSS 4 |
| `packages/sdk/` | `@littlejoyarcade/sdk` — auth, progress, achievements, entitlements, analytics, adapters |
| `supabase/migrations/` | PostgreSQL schema, row level security and seed data |
| `*.md` at the root | Architecture, inventory, database, deployment, DNS, SDK, monetization, security, roadmap |
| `.github/workflows/` | CI (typecheck, lint, tests, build) and Pages deployment |

Game repositories stay independent. The portal links to each game's existing deployment, so a new game
version ships from its own repo without touching this one.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck
npm run lint
npm test
npm run build
```

Node 20.19+ or 22+ is required by Vite 8 in the game repos; this repo pins Vite 6 so Node 20.18 works too.

## Backend (optional)

Guest play and local saves work with no backend. Accounts, cloud saves, achievements, entitlements and the
admin area activate when these public build variables exist:

```bash
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

Never put a service-role key in this project. See `DEPLOYMENT.md` and `SECURITY.md`.

## Routing

The portal uses hash routes (`/#/game/pipe-dreams`) so it works identically on GitHub Pages, Cloudflare Pages
and inside Electron without rewrite rules. Game pages themselves are served from each game's own origin.

## Status

Working and verified: the catalogue, search and filters, game detail pages, embedded play shell, guest
dashboard with local achievements and data export, responsive layout, CI, Pages deployment.

Built but waiting on credentials: Supabase accounts, cloud saves, entitlements, storefront and the owner
admin area (schema and RLS are written; the deployed build has no backend keys yet).

Not started: per-game SDK wiring inside the eight game repos, payment provider checkout, AdSense units,
Capacitor mobile builds. `ROADMAP.md` lists the order.
