# Little Joy Arcade

A small, polished home for hand-made casual games — plus the shared SDK, database schema and deployment
tooling that lets the collection grow without rebuilding the platform each time.

- **Preview (live now):** <https://jd4rider.github.io/littlejoyarcade/>
- **Production target:** Vercel + Supabase at <https://littlejoyarcade.site> (project import and DNS cutover pending — see `DEPLOYMENT.md` and `DNS_CONFIGURATION.md`)
- **Games in the catalogue:** 8 (Bubble Wrap, Pipe Dreams, Jewel Match, Pixel Stitch, Sand Sort Studio,
  Lighthouse Keeper, Laser Logic, Circuit Crafter)

## What is here

| Path | What it is |
| --- | --- |
| `src/` | The portal: React 19 + TypeScript + Vite + Tailwind CSS 4 |
| `packages/sdk/` | `@littlejoyarcade/sdk` — auth, progress, achievements, entitlements, analytics, adapters |
| `supabase/migrations/` | PostgreSQL schema, row level security and seed data |
| `*.md` at the root | Architecture, inventory, database, deployment, DNS, SDK, monetization, security, roadmap |
| `.github/workflows/` | CI (typecheck, lint, tests, build) and Pages preview deployment |
| `vercel.json` | Vercel build settings, caching and security headers |

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

Vercel hosts the app; the database and login live in Supabase. Guest play and local saves work with no backend.
Accounts, cloud saves, achievements, entitlements and the admin area activate when these public build variables
exist (Vercel → Settings → Environment Variables, then redeploy):

```bash
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

Never put a service-role key in this project. See `DEPLOYMENT.md` and `SECURITY.md`.

## Make it a full app (Vercel + Supabase)

Vercel hosts the app; Supabase provides the database and login. `vercel.json` already configures the build, so
importing the repository is enough:

1. **Import** the repo at <https://vercel.com/new> (framework and output are detected).
2. **Create the database:** add Supabase from Vercel's Marketplace, or create a free project at supabase.com.
3. **Apply the schema:** `npx supabase link --project-ref <ref> && npx supabase db push`.
4. **Set env vars** in Vercel → Settings → Environment Variables for Production and Preview:
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — then redeploy.
5. **Connect the domain:** add it in Vercel → Domains, then replace the GoDaddy parking records with the values
   Vercel shows.

Full runbook: `DEPLOYMENT.md`. DNS records and verification: `DNS_CONFIGURATION.md`.

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
